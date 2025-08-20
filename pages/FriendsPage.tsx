import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { Link } from 'react-router-dom';

const FriendsPage: React.FC = () => {
    const { user, allUsers, acceptFriendRequest, declineFriendRequest, sendFriendRequest, removeFriend, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('friends');
    
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const friends = useMemo(() => allUsers.filter(u => user?.friends.includes(u.id)), [allUsers, user]);
    const friendRequests = useMemo(() => allUsers.filter(u => user?.friendRequestsReceived.includes(u.id)), [allUsers, user]);
    const suggestions = useMemo(() => {
        if (!user) return [];
        const connectedIds = new Set([
            user.id,
            ...user.friends,
            ...user.friendRequestsSent,
            ...user.friendRequestsReceived
        ]);
        return allUsers.filter(u => !connectedIds.has(u.id));
    }, [allUsers, user]);

    const renderUserCard = (targetUser: User, type: 'friend' | 'request' | 'suggestion') => {
        return (
            <div key={targetUser.id} className="bg-gradient-to-br from-slate-800 to-slate-800/80 p-4 rounded-xl flex flex-col items-center text-center border border-slate-700 transition-transform transform hover:-translate-y-1 card-hover-effect">
                <img src={targetUser.avatarUrl} alt={targetUser.name} className="w-20 h-20 rounded-full mb-3 border-2 border-slate-600" />
                <p className="font-semibold text-white text-lg">{targetUser.name}</p>
                <p className="text-sm text-slate-400 mb-4">{targetUser.branch}</p>
                
                <div className="flex flex-col w-full space-y-2 mt-auto">
                    {type === 'friend' && (
                        <>
                             <Link to={`/chat/${targetUser.id}`} className="px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md w-full transition-colors">Chat</Link>
                             <button onClick={() => removeFriend(targetUser.id)} className="px-3 py-2 text-sm bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-md w-full transition-colors">Remove</button>
                        </>
                    )}
                    {type === 'request' && (
                        <>
                            <button onClick={() => acceptFriendRequest(targetUser.id)} className="px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md w-full transition-colors">Accept</button>
                            <button onClick={() => declineFriendRequest(targetUser.id)} className="px-3 py-2 text-sm bg-slate-600 hover:bg-slate-500 text-white rounded-md w-full transition-colors">Decline</button>
                        </>
                    )}
                    {type === 'suggestion' && (
                        <button onClick={() => sendFriendRequest(targetUser.id)} className="px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md w-full transition-colors">Add Friend</button>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Connections</h1>

            <div className="mb-6 border-b border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('friends')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'friends' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                        My Friends ({friends.length})
                    </button>
                    <button onClick={() => setActiveTab('requests')} className={`py-3 px-1 border-b-2 font-medium text-sm relative ${activeTab === 'requests' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                        Friend Requests
                        {friendRequests.length > 0 && <span className="ml-2 absolute top-2 -right-4 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{friendRequests.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('suggestions')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'suggestions' ? 'border-primary-500 text-primary-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'}`}>
                        Find Students
                    </button>
                </nav>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {activeTab === 'friends' && (friends.length > 0 ? friends.map(f => renderUserCard(f, 'friend')) : <p className="text-slate-500 col-span-full text-center py-8">You have no friends yet. Find students to connect!</p>)}
                {activeTab === 'requests' && (friendRequests.length > 0 ? friendRequests.map(r => renderUserCard(r, 'request')) : <p className="text-slate-500 col-span-full text-center py-8">You have no pending friend requests.</p>)}
                {activeTab === 'suggestions' && (suggestions.length > 0 ? suggestions.map(s => renderUserCard(s, 'suggestion')) : <p className="text-slate-500 col-span-full text-center py-8">No new students to show.</p>)}
            </div>
        </div>
    );
};

export default FriendsPage;