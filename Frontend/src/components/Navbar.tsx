import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDrawer } from '../context/DrawerContext';
import logo from '../assets/images/image_transparent_compressed.png';
import { Bell, Settings, User, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isOpen } = useDrawer();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className={`fixed top-0 right-0 h-32 transition-all duration-300 z-40 ${isOpen ? 'left-64' : 'left-20'}`}>
      <div className="h-full px-6 flex items-center justify-between">


        <div className="h-full py-2">
          <img src={logo} alt="MusikMadness Logo" className="h-full object-contain" />
        </div>
        
        <div className="relative mr-10" ref={dropdownRef}>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                JD
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-700">
                  <p className="text-white font-medium">John Doe</p>
                  <p className="text-gray-400 text-sm">john.doe@example.com</p>
                </div>
                
                <Link 
                  to="/notifications" 
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  <Bell className="w-5 h-5 mr-3" />
                  <span>Notifications</span>
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">3</span>
                </Link>
                
                <Link 
                  to="/profile" 
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  <User className="w-5 h-5 mr-3" />
                  <span>Profile</span>
                </Link>
                
                <Link 
                  to="/settings" 
                  className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
                >
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Account Settings</span>
                </Link>
                
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <button className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200">
                    <LogOut className="w-5 h-5 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;