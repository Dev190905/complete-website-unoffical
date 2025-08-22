import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import type { Story, Topic } from '../types';
import StoryViewer from '../components/StoryViewer';
import AddStoryModal from '../components/AddStoryModal';
import { marked } from 'marked';
import SkeletonLoader from '../components/SkeletonLoader';

// Icons
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/></svg>;
const CommentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>;
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M22 12l-4-4v3H3v2h15v3l4-4z"/></svg>;

const StoryBubble: React.FC<{ user: { id: string, name: string, avatarUrl?: string }, hasUnreadStory: boolean, onClick: () => void, isCurrentUser?: boolean }> = ({ user, hasUnreadStory, onClick, isCurrentUser = false }) => (
    <div className="flex flex-col items-center flex-shrink-0 w-20 text-center cursor-pointer group" onClick={onClick}>
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center p-0.5 ${hasUnreadStory ? 'story-bubble-gradient' : 'bg-[#2d2d2d]'}`}>
            <div className="bg-[#121212] p-0.5 rounded-full">
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover" />
            </div>
             {isCurrentUser && ( <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-[#121212]"><span className="text-white font-bold text-lg leading-none pb-0.5">+</span></div> )}
        </div>
        <p className="text-xs text-gray-400 mt-1.5 truncate group-hover:text-white">{isCurrentUser ? 'Your Story' : user.name.split(' ')[0]}</p>
    </div>
);

const FeedCard: React.FC<{ topic: Topic }> = ({ topic }) => {
    return (
        <div className="feed-card rounded-lg overflow-hidden">
            <div className="p-3 flex items-center space-x-3">
                <img src={topic.author.avatarUrl} alt={topic.author.name} className="w-9 h-9 rounded-full" />
                <span className="font-semibold text-sm text-white">{topic.author.username}</span>
            </div>
            <div className="w-full aspect-square feed-card-image flex items-center justify-center">
                 <p className="text-gray-500">Visual Content Placeholder</p>
            </div>
            <div className="p-3">
                <div className="flex items-center space-x-4 mb-2">
                     <button className="text-gray-200 hover:text-gray-400 transition-colors"><HeartIcon /></button>
                     <Link to={`/forum/${topic.id}`} className="text-gray-200 hover:text-gray-400 transition-colors"><CommentIcon /></Link>
                     <button className="text-gray-200 hover:text-gray-400 transition-colors"><ShareIcon /></button>
                </div>
                 <p className="text-sm text-white">
                    <span className="font-semibold">{topic.author.username}</span>
                    <span className="text-gray-300 ml-1.5">{topic.title}</span>
                 </p>
                 <Link to={`/forum/${topic.id}`} className="text-xs text-gray-500 mt-1 block">View all {topic.replies.length} comments</Link>
            </div>
        </div>
    )
}

const HomePage: React.FC = () => {
    const { user, topics, stories, allUsers, getPersonalizedFeed } = useAuth();
    const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
    const [selectedStoryUserIndex, setSelectedStoryUserIndex] = useState(0);
    const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'following' | 'forYou'>('following');
    const [feedContent, setFeedContent] = useState('');
    const [isFeedLoading, setIsFeedLoading] = useState(false);

    const fetchFeed = useCallback(async () => {
        setIsFeedLoading(true);
        try {
            const content = await getPersonalizedFeed();
            setFeedContent(content);
        } catch (e) {
            console.error(e);
            setFeedContent('### Error\nCould not load your personalized feed at this moment. Please try again later.');
        } finally {
            setIsFeedLoading(false);
        }
    }, [getPersonalizedFeed]);

    useEffect(() => {
        if (activeTab === 'forYou') {
            fetchFeed();
        }
    }, [activeTab, fetchFeed]);

    const storiesByUser = useMemo(() => {
        if (!user) return [];
        const friendIds = new Set(user.friends);
        const userStories = stories.filter(s => s.userId === user.id);
        const friendStories = stories.filter(s => friendIds.has(s.userId));
        const grouped = [...userStories, ...friendStories].reduce((acc, story) => {
            if (!acc[story.userId]) { acc[story.userId] = []; }
            acc[story.userId].push(story);
            return acc;
        }, {} as Record<string, Story[]>);
        const orderedUserIds = [user.id, ...user.friends].filter(id => grouped[id]);
        return orderedUserIds.map(userId => ({ userId, stories: grouped[userId] }));
    }, [stories, user]);
    
    const openStoryViewer = (index: number) => {
        setSelectedStoryUserIndex(index);
        setIsStoryViewerOpen(true);
    };
    
    if (!user) return null;

    return (
        <div className="max-w-lg mx-auto">
            {isStoryViewerOpen && <StoryViewer storyGroups={storiesByUser} initialUserIndex={selectedStoryUserIndex} onClose={() => setIsStoryViewerOpen(false)} />}
            {isAddStoryModalOpen && <AddStoryModal onClose={() => setIsAddStoryModalOpen(false)} />}

            {/* Stories */}
            <div className="mb-4">
                <div className="flex space-x-4 overflow-x-auto p-3 -mx-3 scrollbar-thin">
                    <StoryBubble user={{ id: user.id, name: user.name, avatarUrl: user.avatarUrl }} hasUnreadStory={false} onClick={() => setIsAddStoryModalOpen(true)} isCurrentUser={true}/>
                    {storiesByUser.filter(group => group.userId !== user.id).map((group) => {
                        const author = allUsers.find(u => u.id === group.userId);
                        if (!author) return null;
                        const hasUnread = group.stories.some(s => !s.viewedBy.includes(user.id));
                        const groupIndex = storiesByUser.findIndex(g => g.userId === author.id);
                        return ( <StoryBubble key={author.id} user={author} hasUnreadStory={hasUnread} onClick={() => openStoryViewer(groupIndex)} /> )
                    })}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-4 border-b border-[#2d2d2d]">
                <button onClick={() => setActiveTab('following')} className={`w-1/2 py-3 font-semibold transition-colors ${activeTab === 'following' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}>Following</button>
                <button onClick={() => setActiveTab('forYou')} className={`w-1/2 py-3 font-semibold transition-colors ${activeTab === 'forYou' ? 'text-white border-b-2 border-white' : 'text-gray-500 hover:text-gray-300'}`}>For You</button>
            </div>
            
            {/* Feed Content */}
            {activeTab === 'following' ? (
                <div className="space-y-4 animate-fade-in">
                    {[...topics].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(topic => <FeedCard key={topic.id} topic={topic} />)}
                </div>
            ) : (
                <div className="p-4 bg-[#1c1c1c] border border-[#2d2d2d] rounded-lg animate-fade-in">
                    {isFeedLoading ? (
                        <div className="space-y-4">
                           <SkeletonLoader className="h-8 w-3/4 rounded-lg" />
                           <SkeletonLoader className="h-4 w-full rounded-lg" />
                           <SkeletonLoader className="h-4 w-5/6 rounded-lg" />
                        </div>
                    ) : (
                        <div
                            className="prose"
                            dangerouslySetInnerHTML={{ __html: marked.parse(feedContent) }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default HomePage;