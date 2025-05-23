import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

const UserStatusBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      {isAuthenticated && user ? (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-gray-800/70 backdrop-blur-sm py-2 px-3 rounded-lg border border-cyan-500/30 hover:bg-gray-700/70 transition-colors duration-200"
          >
            <div 
              className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center overflow-hidden"
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-white" />
              )}
            </div>
            <span className="text-white font-medium">{user.name}</span>
            <ChevronDown className="h-4 w-4 text-cyan-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-md border border-cyan-500/30 rounded-md shadow-lg shadow-cyan-500/20 py-1 z-10">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-cyan-400 hover:bg-gray-700/50 hover:text-white transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </div>
              </Link>
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm text-cyan-400 hover:bg-gray-700/50 hover:text-white transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </div>
              </Link>
              <div className="border-t border-gray-700 my-1"></div>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-pink-400 hover:bg-gray-700/50 hover:text-pink-300 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </div>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex space-x-2">
          <Link
            to="/login"
            className="py-2 px-4 bg-gray-800/70 backdrop-blur-sm rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-gray-700/70 transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="py-2 px-4 bg-gradient-to-r from-cyan-500 to-pink-500 rounded-lg text-white hover:from-cyan-600 hover:to-pink-600 transition-colors duration-200"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserStatusBar; 