import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const SendIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg> );

const ChatWindow: React.FC<{ friend: User }> = ({ friend }) => {
    const { user, getConversation, sendMessage } = useAuth();
    const [message, setMessage] = useState('');
    const conversation = getConversation(friend.id);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation?.messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !user) return;
        await sendMessage(friend.id, message);
        setMessage('');
    };

    return (
        <div className="flex flex-col h-full bg-[#1c1c1c]">
            <header className="p-3 border-b border-[#2d2d2d] flex items-center space-x-3 flex-shrink-0">
                <Link to="/chat" className="md:hidden text-gray-400 p-1">&larr;</Link>
                <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full" />
                <h2 className="text-lg font-semibold text-white">{friend.name}</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {conversation?.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl text-white ${msg.senderId === user?.id ? 'chat-bubble-sent rounded-br-lg' : 'chat-bubble-received rounded-bl-lg'}`}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-[#2d2d2d] flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 px-4 py-2 bg-[#2d2d2d] border border-[#404040] rounded-full focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <button type="submit" className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-opacity" disabled={!message.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

const ChatPage: React.FC = () => {
    const { friendId } = useParams<{ friendId?: string }>();
    const { user, allUsers, refreshUser } = useAuth();

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const friends = useMemo(() => allUsers.filter(u => user?.friends.includes(u.id)), [allUsers, user]);
    const selectedFriend = useMemo(() => friends.find(f => f.id === friendId), [friends, friendId]);

    return (
        <div className="flex h-[calc(100vh-64px)] rounded-xl overflow-hidden border border-[#2d2d2d]">
            <aside className={`w-full md:w-1/3 lg:w-1/4 bg-[#1c1c1c] border-r border-[#2d2d2d] overflow-y-auto ${friendId ? 'hidden md:block' : 'block'}`}>
                <div className="p-4 border-b border-[#2d2d2d]">
                    <h2 className="text-xl font-bold text-white">Chats</h2>
                </div>
                <nav className="py-2">
                    {friends.map(friend => (
                        <Link
                            key={friend.id}
                            to={`/chat/${friend.id}`}
                            className={`flex items-center space-x-3 p-3 mx-2 rounded-lg transition-colors ${friend.id === friendId ? 'bg-primary-500/20' : 'hover:bg-[#2d2d2d]'}`}
                        >
                            <img src={friend.avatarUrl} alt={friend.name} className="w-12 h-12 rounded-full"/>
                            <div>
                               <span className="font-semibold text-white">{friend.name}</span>
                               <p className="text-sm text-gray-400">Last message...</p>
                            </div>
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className={`flex-1 ${!friendId ? 'hidden md:flex' : 'block'}`}>
                {selectedFriend ? (
                    <ChatWindow friend={selectedFriend} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center p-4">
                        <svg className="w-24 h-24 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
                        <h2 className="text-xl font-semibold text-gray-300">Your Conversations</h2>
                        <p>Select a friend to start chatting.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChatPage;
