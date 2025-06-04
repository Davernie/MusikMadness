import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDrawer } from '../context/DrawerContext';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/SmallMM_Transparent.png';
import '../assets/crashbow/Crashbow.ttf';
import { Search, ChevronDown, Users, Mic, Music2, Award, LogIn, LogOut } from 'lucide-react';

const Drawer = () => {
  const { isOpen, setIsOpen } = useDrawer();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isTournamentOpen, setIsTournamentOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItemClass = (path: string) => `
    flex items-center px-4 py-3 
    transition-colors duration-200 
    rounded-lg hover:bg-gray-700/20 
    tracking-wider
    ${isActive(path) ? 'text-purple-400' : 'text-gray-300 hover:text-white'}
  `;

  const navTextClass = `
    ${isOpen ? 'ml-4' : 'ml-0'} whitespace-nowrap 
    transition-all duration-300 
    font-crashbow text-lg
    tracking-wide leading-relaxed
    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
  `;

  const dropdownItemClass = `
    flex items-center px-4 py-2
    transition-colors duration-200
    rounded-lg hover:bg-gray-700/20
    text-gray-300 hover:text-white
    ml-6
  `;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative">
      {/* Invisible hover trigger zone - only active when drawer is collapsed */}
      {!isOpen && (
        <div 
          className="fixed left-0 top-0 w-20 h-full z-[60] bg-transparent"
          onMouseEnter={() => setIsOpen(true)}
        />
      )}
      
      <div 
        className={`fixed left-0 top-0 h-full bg-gray-800/20 backdrop-blur-md border-r border-gray-700/20 transition-all duration-300 z-50 ${isOpen ? 'w-64' : 'w-20'}`}
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
                className={`w-full bg-gray-700/30 text-white rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 font-crashbow ${
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
              className={navItemClass('/')}
            >
              <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className={navTextClass} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>Home</span>
            </Link>

            {/* Tournaments Dropdown */}
            <div className="space-y-1">
              <button
                onClick={() => setIsTournamentOpen(!isTournamentOpen)}
                className={`w-full ${navItemClass('/tournaments')} justify-between`}
              >
                <div className="flex items-center">
                  <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/tournaments') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className={navTextClass} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>Tournaments</span>
                </div>
                {isOpen && (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTournamentOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              {isOpen && isTournamentOpen && (
                <div className="space-y-1 mt-1">
                  <Link to="/tournaments?type=artist" className={dropdownItemClass}>
                    <Mic className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className={`ml-4 whitespace-nowrap transition-all duration-300 font-crashbow text-sm tracking-wide leading-relaxed ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Artist</span>
                  </Link>
                  <Link to="/tournaments?type=producer" className={dropdownItemClass}>
                    <Music2 className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className={`ml-4 whitespace-nowrap transition-all duration-300 font-crashbow text-sm tracking-wide leading-relaxed ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Producer</span>
                  </Link>
                  <Link to="/tournaments?type=aux" className={dropdownItemClass}>
                    <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className={`ml-4 whitespace-nowrap transition-all duration-300 font-crashbow text-sm tracking-wide leading-relaxed ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>Aux Battles</span>
                  </Link>
                </div>
              )}
            </div>

            {isAuthenticated && user?.isCreator && (
              <Link 
                to="/create-tournament" 
                className={navItemClass('/create-tournament')}
              >
                <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/create-tournament') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className={navTextClass} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>Create Tournament</span>
              </Link>
            )}

            <Link
              to="/leaderboard"
              className={navItemClass('/leaderboard')}
            >
              <Award className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/leaderboard') ? 'text-purple-400' : ''}`} />
              <span className={navTextClass} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>Leaderboard</span>
            </Link>

            {isAuthenticated && (
              <Link 
                to="/settings" 
                className={`${navItemClass('/settings')} mt-2 border-t border-gray-700/20 pt-4`}
              >
                <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/settings') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className={navTextClass} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>Settings</span>
              </Link>
            )}

            {/* This entire block for Profile will be removed
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className={navItemClass('/profile')}
              >
                <svg className={`w-6 h-6 flex-shrink-0 transition-colors duration-200 ${isActive('/profile') ? 'text-purple-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className={navTextClass} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>Profile</span>
              </Link>
            )}
            */}
          </nav>

          {/* Auth Button (Login/Logout) */}
          <div className="p-4 border-t border-gray-700/20">
            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/20"
              >
                <LogOut className="w-6 h-6 flex-shrink-0" />
                <span className={`${isOpen ? 'ml-4' : 'ml-0'} whitespace-nowrap transition-all duration-300 font-crashbow ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
                  Logout
                </span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/20"
              >
                <LogIn className="w-6 h-6 flex-shrink-0" />
                <span className={`${isOpen ? 'ml-4' : 'ml-0'} whitespace-nowrap transition-all duration-300 font-crashbow ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`} style={{ pointerEvents: isOpen ? 'auto' : 'none' }}>
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Drawer;