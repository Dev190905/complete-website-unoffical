import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { User, Note } from '../types';
import NoteModal from '../components/NoteModal';

const SendIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> );

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
        <div className="flex flex-col h-full bg-slate-800/70">
            <header className="p-3 border-b border-white/10 flex items-center space-x-3 bg-slate-900/30 backdrop-blur-lg flex-shrink-0">
                <img src={friend.avatarUrl} alt={friend.name} className="w-10 h-10 rounded-full" />
                <h2 className="text-lg font-semibold text-white">{friend.name}</h2>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 chat-bg-pattern">
                {conversation?.messages.map((msg) => (
                    <div key={msg.id} className={`flex items-end ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === user?.id ? 'bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-3 border-t border-white/10 bg-slate-900/30 backdrop-blur-lg flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="input-glow-effect flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-full focus:outline-none focus:ring-2"
                    />
                    <button type="submit" className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white disabled:bg-slate-600 transition-colors" disabled={!message.trim()}>
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};


const ChatPage: React.FC = () => {
    const { friendId } = useParams<{ friendId?: string }>();
    const { user, allUsers, refreshUser, notes } = useAuth();
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const friends = useMemo(() => allUsers.filter(u => user?.friends.includes(u.id)), [allUsers, user]);
    const selectedFriend = useMemo(() => friends.find(f => f.id === friendId), [friends, friendId]);
    
    const currentUserNote = useMemo(() => notes.find(n => n.userId === user?.id), [notes, user]);
    const friendsWithNotes = useMemo(() => {
        const friendNotesMap = new Map<string, Note>();
        notes.forEach(note => {
            if (user?.friends.includes(note.userId)) {
                friendNotesMap.set(note.userId, note);
            }
        });
        return friendNotesMap;
    }, [notes, user]);

    return (
        <>
            {isNoteModalOpen && <NoteModal onClose={() => setIsNoteModalOpen(false)} />}
            <div className="flex h-[calc(100vh-64px)] rounded-xl overflow-hidden border border-white/10"> {/* Adjust height based on header */}
                <aside className={`w-full md:w-1/3 lg:w-1/4 bg-slate-900/30 backdrop-blur-xl border-r border-white/10 overflow-y-auto ${friendId ? 'hidden md:block' : 'block'}`}>
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white">Conversations</h2>
                    </div>

                     {/* NOTES SECTION */}
                    <div className="p-3 mx-2 mt-2">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsNoteModalOpen(true)}>
                            <div className="relative w-12 h-12">
                                <img src={user?.avatarUrl} alt="Your Note" className="w-12 h-12 rounded-full"/>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-slate-800">
                                    <span className="text-white font-bold text-lg">+</span>
                                </div>
                            </div>
                            <div>
                               <span className="font-semibold text-white">Leave a note</span>
                               <p className="text-sm text-slate-400 truncate max-w-[150px]">{currentUserNote?.content || 'Share a thought'}</p>
                            </div>
                        </div>
                    </div>

                    <nav className="py-2">
                        {friends.map(friend => {
                            const friendNote = friendsWithNotes.get(friend.id);
                            return (
                                <Link
                                    key={friend.id}
                                    to={`/chat/${friend.id}`}
                                    className={`flex items-start space-x-3 p-3 mx-2 rounded-lg transition-colors relative ${friend.id === friendId ? 'bg-primary-500/30' : 'hover:bg-slate-700/50'}`}
                                >
                                    <img src={friend.avatarUrl} alt={friend.name} className="w-12 h-12 rounded-full mt-1"/>
                                    <div className="flex-1">
                                        {friendNote && (
                                            <div className="absolute top-0 -translate-y-1/2 left-12 w-auto max-w-[70%] z-10">
                                                <div className="px-3 py-1 bg-slate-700 rounded-lg text-sm text-white shadow-lg">
                                                    {friendNote.content}
                                                </div>
                                            </div>
                                        )}
                                       <span className="font-semibold text-white">{friend.name}</span>
                                       <p className="text-sm text-slate-400">Last message...</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </nav>
                </aside>
                <main className={`flex-1 ${!friendId ? 'hidden md:flex' : 'block'}`}>
                    {selectedFriend ? (
                        <ChatWindow friend={selectedFriend} />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-4 chat-bg-pattern">
                            <svg className="w-24 h-24 mb-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
                            <h2 className="text-xl font-semibold text-slate-300">Your Conversations</h2>
                            <p>Select a friend from the list to start chatting.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ChatPage;