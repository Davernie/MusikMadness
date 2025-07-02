import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TournamentCard from './TournamentCard';
import { tournamentService } from '../services/tournamentService';
import { Loader } from 'lucide-react';

// Define the tournament interface to match what TournamentCard expects
interface Tournament {
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
  participants: any[];
  organizer: {
    id: string;
    username: string;
    avatar: string;
    bio: string;
    socials?: {
      soundcloud?: string;
      instagram?: string;
      twitter?: string;
      spotify?: string;
      youtube?: string;
      twitch?: string;
      kick?: string;
    };
    website?: string;
    location?: string;
  };
  prizes: any[];
  hasCustomPrize?: boolean;
  customPrizeText?: string;
}

// Memoized hero title component with hardware acceleration
const HeroTitle = React.memo(() => (
  <h1 
    className="leading-none mb-6 will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    <span 
      className="block text-6xl md:text-8xl"
      style={{ 
        fontFamily: "'Crashbow', 'Impact', sans-serif",
        color: '#00ccff', 
        textShadow: '0 0 10px rgba(0, 204, 255, 0.2), 0 0 20px rgba(0, 204, 255, 0.1)',
        letterSpacing: '4px',
        contain: 'layout style paint',
        willChange: 'transform'
      }}
    >
      JOIN THE
    </span>
    <span 
      className="block text-7xl md:text-9xl"
      style={{ 
        fontFamily: "'Crashbow', 'Impact', sans-serif",
        color: '#ff00ff', 
        textShadow: '0 0 15px rgba(255, 0, 255, 0.2), 0 0 30px rgba(255, 0, 255, 0.1)',
        letterSpacing: '4px',
        contain: 'layout style paint',
        willChange: 'transform'
      }}
    >
      MADNESS
    </span>
  </h1>
));

// Memoized hero description text with hardware acceleration
const HeroDescription = React.memo(() => (
  <p 
    className="text-xl mb-12 max-w-2xl mx-auto will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    Join MusikMadness and compete in the highest tier of music tournaments. Creators post contests, artists submit your tracks and fans enjoy the show!
  </p>
));

// Memoized action buttons with hardware acceleration
const HeroButtons = React.memo(() => (
  <div 
    className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    <Link
      to="/register"
      className="inline-block bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-pink-700 transition duration-300 shadow-lg will-change-transform"
      style={{ 
        boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)',
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      Join the Madness
    </Link>
    <Link
      to="/live-streams"
      className="inline-block border border-cyan-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-cyan-500/20 transition duration-300 will-change-transform"
      style={{ 
        boxShadow: '0 0 10px rgba(0, 204, 255, 0.3)',
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      Watch Battles
    </Link>
  </div>
));

// Memoized "Powered by" attribution with hardware acceleration
const PoweredByAttribution = React.memo(() => (
  <div 
    className="mt-8 text-center will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    <p className="text-gray-400 text-sm">
      Powered by{' '}
      <a 
        href="https://beatmatchmaker.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200 underline decoration-cyan-400/50 hover:decoration-cyan-300"
        style={{ 
          contain: 'layout style paint',
          willChange: 'transform'
        }}
      >
        Beat Matchmaker
      </a>
    </p>
  </div>
));

// Memoized browse tournaments title component with hardware acceleration
const BrowseTournamentsTitle = React.memo(() => (
  <h2 
    className="text-4xl md:text-5xl font-bold mb-10 will-change-transform"
    style={{ 
      fontFamily: "'Crashbow', 'Impact', sans-serif",
      color: 'rgb(255, 255, 255)',
      letterSpacing: '5px',
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    BROWSE TOURNAMENTS
  </h2>
));

const HeroSection: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTournaments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all tournaments from the database
        const response = await tournamentService.getFilteredTournaments({
          page: 1,
        });
        
        const backendTournaments = response.tournaments || [];
        
        // Transform backend data to match UI expectations
        const transformedTournaments: Tournament[] = backendTournaments.map((t: any) => {
          // Handle organizer data
          let organizerId = 'temp-org-id';
          let organizerName = 'N/A';
          let organizerAvatar = '/default-avatar.png';
          let organizerBio = 'No bio available.';
          let organizerSocials = {};
          let organizerWebsite = '';
          let organizerLocation = '';

          if (typeof t.creator === 'object' && t.creator !== null && t.creator._id) {
            organizerId = t.creator._id;
            organizerName = t.creator.username;
            organizerAvatar = t.creator.profilePictureUrl || '/default-avatar.png';
            organizerBio = t.creator.bio || 'No bio available.';
            organizerSocials = t.creator.socials || {};
            organizerWebsite = t.creator.website || '';
            organizerLocation = t.creator.location || '';
          }

          return {
            id: t._id,
            title: t.name,
            description: t.description || 'No description available.',
            coverImage: t.coverImageUrl || `https://picsum.photos/seed/${t._id}/600/400`,
            prizePool: 0,
            entryFee: 0,
            language: t.language || 'Any Language',
            type: (t.type as 'artist' | 'producer') || 'artist',
            rules: [],
            prizes: [],
            startDate: t.startDate,
            endDate: t.endDate,
            participants: t.participants || [],
            maxParticipants: t.maxPlayers,
            genre: t.game,
            status: t.status,
            organizer: {
              id: organizerId,
              username: organizerName,
              avatar: organizerAvatar,
              bio: organizerBio,
              socials: organizerSocials,
              website: organizerWebsite,
              location: organizerLocation,
            },
          };
        });
        
                 // Get tournaments with different genres, prioritizing by participant count
         const getTopTournamentsWithDifferentGenres = (tournaments: Tournament[]): Tournament[] => {
           const sortedByParticipants = tournaments.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));
           const selectedTournaments: Tournament[] = [];
           const usedGenres = new Set<string>();
           
           // First pass: get tournaments with unique genres
           for (const tournament of sortedByParticipants) {
             if (!usedGenres.has(tournament.genre) && selectedTournaments.length < 3) {
               selectedTournaments.push(tournament);
               usedGenres.add(tournament.genre);
             }
           }
           
           // If we don't have 3 tournaments yet, fill with remaining tournaments (even if genres repeat)
           if (selectedTournaments.length < 3) {
             for (const tournament of sortedByParticipants) {
               if (!selectedTournaments.includes(tournament) && selectedTournaments.length < 3) {
                 selectedTournaments.push(tournament);
               }
             }
           }
           
           return selectedTournaments;
         };
         
         const sortedTournaments = getTopTournamentsWithDifferentGenres(transformedTournaments);
        
        setTournaments(sortedTournaments);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
        setError('Failed to load tournaments');
      } finally {
        setLoading(false);
      }
    };

    fetchTopTournaments();
  }, []);

  return (
    <div className="relative text-white min-h-screen">
      {/* Main hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* JOIN THE MADNESS text with neon effect and Crashbow font */}
          <HeroTitle />
          
          <HeroDescription />
          
          <HeroButtons />
          
          <PoweredByAttribution />
        </div>
      </div>
      
      {/* Browse Tournaments section */}
      <div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        style={{ 
          contain: 'layout style paint',
          isolation: 'isolate'
        }}
      >
        <div 
          className="text-center mb-16"
          style={{ 
            contain: 'layout style paint',
            willChange: 'transform'
          }}
        >
          <BrowseTournamentsTitle />
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="animate-spin h-8 w-8 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-400/70">Loading tournaments...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-red-500/20">
            <p className="text-red-400 mb-4">Failed to load tournaments</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">No Tournaments Yet</h3>
              <p className="text-cyan-400/70 mb-6">Be the first to create an exciting music tournament!</p>
              <Link
                to="/create-tournament"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create First Tournament
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
            
            {/* View All Tournaments Link */}
            <div className="text-center mt-12">
              <Link
                to="/tournaments"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 hover:border-purple-400/50 text-white font-semibold rounded-xl hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm group transform hover:scale-105"
                style={{
                  fontFamily: "'Crashbow', 'Impact', sans-serif",
                  letterSpacing: '2px'
                }}
              >
                <span className="mr-2">VIEW ALL TOURNAMENTS</span>
                <svg 
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroSection;