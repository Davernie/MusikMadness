import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import defaultAvatar from '../assets/images/default-avatar.png';

const StandaloneProfileAvatar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('[StandaloneProfileAvatar] AuthContext user:', user);
    if (user) {
      console.log('[StandaloneProfileAvatar] user.profilePictureUrl:', user.profilePictureUrl);
    }
  }, [user]);

  // Get user initials from the authenticated user's username
  const userInitials = user ? user.username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'MM';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const handleNotificationsClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false); // Close main dropdown when opening notifications
  };

  // If not authenticated, show login button on mobile
  if (!isAuthenticated) {
    return (
      <div className="fixed top-3 right-4 z-50 md:hidden">
        <Link 
          to="/login" 
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200 bg-gray-800/20 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-700/20"
        >
          <User className="w-5 h-5" />
          <span className="font-crashbow text-sm">Login</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="fixed top-3 right-4 md:top-6 md:right-12 z-50">
      {/* Notifications Dropdown */}
      <div className="relative" ref={notificationsRef}>
        {isNotificationsOpen && (
          <div className="absolute right-0 top-0 mt-16 w-80 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg py-4 z-50 border border-gray-700/20">
            <div className="px-4 py-2 border-b border-gray-700/50">
              <h3 className="text-white font-medium text-lg">Notifications</h3>
            </div>
            
            <div className="px-4 py-8 text-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-300 font-medium">No notifications</p>
                  <p className="text-gray-500 text-sm mt-1">You're all caught up!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Profile Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center text-gray-300 hover:text-white transition-colors duration-200"
        >
          {/* Square profile image */}
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white text-sm md:text-xl font-bold shadow-lg overflow-hidden border border-gray-700/20">
            {user && user.profilePictureUrl ? (
              <img 
                src={`${user.profilePictureUrl}?t=${Date.now()}`}
                alt={user.username} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', user.profilePictureUrl);
                  e.currentTarget.src = defaultAvatar;
                  e.currentTarget.onerror = null;
                }}
              />
            ) : (
              <img 
                src={defaultAvatar}
                alt={user ? user.username : 'User'} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-md rounded-lg shadow-lg py-2 z-50 border border-gray-700/20">
            <div className="px-4 py-2 border-b border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{user?.username}</p>
                  <p className="text-gray-400 text-sm truncate">{user?.email}</p>
                </div>
                {user?.isCreator && (
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap ml-2">
                    CREATOR
                  </span>
                )}
              </div>
            </div>
            
            <button 
              onClick={handleNotificationsClick}
              className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            >
              <Bell className="w-5 h-5 mr-3" />
              <span>Notifications</span>
            </button>
            
            <Link 
              to="/profile" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              onClick={() => setIsDropdownOpen(false)}
            >
              <User className="w-5 h-5 mr-3" />
              <span>Profile</span>
            </Link>
            
            <Link 
              to="/settings" 
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Account Settings</span>
            </Link>
            
            <div className="border-t border-gray-700 mt-2 pt-2">
              <button 
                className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StandaloneProfileAvatar;