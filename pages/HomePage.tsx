import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import type { Notice, Event, Resource, Story, Topic } from '../types';
import StoryViewer from '../components/StoryViewer';
import AddStoryModal from '../components/AddStoryModal';
import SkeletonLoader from '../components/SkeletonLoader';

// Icons for Feed Items
const IconNotice = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>;
const IconEvent = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>;
const IconForum = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path></svg>;
const HeartIcon = ({ filled }: { filled: boolean }) => <svg viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${filled ? 'text-red-500' : 'text-slate-500'}`}><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>;


type FeedItemType = (Notice & { itemType: 'notice' }) | (Event & { itemType: 'event' }) | (Topic & { itemType: 'topic' });

const FeedItem: React.FC<{ item: FeedItemType }> = ({ item }) => {
    const { user, toggleTopicLike } = useAuth();
    let icon, title, subtitle, link, details;

    switch (item.itemType) {
        case 'notice':
            icon = <IconNotice />;
            title = `New Notice: ${item.title}`;
            subtitle = `Posted by ${item.postedBy}`;
            link = '/notices';
            details = item.description;
            break;
        case 'event':
            icon = <IconEvent />;
            title = `Upcoming Event: ${item.title}`;
            subtitle = `Organized by ${item.organizer}`;
            link = '/events';
            details = `${new Date(item.date).toLocaleDateString()} - ${item.description}`;
            break;
        case 'topic':
            icon = <IconForum />;
            title = `New Forum Topic: ${item.title}`;
            subtitle = `Started by ${item.author.name}`;
            link = `/forum/${item.id}`;
            details = item.description;
            break;
    }

    const handleLikeClick = (e: React.MouseEvent) => {
        if (item.itemType === 'topic') {
            e.preventDefault(); // Prevent navigation when liking
            e.stopPropagation();
            toggleTopicLike(item.id);
        }
    };

    return (
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 transition-all duration-300 card-hover-effect">
            <Link to={link} className="block">
                <div className="flex items-start space-x-3">
                    <div className="bg-slate-700 p-2 rounded-full text-teal-400">{icon}</div>
                    <div className="flex-1">
                        <p className="font-semibold text-white">{title}</p>
                        <p className="text-sm text-slate-400">{subtitle}</p>
                        <p className="text-sm text-slate-300 mt-2 line-clamp-2">{details}</p>
                    </div>
                </div>
            </Link>
            {item.itemType === 'topic' && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center">
                    <button onClick={handleLikeClick} className="flex items-center space-x-2 text-sm text-slate-400 hover:text-red-500 transition-colors">
                        <HeartIcon filled={user ? item.likes.includes(user.id) : false} />
                        <span>{item.likes.length} Likes</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const StoryBubble: React.FC<{
    user: { id: string, name: string, avatarUrl?: string },
    hasUnreadStory: boolean,
    onClick: () => void,
    isCurrentUser?: boolean
}> = ({ user, hasUnreadStory, onClick, isCurrentUser = false }) => (
    <div className="flex flex-col items-center flex-shrink-0 w-20 text-center cursor-pointer group" onClick={onClick}>
        <div className={`relative w-16 h-16 rounded-full flex items-center justify-center p-1 bg-gradient-to-tr ${hasUnreadStory ? 'from-yellow-400 via-red-500 to-purple-600' : 'from-slate-700 to-slate-600'}`}>
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-slate-900" />
            {isCurrentUser && (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                    <span className="text-white font-bold text-lg">+</span>
                </div>
            )}
        </div>
        <p className="text-xs text-slate-300 mt-1 truncate group-hover:text-white">{isCurrentUser ? 'Your Story' : user.name.split(' ')[0]}</p>
    </div>
);

const HomePage: React.FC = () => {
    const { user, loading, notices, events, topics, stories, allUsers } = useAuth();
    
    const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
    const [selectedStoryUserIndex, setSelectedStoryUserIndex] = useState(0);
    const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);

    const storiesByUser = useMemo(() => {
        if (!user) return [];
        const friendIds = new Set(user.friends);
        const userStories = stories.filter(s => s.userId === user.id);
        const friendStories = stories.filter(s => friendIds.has(s.userId));
        
        const grouped = [...userStories, ...friendStories].reduce((acc, story) => {
            if (!acc[story.userId]) {
                acc[story.userId] = [];
            }
            acc[story.userId].push(story);
            return acc;
        }, {} as Record<string, Story[]>);

        const orderedUserIds = [user.id, ...user.friends].filter(id => grouped[id]);
        return orderedUserIds.map(userId => ({
            userId,
            stories: grouped[userId].sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        }));
    }, [stories, user]);
    
    const openStoryViewer = (index: number) => {
        setSelectedStoryUserIndex(index);
        setIsStoryViewerOpen(true);
    };

    const feedItems = useMemo(() => {
        const combined: FeedItemType[] = [
            ...notices.map(item => ({ ...item, itemType: 'notice' as const })),
            ...events.map(item => ({ ...item, itemType: 'event' as const })),
            ...topics.map(item => ({ ...item, itemType: 'topic' as const })),
        ];
        return combined.sort((a, b) => {
            const dateA = a.itemType === 'topic' ? a.timestamp : a.date;
            const dateB = b.itemType === 'topic' ? b.timestamp : b.date;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        }).slice(0, 20);
    }, [notices, events, topics]);

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto">
            {isStoryViewerOpen && (
                <StoryViewer
                    storyGroups={storiesByUser}
                    initialUserIndex={selectedStoryUserIndex}
                    onClose={() => setIsStoryViewerOpen(false)}
                />
            )}
            {isAddStoryModalOpen && (
                <AddStoryModal onClose={() => setIsAddStoryModalOpen(false)} />
            )}

            {/* Stories Section */}
            <div className="mb-8">
                <div className="flex space-x-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-thin">
                    <StoryBubble 
                        user={{ id: user.id, name: user.name, avatarUrl: user.avatarUrl }}
                        hasUnreadStory={false}
                        onClick={() => setIsAddStoryModalOpen(true)}
                        isCurrentUser={true}
                    />
                    {storiesByUser.filter(group => group.userId !== user.id).map((group, index) => {
                         const author = allUsers.find(u => u.id === group.userId);
                         if (!author) return null;
                         const hasUnread = group.stories.some(s => !s.viewedBy.includes(user.id));
                         const groupIndex = storiesByUser.findIndex(g => g.userId === author.id);
                         return (
                            <StoryBubble
                                key={author.id}
                                user={author}
                                hasUnreadStory={hasUnread}
                                onClick={() => openStoryViewer(groupIndex)}
                            />
                         )
                    })}
                </div>
            </div>

            {/* Main Feed Section */}
            <div className="space-y-4">
                 <h1 className="text-2xl font-bold text-white">Your Feed</h1>
                 {loading ? (
                    <div className="space-y-4">
                        <SkeletonLoader className="h-28 rounded-xl" />
                        <SkeletonLoader className="h-28 rounded-xl" />
                        <SkeletonLoader className="h-28 rounded-xl" />
                    </div>
                 ) : (
                    feedItems.map(item => <FeedItem key={`${item.itemType}-${item.id}`} item={item} />)
                 )}
            </div>
        </div>
    );
};

export default HomePage;