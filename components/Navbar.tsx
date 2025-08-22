import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../types';
import GlobalSearch from './GlobalSearch';

// --- Main Navbar Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"/></svg>;
const FriendsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>;
const AIChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><g><rect fill="none" height="24" width="24"/></g><g><path d="M18,12.99V6.5l-2-2h-8l-2,2v8.49l-2.5,2.5l1.41,1.41L18,14.41l1.41-1.41L18,12.99z M16,11.59l-2.5,2.5H12v-1.59l2.5-2.5 H16V11.59z M11,11.59H9.5V10H11V8.5H8v3h1.5V13H8v1.5h3.5l-2.5,2.5H6.5v-2H5V7h10v1.5h-1.5v2H15v1.09l-4,4V11.59z"/></g></svg>;
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>;

// --- Dropdown Menu Icons ---
const IconNotice = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15h14a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>;
const IconForum = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;
const IconResources = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" /><path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" /></svg>;
const IconEvents = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;
const IconMarket = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>;
const IconPlacements = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm5-1V5a1 1 0 00-1-1H9a1 1 0 00-1 1v1h4z" clipRule="evenodd" /></svg>;
const IconMap = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM10 4.414L14 8.414v9.172L10 13.586V4.414zM6 16V7.586l4-4V11.586l-4 4z" clipRule="evenodd" /></svg>;
const IconAdmin = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;


const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinkClass = "text-gray-400 hover:text-white transition-colors p-2 rounded-lg";
    const activeNavLinkClass = "text-white bg-primary-500/20 p-2 rounded-lg";
    
    const modules = [
        { name: 'Notices', path: '/notices', icon: <IconNotice /> },
        { name: 'Forums', path: '/forum', icon: <IconForum /> },
        { name: 'Resources', path: '/resources', icon: <IconResources /> },
        { name: 'Events', path: '/events', icon: <IconEvents /> },
        { name: 'Marketplace', path: '/marketplace', icon: <IconMarket /> },
        { name: 'Placements', path: '/placements', icon: <IconPlacements /> },
        { name: 'Campus Map', path: '/map', icon: <IconMap /> },
    ];

    return (
        <header className="navbar sticky top-0 z-40 h-16 border-b border-[#2d2d2d]">
            <div className="container mx-auto px-4 sm:px-6 h-full">
                <div className="flex items-center justify-between h-full">
                    <Link to="/" className="text-xl font-bold text-white">Portal</Link>
                    
                    <div className="hidden md:block w-full max-w-xs lg:max-w-sm">
                        <GlobalSearch />
                    </div>

                    <nav className="flex items-center space-x-2 sm:space-x-3">
                        <NavLink to="/" end className={({isActive}) => isActive ? activeNavLinkClass : navLinkClass} title="Home"><HomeIcon/></NavLink>
                        <NavLink to="/friends" className={({isActive}) => isActive ? activeNavLinkClass : navLinkClass} title="Friends"><FriendsIcon/></NavLink>
                        <NavLink to="/chat" className={({isActive}) => isActive ? activeNavLinkClass : navLinkClass} title="Chat"><ChatIcon/></NavLink>
                        <NavLink to="/ai-chat" className={({isActive}) => isActive ? activeNavLinkClass : navLinkClass} title="AI Assistant"><AIChatIcon/></NavLink>
                        
                        {/* Modules Dropdown */}
                        <div className="relative">
                             <button
                                onClick={() => setModulesDropdownOpen(prev => !prev)}
                                onBlur={() => setTimeout(() => setModulesDropdownOpen(false), 200)}
                                className={`${navLinkClass} ${modulesDropdownOpen ? 'text-white' : ''}`}
                                title="Modules"
                            >
                                <GridIcon />
                            </button>
                            {modulesDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-[#1c1c1c] rounded-md shadow-lg py-2 border border-[#2d2d2d] animate-fade-in-down">
                                    {modules.map(module => (
                                        <Link key={module.path} to={module.path} className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-[#2d2d2d]">
                                            <span className="text-gray-400">{module.icon}</span>
                                            <span>{module.name}</span>
                                        </Link>
                                    ))}
                                    {user?.isAdmin && (
                                        <>
                                            <div className="border-t border-[#2d2d2d] my-1"></div>
                                            <Link to="/admin" className="flex items-center space-x-3 px-4 py-2 text-sm text-primary-400 hover:bg-[#2d2d2d]">
                                                <span className="text-primary-500">{<IconAdmin />}</span>
                                                <span>Admin Panel</span>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 200)}
                                className="flex items-center"
                            >
                                <img
                                    className="h-8 w-8 rounded-full object-cover border-2 border-transparent hover:border-primary-500 transition-all"
                                    src={user?.avatarUrl || 'https://i.pravatar.cc/150'}
                                    alt="User avatar"
                                />
                            </button>
                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-3 w-48 bg-[#1c1c1c] rounded-md shadow-lg py-1 border border-[#2d2d2d] animate-fade-in-down">
                                    <div className="px-4 py-2 text-sm text-gray-400 border-b border-[#2d2d2d]">
                                        Signed in as <strong className="text-white">{user?.username}</strong>
                                    </div>
                                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2d2d2d] w-full text-left">My Profile</Link>
                                    <div className="border-t border-[#2d2d2d] my-1"></div>
                                    <div className="px-4 pt-2 pb-1 text-xs text-gray-400">Theme</div>
                                    <div className="flex justify-around px-2 py-2">
                                        <button title="Default Blue" onClick={() => setTheme('default-blue')} className={`w-8 h-8 rounded-full bg-[#3b82f6] transition-all ${theme === 'default-blue' ? 'ring-2 ring-offset-2 ring-offset-[#1c1c1c] ring-white' : 'hover:scale-110'}`}></button>
                                        <button title="Forest Green" onClick={() => setTheme('forest-green')} className={`w-8 h-8 rounded-full bg-[#22c55e] transition-all ${theme === 'forest-green' ? 'ring-2 ring-offset-2 ring-offset-[#1c1c1c] ring-white' : 'hover:scale-110'}`}></button>
                                        <button title="Deep Purple" onClick={() => setTheme('deep-purple')} className={`w-8 h-8 rounded-full bg-[#8b5cf6] transition-all ${theme === 'deep-purple' ? 'ring-2 ring-offset-2 ring-offset-[#1c1c1c] ring-white' : 'hover:scale-110'}`}></button>
                                    </div>
                                    <div className="border-t border-[#2d2d2d] my-1"></div>
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2d2d2d]">Logout</button>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Navbar;