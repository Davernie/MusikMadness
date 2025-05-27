import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import defaultAvatar from '../assets/images/default-avatar.png';

const StandaloneProfileAvatar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('[StandaloneProfileAvatar] AuthContext user:', user);
    if (user) {
      console.log('[StandaloneProfileAvatar] user.profilePictureUrl:', user.profilePictureUrl);
    }
  }, [user]);

  // Get user initials from the authenticated user's name
  const userInitials = user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'MM';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
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

  // If not authenticated, don't show the avatar
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed top-6 right-12 z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden">
          {user && user.profilePictureUrl ? (
            <img 
              src={`${user.profilePictureUrl}?t=${Date.now()}`}
              alt={user.name} 
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
              alt={user ? user.name : 'User'} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{user?.name}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
              {user?.isCreator && (
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                  CREATOR
                </span>
              )}
            </div>
          </div>
          
          <Link 
            to="/notifications" 
            className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            onClick={() => setIsDropdownOpen(false)}
          >
            <Bell className="w-5 h-5 mr-3" />
            <span>Notifications</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
          </Link>
          
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
  );
};

export default StandaloneProfileAvatar;