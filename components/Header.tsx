
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NotificationCenter from './NotificationCenter';
import GlobalSearch from './GlobalSearch';

const LogoutIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> );
const ProfileIcon: React.FC = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> );

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 h-16 flex-shrink-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Global Search takes up the left/middle space */}
          <div className="flex-1">
            <GlobalSearch />
          </div>

          {/* User actions on the right */}
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-700/50 transition-colors"
                  >
                    <img
                      className="h-9 w-9 rounded-full border-2 border-slate-600 object-cover"
                      src={user.avatarUrl || 'https://i.pravatar.cc/150'}
                      alt="User avatar"
                    />
                    <span className="text-slate-200 hidden md:block pr-2">{user.name}</span>
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-800/80 backdrop-blur-lg rounded-md shadow-lg py-1 border border-slate-700 animate-fade-in-down">
                      <div className="px-4 py-3 text-sm text-slate-400 border-b border-slate-700">
                          Signed in as <br/> <strong className="text-slate-200">{user.username}</strong>
                      </div>
                      <Link
                        to="/profile"
                        className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                      >
                        <ProfileIcon />
                        <span>My Profile</span>
                      </Link>
                      <div className="border-t border-slate-700 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogoutIcon />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;