import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Music, Globe } from 'lucide-react';
import TournamentCard from '../components/TournamentCard';
import { API_BASE_URL } from '../config/api';

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
  startDate: string; // Assuming ISO string from backend
  endDate: string;   // Assuming ISO string from backend
  maxPlayers: number;
  description?: string;
  creator: BackendTournamentCreator | string; // Can be populated object or just ID string
  participants: string[]; // Array of participant IDs or populated objects
  status: 'upcoming' | 'ongoing' | 'completed';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');  const [sortBy, setSortBy] = useState('latest');
  const [tournaments, setTournaments] = useState<UICardTournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
    // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTournaments, setTotalTournaments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const tournamentsPerPage = 15;

  const tournamentType = searchParams.get('type') || 'artist';

  // Define tournament types and their display names
  const tournamentTypes = {
    artist: 'Artist Tournaments',
    producer: 'Producer Tournaments',
    aux: 'Aux Battles'
  };

  const genres = ['All Genres', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Indie'];
  const statuses = ['All Statuses', 'Open', 'In Progress', 'Completed'];
  const languages = ['All Languages', 'English', 'Spanish', 'Chinese', 'French', 'German'];
  const sortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'prizeHighToLow', label: 'Prize: High to Low' },
    { value: 'prizeLowToHigh', label: 'Prize: Low to High' },
    { value: 'endingSoon', label: 'Ending Soon' }
  ];
  useEffect(() => {
    const fetchTournaments = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: tournamentsPerPage.toString(),
        });

        // Add status filter if selected
        if (selectedStatus && selectedStatus !== 'All Statuses') {
          const statusMap: { [key: string]: string } = {
            'Open': 'upcoming',
            'In Progress': 'ongoing', 
            'Completed': 'completed'
          };
          params.append('status', statusMap[selectedStatus] || '');
        }

        const response = await fetch(`${API_BASE_URL}/tournaments?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // The backend returns { tournaments: BackendTournament[], pagination: { total, page, limit, totalPages } }
        const backendTournaments: BackendTournament[] = data.tournaments;
        setTotalTournaments(data.pagination?.total || data.tournaments.length);
        setTotalPages(Math.ceil((data.pagination?.total || data.tournaments.length) / tournamentsPerPage));        const transformedTournaments = backendTournaments.map(t => {
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
          }

          // Status mapping
          let uiStatus: 'Open' | 'In Progress' | 'Completed'; // Explicitly type uiStatus
          if (t.status === 'ongoing') {
            uiStatus = 'In Progress';
          } else if (t.status === 'completed') {
            uiStatus = 'Completed';
          } else { // Covers 'upcoming' and any other fallback
            uiStatus = 'Open'; 
          }

          // Type mapping (placeholder)
          const cardType: 'artist' | 'producer' | 'aux' = 'artist'; // Explicitly typed placeholder

          return {
            id: t._id,
            title: t.username,
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
  }, [currentPage, selectedStatus]); // Refetch when page or status filter changes
  
  // Filter and sort tournaments - heavily memoized for better performance
  const processedTournaments = useMemo(() => {
    let filtered = tournaments;
    
    // Apply filters only if they have values (more efficient)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(tournament => 
        tournament.title.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    if (selectedGenre && selectedGenre !== 'All Genres') {
      filtered = filtered.filter(tournament => tournament.genre === selectedGenre);
    }

    if (selectedLanguage && selectedLanguage !== 'All Languages') {
      filtered = filtered.filter(tournament => tournament.language === selectedLanguage);
    }
    
    // Sort only if necessary
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
  }, [tournaments, searchTerm, selectedGenre, selectedLanguage, sortBy]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre(genre);
  }, []);

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
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

  // Generic select class for re-use
  const selectClass = `block w-full pl-4 pr-10 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-xl 
    focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white 
    appearance-none transition-all duration-300 ease-in-out transform hover:bg-gray-700/80 
    hover:border-cyan-500/50 hover:scale-[1.02] hover:shadow-lg whitespace-nowrap
    active:scale-[0.98] active:shadow-sm select-text`;

  // Wrapper class for select containers to handle width transitions
  const selectWrapperClass = "relative inline-block w-full md:w-48 group transition-all duration-300 ease-in-out";

  if (loading) {
    return <div className="text-center p-10">Loading tournaments...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 
            className="text-4xl font-bold mb-6 text-white"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#00ccff',
              textShadow: '0 0 10px rgba(0, 204, 255, 0.1), 0 0 20px rgba(0, 204, 255, 0.1), 0 0 30px rgba(0, 204, 255, 0.1)',
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
          <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-cyan-500/20 mb-8 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="flex-grow relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300" />
                </div>
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  className={`${selectClass} pl-10`}
                  value={searchTerm}
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
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="text-purple-400 text-lg transition-colors duration-300 group-hover:text-purple-300">↕</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6 text-cyan-400/80">
            Showing {processedTournaments.length} of {totalTournaments} tournaments 
            {totalTournaments > tournamentsPerPage && (
              <span className="ml-2 text-cyan-300">
                (Page {currentPage} of {totalPages})
              </span>
            )}
          </div>

          {/* Tournament Grid */}
          {processedTournaments.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[2000px] mx-auto">
                {processedTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
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
                </div>
              )}
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
  );
};

export default TournamentsPage;