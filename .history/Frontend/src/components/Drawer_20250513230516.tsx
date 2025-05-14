import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDrawer } from '../context/DrawerContext';
import logo from '../assets/images/SmallMM_Transparent.png';
import '../assets/crashbow/Crashbow.ttf';
import { Search, Music, Headphones, Mic, Radio, Guitar, Drum, Piano } from 'lucide-react';

const Drawer = () => {
  const { isOpen, setIsOpen } = useDrawer();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-gray-800/20 backdrop-blur-md border-r border-gray-700/20 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-start px-1 py-4">
          <img 
            src={logo} 
            alt="MusikMadness Logo" 
            className="w-20 h-20 object-contain"
          />
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={isOpen ? "Search..." : ""}
              className={`w-full bg-gray-700/30 text-white rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 ${
                isOpen ? 'opacity-100' : 'opacity-0 w-0'
              }`}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          <Link 
            to="/" 
            className={`flex items-center px-4 py-3 transition-colors duration-200 rounded-lg hover:bg-gray-700/20 ${
              isActive('/') 
                ? 'text-purple-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className={`ml-4 whitespace-nowrap transition-all duration-300 font-crashbow ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Home</span>
          </Link>

          <Link 
            to="/tournaments" 
            className={`flex items-center px-4 py-3 transition-colors duration-200 rounded-lg hover:bg-gray-700/20 ${
              isActive('/tournaments') 
                ? 'text-purple-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/tournaments') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className={`ml-4 whitespace-nowrap transition-all duration-300 font-crashbow ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Tournaments</span>
          </Link>

          <Link 
            to="/create-tournament" 
            className={`flex items-center px-4 py-3 transition-colors duration-200 rounded-lg hover:bg-gray-700/20 ${
              isActive('/create-tournament') 
                ? 'text-purple-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/create-tournament') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className={`ml-4 whitespace-nowrap transition-all duration-300 font-crashbow ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Create Tournament</span>
          </Link>

          <Link 
            to="/settings" 
            className={`flex items-center px-4 py-3 transition-colors duration-200 rounded-lg hover:bg-gray-700/20 ${
              isActive('/settings') 
                ? 'text-purple-400' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/settings') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className={`ml-4 whitespace-nowrap transition-all duration-300 font-crashbow ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Settings</span>
          </Link>
        </nav>

        {/* Music Player Widget */}
        <div className="p-4 border-t border-gray-700/20">
          <div className={`bg-gray-700/30 rounded-lg p-4 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center mb-3">
              <Headphones className="w-5 h-5 text-purple-400 mr-2" />
              <span className="text-sm font-crashbow text-white">Now Playing</span>
            </div>
            <div className="text-xs text-gray-400 mb-2">Summer Beat Battle 2024</div>
            <div className="w-full bg-gray-600 rounded-full h-1 mb-2">
              <div className="bg-purple-500 h-1 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>1:23</span>
              <span>3:45</span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4">
          <button className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/20">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`ml-4 whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Drawer; 