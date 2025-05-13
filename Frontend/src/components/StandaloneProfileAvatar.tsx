import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Settings, User, LogOut } from 'lucide-react';

const StandaloneProfileAvatar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // In a real app, user data (like initials or avatar URL) would come from context or props
  const userInitials = "JD"; // Or fetch dynamically
  const userName = "John Doe"; // Or fetch dynamically
  const userEmail = "john.doe@example.com"; // Or fetch dynamically

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

  return (
    <div className="fixed top-6 right-12 z-50" ref={dropdownRef}>
      <button 
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {userInitials}
        </div>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-700">
            <p className="text-white font-medium">{userName}</p>
            <p className="text-gray-400 text-sm">{userEmail}</p>
          </div>
          
          <Link 
            to="/notifications" 
            className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            onClick={() => setIsDropdownOpen(false)} // Close dropdown on link click
          >
            <Bell className="w-5 h-5 mr-3" />
            <span>Notifications</span>
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
          </Link>
          
          <Link 
            to="/profile" 
            className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            onClick={() => setIsDropdownOpen(false)} // Close dropdown on link click
          >
            <User className="w-5 h-5 mr-3" />
            <span>Profile</span>
          </Link>
          
          <Link 
            to="/settings" 
            className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
            onClick={() => setIsDropdownOpen(false)} // Close dropdown on link click
          >
            <Settings className="w-5 h-5 mr-3" />
            <span>Account Settings</span>
          </Link>
          
          <div className="border-t border-gray-700 mt-2 pt-2">
            <button 
              className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              onClick={() => {
                // Handle logout logic here
                setIsDropdownOpen(false); 
              }}
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