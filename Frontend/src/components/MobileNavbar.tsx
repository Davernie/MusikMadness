import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/SmallMM_Transparent.png';
import '../assets/crashbow/Crashbow.ttf';
import { 
  Search, 
  ChevronDown, 
  Users, 
  Mic, 
  Music2, 
  Award, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  Home,
  Settings,
  Radio
} from 'lucide-react';

const MobileNavbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTournamentOpen, setIsTournamentOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsTournamentOpen(false);
  };

  return (
    <>
      {/* Floating Hamburger Menu Button - Top Left */}
      <div className="md:hidden fixed top-3 left-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-300 hover:text-white transition-colors duration-200 p-2 bg-gray-800/20 backdrop-blur-md rounded-lg border border-gray-700/20"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={closeMenu}>
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-gray-800/95 backdrop-blur-md border-r border-gray-700/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">              {/* Header with Logo */}
              <div className="flex items-center p-4 border-b border-gray-700/20">
                <img 
                  src={logo} 
                  alt="MusikMadness Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>

              {/* Search Bar */}
              <div className="px-4 py-4 border-b border-gray-700/20">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-gray-700/30 text-white rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500 font-crashbow"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="flex-1 px-4 py-4 overflow-y-auto">
                <nav className="space-y-2">
                  {/* Home */}
                  <Link 
                    to="/" 
                    onClick={closeMenu}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-crashbow text-lg tracking-wide ${
                      isActive('/') ? 'text-purple-400 bg-gray-700/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20'
                    }`}
                  >
                    <Home className="w-6 h-6 mr-4 flex-shrink-0" />
                    Home
                  </Link>

                  {/* Tournaments Dropdown */}
                  <div className="space-y-1">
                    <button
                      onClick={() => setIsTournamentOpen(!isTournamentOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 font-crashbow text-lg tracking-wide ${
                        isActive('/tournaments') ? 'text-purple-400 bg-gray-700/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20'
                      }`}
                    >
                      <div className="flex items-center">
                        <svg className="w-6 h-6 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        Tournaments
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isTournamentOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Tournament Dropdown Items */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isTournamentOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="space-y-1 ml-6">
                        <Link 
                          to="/tournaments?type=artist" 
                          onClick={closeMenu}
                          className="flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-gray-300 hover:text-white hover:bg-gray-700/20 font-crashbow text-sm tracking-wide"
                        >
                          <Mic className="w-4 h-4 mr-3 flex-shrink-0" />
                          Artist
                        </Link>
                        <Link 
                          to="/tournaments?type=producer" 
                          onClick={closeMenu}
                          className="flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-gray-300 hover:text-white hover:bg-gray-700/20 font-crashbow text-sm tracking-wide"
                        >
                          <Music2 className="w-4 h-4 mr-3 flex-shrink-0" />
                          Producer
                        </Link>
                        <Link 
                          to="/tournaments?type=aux" 
                          onClick={closeMenu}
                          className="flex items-center px-4 py-2 rounded-lg transition-colors duration-200 text-gray-300 hover:text-white hover:bg-gray-700/20 font-crashbow text-sm tracking-wide"
                        >
                          <Users className="w-4 h-4 mr-3 flex-shrink-0" />
                          Aux Battles
                        </Link>
                      </div>
                    </div>
                  </div>                  {/* Create Tournament (available to all users) */}
                  <Link 
                    to="/create-tournament"
                    onClick={closeMenu}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-crashbow text-lg tracking-wide ${
                      isActive('/create-tournament') ? 'text-purple-400 bg-gray-700/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20'
                    }`}
                  >
                    <svg className="w-6 h-6 mr-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Tournament
                  </Link>

                  {/* Leaderboard */}
                  <Link
                    to="/leaderboard"
                    onClick={closeMenu}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-crashbow text-lg tracking-wide ${
                      isActive('/leaderboard') ? 'text-purple-400 bg-gray-700/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20'
                    }`}
                  >
                    <Award className="w-6 h-6 mr-4 flex-shrink-0" />
                    Leaderboard
                  </Link>

                  {/* Live Streams */}
                  <Link
                    to="/live-streams"
                    onClick={closeMenu}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-crashbow text-lg tracking-wide ${
                      isActive('/live-streams') ? 'text-purple-400 bg-gray-700/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20'
                    }`}
                  >
                    <Radio className="w-6 h-6 mr-4 flex-shrink-0" />
                    Live Streams
                  </Link>

                  {/* Settings (for authenticated users) */}
                  {isAuthenticated && (
                    <Link 
                      to="/settings" 
                      onClick={closeMenu}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 font-crashbow text-lg tracking-wide ${
                        isActive('/settings') ? 'text-purple-400 bg-gray-700/20' : 'text-gray-300 hover:text-white hover:bg-gray-700/20'
                      }`}
                    >
                      <Settings className="w-6 h-6 mr-4 flex-shrink-0" />
                      Settings
                    </Link>
                  )}
                </nav>
              </div>

              {/* Auth Button (Login/Logout) */}
              <div className="p-4 border-t border-gray-700/20">
                {isAuthenticated ? (
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/20 font-crashbow text-lg tracking-wide"
                  >
                    <LogOut className="w-6 h-6 mr-4 flex-shrink-0" />
                    Logout
                  </button>
                ) : (
                  <Link 
                    to="/login" 
                    onClick={closeMenu}
                    className="flex items-center w-full px-4 py-3 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/20 font-crashbow text-lg tracking-wide"
                  >
                    <LogIn className="w-6 h-6 mr-4 flex-shrink-0" />
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNavbar; 