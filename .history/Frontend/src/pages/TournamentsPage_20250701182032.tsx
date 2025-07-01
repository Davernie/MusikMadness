import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Music, Globe } from 'lucide-react';
import TournamentCard from '../components/TournamentCard';
import { API_BASE_URL } from '../config/api';
import { tournamentService } from '../services/tournamentService';

// Define the expected structure from the backend (adjust if User model populates more)
interface BackendTournamentCreator {
  _id: string;
  username: string;
  profilePictureUrl?: string;
  bio?: string;
  socials?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
  };
  website?: string;
  location?: string;
}

interface BackendTournament {
  _id: string;
  name: string;
  game: string;
  type: 'artist' | 'producer';
  startDate: string; // Assuming ISO string from backend
  endDate: string;   // Assuming ISO string from backend
  maxPlayers: number;
  description?: string;
  creator: BackendTournamentCreator | string; // Can be populated object or just ID string
  participants: string[]; // Array of participant IDs or populated objects
  status: 'Open' | 'In Progress' | 'Completed';
  createdAt: string;
  coverImageUrl?: string; // Added cover image URL
  language?: string;
  // Fields missing from backend but in card: prizePool, entryFee, language
}

// Define the structure TournamentCard expects (subset of its internal props)
interface UICardTournament {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  type: 'artist' | 'producer' | 'aux';
  genre: string;
  language: string;
  status: 'Open' | 'In Progress' | 'Completed';
  rules: string[];
  participants: any[];  organizer: {
    id: string;
    username: string; // Changed from name to username to match main Organizer interface
    avatar: string;
    bio: string;
    socials?: { 
      twitter?: string; 
      instagram?: string; 
      soundcloud?: string;
      spotify?: string;
    };
    website?: string;
    location?: string;
  };
  prizes: any[];
}

const TournamentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(''); // What user types
  const [searchTerm, setSearchTerm] = useState(''); // What gets sent to API (debounced)
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');  const [sortBy, setSortBy] = useState('latest');
  const [tournaments, setTournaments] = useState<UICardTournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Start with true to prevent initial focus loss
  const [error, setError] = useState<string | null>(null);
    // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Ref to maintain focus on search input
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tournamentType = searchParams.get('type') || 'artist';

  // Set search term from URL parameter on component mount
  React.useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchInput(searchFromUrl);
      setSearchTerm(searchFromUrl);
    } else {
      setSearchInput('');
      setSearchTerm('');
    }
  }, [searchParams]);

  // Debounce search input - wait 300ms after user stops typing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const trimmedInput = searchInput.trim();
      // Only update searchTerm if it's actually different to avoid unnecessary re-renders
      setSearchTerm(prev => {
        if (trimmedInput !== prev) {
          setCurrentPage(1); // Reset to first page when search changes
          return trimmedInput;
        }
        return prev;
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchInput]);

  // Define tournament types and their display names
  const tournamentTypes = {
    artist: 'Artist Tournaments',
    producer: 'Producer Tournaments',
    aux: 'Aux Battles'
  };

  const genres = ['All Genres', 'Any Genre', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Indie', 'Folk'];
  const statuses = ['All Statuses', 'Open', 'In Progress', 'Completed'];
  const languages = ['All Languages', 'Any Language', 'English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese (Mandarin)', 'Other'];
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'prizeHighToLow', label: 'Prize: High to Low' },
    { value: 'prizeLowToHigh', label: 'Prize: Low to High' },
    { value: 'endingSoon', label: 'Ending Soon' }
  ];
  useEffect(() => {
    const fetchTournaments = async () => {
      // Store the currently focused element and cursor position
      const activeElement = document.activeElement;
      const wasSearchInputFocused = activeElement === searchInputRef.current;
      const cursorPosition = wasSearchInputFocused && searchInputRef.current ? searchInputRef.current.selectionStart : null;
      
      // Only show loading for initial load or page changes, not for search
      if (!tournaments.length) {
        setLoading(true);
      }
      setError(null);
      try {        
        // Use the new filtered tournaments service method with search
        const data = await tournamentService.getFilteredTournaments({
          page: currentPage,
          type: tournamentType === 'artist' || tournamentType === 'producer' ? tournamentType : undefined,
          status: selectedStatus && selectedStatus !== 'All Statuses' ? selectedStatus : undefined,
          genre: selectedGenre && selectedGenre !== 'All Genres' ? selectedGenre : undefined,
          language: selectedLanguage && selectedLanguage !== 'All Languages' ? selectedLanguage : undefined,
          search: searchTerm || undefined
        });
        
        // The backend returns { tournaments: BackendTournament[], pagination: { total, page, limit, pages } }
        const backendTournaments = data.tournaments as any[] as BackendTournament[];
        setTotalTournaments(data.pagination?.total || data.tournaments.length);
        setTotalPages(data.pagination?.pages || Math.ceil((data.pagination?.total || data.tournaments.length) / 15));        const transformedTournaments = backendTournaments.map(t => {
          // Basic transformation
          let organizerId = 'temp-org-id';
          let organizerName = 'N/A';
          let organizerAvatar = '/default-avatar.png'; // Default placeholder
          let organizerBio = 'No bio available.';
          let organizerSocials = {};
          let organizerWebsite = '';
          let organizerLocation = '';

          if (typeof t.creator === 'object' && t.creator !== null && t.creator._id) {
            organizerId = t.creator._id;
            organizerName = t.creator.username;
            // Construct the URL to the new backend endpoint
            organizerAvatar = t.creator.profilePictureUrl || '/default-avatar.png';
            organizerBio = t.creator.bio || 'No bio available.';
            organizerSocials = t.creator.socials || {};
            organizerWebsite = t.creator.website || '';
            organizerLocation = t.creator.location || '';
          }          // Status mapping - backend already uses the correct UI status values
          let uiStatus: 'Open' | 'In Progress' | 'Completed' = t.status;

          // Type mapping - use backend type, default to 'artist' for backwards compatibility
          const cardType: 'artist' | 'producer' | 'aux' = (t.type as 'artist' | 'producer') || 'artist';

          return {
            id: t._id,
            title: t.name,
            description: t.description || 'No description available.',
            coverImage: t.coverImageUrl || 'https://picsum.photos/seed/' + t._id + '/600/400',
            prizePool: 0,
            entryFee: 0,
            language: t.language || 'Any Language',
            type: cardType,
            rules: [],
            prizes: [],
            startDate: t.startDate,
            endDate: t.endDate,
            participants: t.participants,
            maxParticipants: t.maxPlayers,
            genre: t.game,
            status: uiStatus,            organizer: {
              id: organizerId,
              username: organizerName, // Using username to match the main Organizer interface
              avatar: organizerAvatar, // This will now be the direct URL to the image endpoint
              bio: organizerBio,
              socials: organizerSocials,
              website: organizerWebsite,
              location: organizerLocation,
            },
          };
        });
        setTournaments(transformedTournaments);
        
        // Restore focus and cursor position to search input if it was focused before the API call
        if (wasSearchInputFocused && searchInputRef.current) {
          // Use setTimeout to ensure DOM has updated
          setTimeout(() => {
            if (searchInputRef.current) {
              searchInputRef.current.focus();
              // Restore cursor position if we have it
              if (cursorPosition !== null) {
                searchInputRef.current.setSelectionRange(cursorPosition, cursorPosition);
              }
            }
          }, 0);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        console.error("Failed to fetch tournaments:", err);
      }
      setLoading(false);
    };

    fetchTournaments();
  }, [currentPage, selectedStatus, selectedGenre, selectedLanguage, tournamentType, searchTerm]); // Refetch when any filter or search changes
  
  // Sort tournaments - backend handles filtering and search
  const processedTournaments = useMemo(() => {
    let filtered = tournaments;
    
    // Sort only if necessary (backend already handles search and filtering)
    if (sortBy !== 'latest') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'prizeHighToLow':
            return b.prizePool - a.prizePool;
          case 'prizeLowToHigh':
            return a.prizePool - b.prizePool;
          case 'endingSoon':
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  }, [tournaments, sortBy]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchInput(search); // Update input immediately for responsive UI
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre);
    setCurrentPage(1); // Reset to first page when changing filter
  }, []);

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
    setCurrentPage(1); // Reset to first page when changing filter
  }, []);

  // Memoize pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, handlePageChange]);
  // Generic select class for re-use - styled to match tournament cards
  const selectClass = `block w-full pl-4 pr-10 py-2 bg-gray-800/80 border border-white/10 rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 text-white 
    appearance-none transition-all duration-300 ease-in-out transform hover:bg-gray-800/90 
    hover:border-white/15 hover:scale-[1.02] hover:shadow-lg whitespace-nowrap
    active:scale-[0.98] active:shadow-sm select-text backdrop-blur-sm`;

  // Wrapper class for select containers to handle width transitions
  const selectWrapperClass = "relative inline-block w-full md:w-48 group transition-all duration-300 ease-in-out";

  if (loading) {
    return (
      <div className="min-h-screen py-12 relative">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Preserve header structure while loading */}
          <div className="mb-10">
            <h1 
              className="text-4xl font-bold mb-6 text-white"
              style={{ 
                fontFamily: "'Crashbow', 'Impact', sans-serif",
                color: '#ffffff',
                textShadow: '0 0 10px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.1), 0 0 30px rgba(255, 255, 255, 0.1)',
                letterSpacing: '4px'
              }}
            >
              {tournamentTypes[tournamentType as keyof typeof tournamentTypes]}
            </h1>
            
            {/* Skeleton for filter bar */}
            <div className="backdrop-blur-sm rounded-xl border border-white/5 mb-8 h-24 bg-gray-800/20 animate-pulse"></div>
            
            {/* Skeleton for tournament grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[2000px] mx-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-[500px] bg-gray-800/20 rounded-xl animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }
  return (
    <div className="min-h-screen py-12 relative">      {/* Coming Soon Overlay for Aux Battles */}
      {tournamentType === 'aux' && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
          <div className="text-center">
            <h1 className="text-8xl md:text-9xl font-crashbow bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-8">
              COMING SOON
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Aux Battles are currently under development
            </p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">          <h1 
            className="text-4xl font-bold mb-6 text-white transform translate3d(0,0,0) will-change-auto"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.1), 0 0 30px rgba(255, 255, 255, 0.1)',
              letterSpacing: '4px'
            }}
          >
            {tournamentTypes[tournamentType as keyof typeof tournamentTypes]}
          </h1>

          {/* Type Navigation */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link 
              to="/tournaments?type=artist"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                tournamentType === 'artist' 
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Artist Tournaments
            </Link>
            <Link 
              to="/tournaments?type=producer"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                tournamentType === 'producer' 
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Producer Tournaments
            </Link>
            <Link 
              to="/tournaments?type=aux"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                tournamentType === 'aux' 
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Aux Battles
            </Link>
          </div>
            {/* Search and Filter Bar */}
          <div 
            className="backdrop-blur-sm rounded-xl border border-white/5 mb-8 relative overflow-hidden"
            style={{ 
              background: 'rgba(15, 15, 20, 0.7)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
            }}
          >
            {/* Subtle accent bar at top */}
            <div 
              className="h-1 w-full"
              style={{
                background: 'linear-gradient(to right, rgba(56, 178, 172, 0.6), rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.3))'
              }}
            ></div>
            
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="flex-grow relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search tournaments, creators, genres..."
                  className={`${selectClass.replace('pl-4', 'pl-12')}`}
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              
              {/* Genre Filter */}
              <div className={selectWrapperClass}>
                <select
                  className={selectClass}
                  value={selectedGenre}
                  onChange={(e) => handleGenreChange(e.target.value)}
                >
                  {genres.map(genre => (
                    <option 
                      key={genre} 
                      value={genre}
                      className="bg-gray-800 text-white transition-colors duration-300 hover:bg-gray-700 whitespace-nowrap"
                    >
                      {genre}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-4 w-4 text-pink-400 transition-colors duration-300 group-hover:text-pink-300" />
                </div>
              </div>

              {/* Language Filter */}
              <div className={selectWrapperClass}>
                <select
                  className={selectClass}
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  {languages.map(language => (
                    <option 
                      key={language} 
                      value={language}
                      className="bg-gray-800 text-white transition-colors duration-300 hover:bg-gray-700 whitespace-nowrap"
                    >
                      {language}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300" />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className={selectWrapperClass}>
                <select
                  className={selectClass}
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {statuses.map(status => (
                    <option 
                      key={status} 
                      value={status}
                      className="bg-gray-800 text-white transition-colors duration-300 hover:bg-gray-700 whitespace-nowrap"
                    >
                      {status}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-4 w-4 text-purple-400 transition-colors duration-300 group-hover:text-purple-300" />
                </div>
              </div>
              
              {/* Sort By */}
              <div className={selectWrapperClass}>
                <select
                  className={selectClass}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="bg-gray-800 text-white transition-colors duration-300 hover:bg-gray-700 whitespace-nowrap"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="text-purple-400 text-lg transition-colors duration-300 group-hover:text-purple-300">↕</div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Results Count - Memoized to prevent unnecessary re-renders */}
          <div className="mb-6 text-cyan-400/80 transform translate3d(0,0,0) will-change-auto">
            Showing {processedTournaments.length} of {totalTournaments} tournaments 
            {totalTournaments > 15 && (
              <span className="ml-2 text-cyan-300">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>

          {/* Tournament Grid */}
          <div className="min-h-[1000px]"> {/* Reserve minimum height to prevent layout shift */}
            {processedTournaments.length > 0 ? (
              <>              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[2000px] mx-auto">
                {processedTournaments.map((tournament) => (
                  <div key={tournament.id} className="will-change-transform">
                    <TournamentCard tournament={tournament} />
                  </div>
                ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-4">
                  {/* Previous Button */}
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg ${
                      currentPage === 1
                        ? 'bg-gray-800/60 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/50'
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex space-x-2">
                    {/* Show first page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="px-4 py-2 rounded-lg text-cyan-400 bg-gray-800/60 hover:bg-cyan-500/20 transition-all duration-300"
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="text-gray-500 self-end">...</span>}
                      </>
                    )}
                    
                    {/* Show current page and surrounding pages */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                            page === currentPage
                              ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                              : 'text-cyan-400 bg-gray-800/60 hover:bg-cyan-500/20'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    
                    {/* Show last page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        {currentPage < totalPages - 3 && <span className="text-gray-500 self-end">...</span>}
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="px-4 py-2 rounded-lg text-cyan-400 bg-gray-800/60 hover:bg-cyan-500/20 transition-all duration-300"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-800/60 text-gray-500 cursor-not-allowed'
                        : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/50'
                    }`}
                  >
                    Next
                  </button>
                </div>                )}
              </>
            ) : (
              <div className="text-center py-16 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
                <Music className="mx-auto h-12 w-12 text-cyan-400" />
                <h3 className="mt-4 text-lg font-medium text-white">No tournaments found</h3>
                <p className="mt-2 text-cyan-400/70">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;