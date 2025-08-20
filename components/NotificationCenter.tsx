import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const BellIcon: React.FC = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>;

const NotificationCenter: React.FC = () => {
    const { notifications, markNotificationsAsRead } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
        if (!isOpen && unreadCount > 0) {
            markNotificationsAsRead();
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggle}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="relative p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center ring-2 ring-slate-800">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800/80 backdrop-blur-lg rounded-md shadow-lg border border-slate-700 animate-fade-in-down z-40">
                    <div className="p-3 font-semibold text-white border-b border-slate-700">Notifications</div>
                    <div className="max-h-96 overflow-y-auto scrollbar-thin">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <Link
                                    key={notif.id}
                                    to={notif.link}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-3 border-b border-slate-700/50 last:border-b-0 hover:bg-slate-700/50 transition-colors ${!notif.read ? 'bg-primary-600/10' : ''}`}
                                >
                                    <p className="text-sm text-slate-200">{notif.message}</p>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                                </Link>
                            ))
                        ) : (
                            <p className="p-4 text-center text-sm text-slate-500">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;