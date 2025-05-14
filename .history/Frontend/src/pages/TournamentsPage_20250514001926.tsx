import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Music, Globe } from 'lucide-react';
import TournamentCard from '../components/TournamentCard';
import { mockTournaments } from '../utils/mockData';
import AnimatedBackground from '../components/profile/AnimatedBackground';

const TournamentsPage: React.FC = () => {
  const [searchParams] = useSearchParams({ type: 'artist' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState('latest');

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

  // Filter and sort tournaments
  const filteredTournaments = mockTournaments.filter(tournament => {
    // Tournament type filter
    if (tournamentType !== 'all' && tournament.type !== tournamentType) {
      return false;
    }
    
    // Search filter
    if (searchTerm && !tournament.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Genre filter
    if (selectedGenre && selectedGenre !== 'All Genres' && tournament.genre !== selectedGenre) {
      return false;
    }
    
    // Status filter
    if (selectedStatus && selectedStatus !== 'All Statuses' && tournament.status !== selectedStatus) {
      return false;
    }

    // Language filter
    if (selectedLanguage && selectedLanguage !== 'All Languages' && tournament.language !== selectedLanguage) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'prizeHighToLow':
        return b.prizePool - a.prizePool;
      case 'prizeLowToHigh':
        return a.prizePool - b.prizePool;
      case 'endingSoon':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      case 'latest':
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    }
  });

  return (
    <div className="min-h-screen py-12 bg-black">
      {/* Fixed animated background */}
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 
            className="text-4xl font-bold mb-6 text-white"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#00ccff',
              textShadow: '0 0 10px rgba(0, 204, 255, 0.2), 0 0 20px rgba(0, 204, 255, 0.2), 0 0 30px rgba(0, 204, 255, 0.1)',
              letterSpacing: '4px'
            }}
          >
            {tournamentTypes[tournamentType as keyof typeof tournamentTypes]}
          </h1>

          {/* Type Navigation */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link 
              to="/tournaments"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                tournamentType === 'all' 
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Tournaments
            </Link>
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
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-gray-700/80"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 204, 255, 0.1)',
                  }}
                />
              </div>
              
              {/* Genre Filter */}
              <div className="relative inline-block w-full md:w-48">
                <select
                  className="block w-full pl-4 pr-10 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white appearance-none transition-all duration-300 hover:bg-gray-700/80"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 204, 255, 0.1)',
                  }}
                >
                  {genres.map(genre => (
                    <option 
                      key={genre} 
                      value={genre}
                      className="bg-gray-800 text-white"
                    >
                      {genre}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-4 w-4 text-pink-400" />
                </div>
              </div>

              {/* Language Filter */}
              <div className="relative inline-block w-full md:w-48">
                <select
                  className="block w-full pl-4 pr-10 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white appearance-none transition-all duration-300 hover:bg-gray-700/80"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 204, 255, 0.1)',
                  }}
                >
                  {languages.map(language => (
                    <option 
                      key={language} 
                      value={language}
                      className="bg-gray-800 text-white"
                    >
                      {language}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Globe className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              
              {/* Status Filter */}
              <div className="relative inline-block w-full md:w-48">
                <select
                  className="block w-full pl-4 pr-10 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white appearance-none transition-all duration-300 hover:bg-gray-700/80"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 204, 255, 0.1)',
                  }}
                >
                  {statuses.map(status => (
                    <option 
                      key={status} 
                      value={status}
                      className="bg-gray-800 text-white"
                    >
                      {status}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Filter className="h-4 w-4 text-purple-400" />
                </div>
              </div>
              
              {/* Sort By */}
              <div className="relative inline-block w-full md:w-48">
                <select
                  className="block w-full pl-4 pr-10 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white appearance-none transition-all duration-300 hover:bg-gray-700/80"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    boxShadow: '0 0 10px rgba(0, 204, 255, 0.1)',
                  }}
                >
                  {sortOptions.map(option => (
                    <option 
                      key={option.value} 
                      value={option.value}
                      className="bg-gray-800 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <div className="text-purple-400 text-lg">↕</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mb-6 text-cyan-400/80">
            Showing {filteredTournaments.length} tournaments
          </div>
          
          {/* Tournament Grid */}
          {filteredTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-[2000px] mx-auto">
              {filteredTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
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