import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Topic, Reply, User } from '../types';
import AddTopicModal from '../components/AddTopicModal';

const AddFriendButton: React.FC<{author: Pick<User, 'id'>}> = ({ author }) => {
    const { user, sendFriendRequest } = useAuth();
    if (!user || user.id === author.id) return null;

    const isFriend = user.friends.includes(author.id);
    const requestSent = user.friendRequestsSent.includes(author.id);
    const requestReceived = user.friendRequestsReceived.includes(author.id);

    if (isFriend || requestSent || requestReceived) return null;

    return (
        <button onClick={() => sendFriendRequest(author.id)} className="ml-3 text-xs bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 rounded-md transition-colors">
            Add Friend
        </button>
    );
};

export const ForumPage: React.FC = () => {
    const { topics } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    return (
        <div>
            {isModalOpen && <AddTopicModal onClose={() => setIsModalOpen(false)} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-white">Forums & Discussions</h1>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold transition-colors">Start New Discussion</button>
            </div>
            <div className="bg-slate-800/80 rounded-lg border border-slate-700">
                {[...topics].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(topic => (
                    <Link key={topic.id} to={`/forum/${topic.id}`} className="block p-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors">
                        <h2 className="text-lg font-semibold text-primary-400">{topic.title}</h2>
                        <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
                          <img src={topic.author.avatarUrl} alt={topic.author.name} className="w-5 h-5 rounded-full" />
                          <span>by {topic.author.name}</span>
                          <span>&middot;</span>
                          <span>{new Date(topic.timestamp).toLocaleString()}</span>
                           <span>&middot;</span>
                          <span className="font-semibold">{topic.replies.length} replies</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const TopicPage: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const { user, topics, updateTopic, addReply } = useAuth();
    const topic = topics.find(t => t.id === topicId);
    const [newReply, setNewReply] = useState('');

    const handleVote = (type: 'topic' | 'reply', id: string, vote: 'up' | 'down') => {
        if (!topic) return;
        
        if (type === 'topic') {
            const newUpvotes = vote === 'up' ? topic.upvotes + 1 : topic.upvotes;
            const newDownvotes = vote === 'down' ? topic.downvotes + 1 : topic.downvotes;
            updateTopic(topic.id, { upvotes: newUpvotes, downvotes: newDownvotes });
        } else {
            const reply = topic.replies.find(r => r.id === id);
            if(reply) {
                const newUpvotes = vote === 'up' ? reply.upvotes + 1 : reply.upvotes;
                const newDownvotes = vote === 'down' ? reply.downvotes + 1 : reply.downvotes;
                const updatedReplies = topic.replies.map(r => r.id === id ? {...r, upvotes: newUpvotes, downvotes: newDownvotes} : r);
                updateTopic(topic.id, { replies: updatedReplies });
            }
        }
    };

    const handleReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !topic) return;
        addReply(topic.id, newReply);
        setNewReply('');
    };

    if (!topic) return <div className="text-center text-xl">Topic not found.</div>;

    return (
        <div>
            <Link to="/forum" className="text-primary-400 hover:underline mb-4 inline-block">&larr; Back to Forums</Link>
            {/* Topic Post */}
            <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 mb-6">
                <h1 className="text-2xl font-bold text-white mb-2">{topic.title}</h1>
                <div className="flex items-center space-x-2 text-sm text-slate-500 mb-4">
                    <img src={topic.author.avatarUrl} alt={topic.author.name} className="w-6 h-6 rounded-full" />
                    <span>{topic.author.name}</span>
                    <AddFriendButton author={topic.author} />
                    <span>&middot;</span>
                    <span>{new Date(topic.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-slate-300 whitespace-pre-wrap">{topic.description}</p>
                <div className="flex items-center space-x-2 mt-4 text-sm">
                    <button onClick={() => handleVote('topic', topic.id, 'up')} className="flex items-center space-x-1 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded-full text-green-400"><span>👍</span> <span>{topic.upvotes}</span></button>
                    <button onClick={() => handleVote('topic', topic.id, 'down')} className="flex items-center space-x-1 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded-full text-red-400"><span>👎</span> <span>{topic.downvotes}</span></button>
                </div>
            </div>

            {/* Replies */}
            <h2 className="text-xl font-semibold mb-4">Replies ({topic.replies.length})</h2>
            <div className="space-y-4 mb-6">
                {topic.replies.map(reply => (
                    <div key={reply.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-2">
                            <img src={reply.author.avatarUrl} alt={reply.author.name} className="w-5 h-5 rounded-full" />
                            <span>{reply.author.name}</span>
                            <AddFriendButton author={reply.author} />
                            <span>&middot;</span>
                            <span>{new Date(reply.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap">{reply.content}</p>
                         <div className="flex items-center space-x-2 mt-3 text-sm">
                            <button onClick={() => handleVote('reply', reply.id, 'up')} className="flex items-center space-x-1 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded-full text-green-400"><span>👍</span> <span>{reply.upvotes}</span></button>
                            <button onClick={() => handleVote('reply', reply.id, 'down')} className="flex items-center space-x-1 px-3 py-1 bg-slate-700/50 hover:bg-slate-700 rounded-full text-red-400"><span>👎</span> <span>{reply.downvotes}</span></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleReply} className="bg-slate-800/80 p-4 rounded-lg border border-slate-700">
                <textarea 
                    value={newReply}
                    onChange={e => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="input-glow-effect w-full h-24 p-2 bg-slate-700/50 border border-slate-600 rounded-md mb-2 focus:ring-2"
                ></textarea>
                <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-semibold">Post Reply</button>
            </form>
        </div>
    );
};