
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const IconHome = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path></svg>;
const IconNotice = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 12H5V5h14v9z"></path></svg>;
const IconForum = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"></path></svg>;
const IconFriends = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>;
const IconChat = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>;
const IconResources = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M2 6h20v12H2zM4 9h16V7H4zm16 8V11H4v6z"></path></svg>;
const IconEvents = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"></path></svg>;
const IconMarket = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 4H4c-1.1 0-2 .9-2 2v4h6V4zm-6 6v4h6v-4H4zm0 6h6v4H4c-1.1 0-2-.9-2-2v-2zm8 4h10v-4H12v4zm10-6H12v-4h10v4zm0-6v4H12V4h8c1.1 0 2 .9 2 2z"></path></svg>;
const IconPlacements = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path></svg>;
const IconMap = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20.5 3l-16 7.5v.23c0 3.52 2.65 6.46 6.02 6.94l.21.03 2.15.54.54 2.15c.48 3.37 3.42 6.02 6.94 6.02h.23l7.5-16z"></path></svg>;
const IconAdmin = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"></path></svg>;


const links = [
  { name: 'Dashboard', path: '/', icon: <IconHome/> },
  { name: 'Notices', path: '/notices', icon: <IconNotice/> },
  { name: 'Forums', path: '/forum', icon: <IconForum/> },
  { name: 'Friends', path: '/friends', icon: <IconFriends/> },
  { name: 'Chat', path: '/chat', icon: <IconChat/> },
  { name: 'Resources', path: '/resources', icon: <IconResources/> },
  { name: 'Events', path: '/events', icon: <IconEvents/> },
  { name: 'Marketplace', path: '/marketplace', icon: <IconMarket/> },
  { name: 'Placements', path: '/placements', icon: <IconPlacements/> },
  { name: 'Campus Map', path: '/map', icon: <IconMap/> },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const activeLinkClass = 'bg-slate-800 text-primary-400';
  const inactiveLinkClass = 'text-gray-400 hover:bg-slate-700/50 hover:text-white';

  const NavItem = ({ link }: { link: { name: string, path: string, icon: JSX.Element }}) => (
    <NavLink
        to={link.path}
        end={link.path === '/'}
        className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}
        title={link.name}
    >
        {link.icon}
        <span className="ml-4 font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">{link.name}</span>
    </NavLink>
  );

  return (
    <aside className="group w-16 hover:w-64 transition-all duration-300 ease-in-out bg-gray-900/30 group-hover:backdrop-blur-xl border-r border-white/10 z-40 flex flex-col">
        <div className="flex items-center justify-center h-16 border-b border-white/10 flex-shrink-0">
          <span className="text-3xl font-bold text-primary-400">P</span>
          <span className="text-xl font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">ortal</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {links.map(link => <NavItem key={link.name} link={link} /> )}
        </nav>
        {user?.isAdmin && (
           <div className="px-2 py-4 border-t border-white/10">
             <NavLink
                to="/admin"
                className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`}
                title="Admin Panel"
              >
                <IconAdmin />
                <span className="ml-4 font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">Admin Panel</span>
              </NavLink>
           </div>
        )}
      </aside>
  );
};

export default Sidebar;