import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TournamentCard from './TournamentCard';
import { ChevronRight, Loader } from 'lucide-react';
import { tournamentService } from '../services/tournamentService';

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

const FeaturedTournaments: React.FC = () => {
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
          // Don't limit by status - get all tournaments
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

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10 backdrop-blur-sm bg-black/20 p-6 rounded-2xl">
            <h2 className="text-3xl font-bold text-white">Browse Tournaments</h2>
            <Link to="/tournaments" className="text-white hover:text-white flex items-center text-sm font-medium">
              View All Tournaments
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="animate-spin h-8 w-8 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-400/70">Loading tournaments...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10 backdrop-blur-sm bg-black/20 p-6 rounded-2xl">
            <h2 className="text-3xl font-bold text-white">Browse Tournaments</h2>
            <Link to="/tournaments" className="text-white hover:text-white flex items-center text-sm font-medium">
              View All Tournaments
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="text-center py-16 bg-gray-800/60 backdrop-blur-sm rounded-xl border border-red-500/20">
            <p className="text-red-400 mb-4">Failed to load tournaments</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10 backdrop-blur-sm bg-black/20 p-6 rounded-2xl">
          <h2 className="text-3xl font-bold text-white">Browse Tournaments</h2>
          <Link to="/tournaments" className="text-white hover:text-white flex items-center text-sm font-medium">
            View All Tournaments
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {tournaments.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link
                to="/create-tournament"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300"
              >
                Create Your Own Tournament
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedTournaments;