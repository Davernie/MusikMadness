import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// import { mockTournaments } from '../utils/mockData'; // Will fetch from backend
import { getGenreDisplayName } from '../utils/genreUtils';
import AnimatedBackground from '../components/profile/AnimatedBackground';
import {
  OrganizerCard,
  TournamentContent,
  TournamentHeader,
  TournamentBracket,
  // TournamentCoverImage // Ensure TournamentCoverImage is imported if used directly
} from '../components/tournament';

// Define props interface for TournamentBracket
interface TournamentBracketProps {
  matchups: BackendMatchup[];
}
import { ArrowLeft, PlayCircle } from 'lucide-react';
import { Participant } from '../types'; // <<< IMPORT Participant
// import { AuthContext } from '../context/AuthContext'; // No longer directly using AuthContext
import { useAuth } from '../context/AuthContext'; // <<< USE useAuth hook

// Define the expected structure for the fetched tournament
// This should align with what getTournamentById in tournamentController returns
interface BackendTournamentCreator {
  _id: string;
  username: string;
  profilePictureUrl?: string; // This might be constructed on frontend or part of backend response
  // Add other fields from User model if populated and needed
  bio?: string; // Assuming organizer card might need this
  socials?: { twitter?: string; instagram?: string; website?: string; };
}

interface BackendTrack {
  _id: string;
  title: string;
  artist: string; // Could be username or a separate artist name field
  url: string; // URL to the audio file
  //coverArt?: string; // Optional cover art for the track
}

interface BackendMatchup {
  _id: string;
  round: number;
  track1?: BackendTrack; 
  track2?: BackendTrack; 
  winner?: string; // track ID or participant ID
  votesTrack1?: number;
  votesTrack2?: number;
  // Add other fields from your Matchup model as needed
}

interface BackendTournamentDetails {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  prizePool?: number; // Assuming it might exist
  entryFee?: number;  // Assuming it might exist
  participants: { 
    _id: string; 
    username: string; 
    profilePictureUrl?: string; 
  }[]; // MODIFIED: Expecting array of populated participant objects
  maxPlayers: number;
  game: string; // genre
  status: 'upcoming' | 'ongoing' | 'completed';
  rules?: string[]; // Assuming it might exist
  creator: BackendTournamentCreator | string; // Can be populated object or just ID string
  coverImage?: string; // This field might not exist if we only use coverImageUrl
  coverImageUrl?: string; // Added cover image URL
  language?: string; // Assuming it might exist
  prizes?: any[]; // Define more strictly if possible
  // any other fields your Tournament model has
}

interface FetchedTournamentData {
  tournament: BackendTournamentDetails;
  matchups: BackendMatchup[];
}

const fixedColors = { primary: '0,204,255', secondary: '255,0,255', accent: '0,204,255' };

const TournamentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tournamentData, setTournamentData] = useState<FetchedTournamentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user: authUser } = useAuth(); // <<< Use useAuth() and alias user to authUser for consistency with previous logic
  
  const navigate = useNavigate();
  
  // Function to re-fetch tournament details, can be called after an action
  const fetchTournamentDetails = async () => {
    if (!id) {
      setError("Tournament ID is missing for re-fetch.");
      setLoading(false);
      return;
    }
    setLoading(true); // Indicate loading state during re-fetch
    // setError(null); // Optionally clear previous errors
    try {
      const response = await fetch(`http://localhost:5000/api/tournaments/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Tournament not found');
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FetchedTournamentData = await response.json();
      setTournamentData(data);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('An unknown error occurred during re-fetch');
      console.error("Failed to re-fetch tournament details:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTournamentDetails(); // Initial fetch
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Dependency on id ensures re-fetch if id changes
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-white/5">
            <p className="text-white text-xl">Loading tournament details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !tournamentData) {
    return (
      <div className="min-h-screen bg-black">
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4">{error || 'Tournament data could not be loaded.'}</h2>
            <Link to="/tournaments" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tournaments
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const { tournament, matchups } = tournamentData;

  const transformedParticipants: Participant[] = tournament.participants.map(p => ({
    id: p._id,
    username: p.username,
    profilePictureUrl: p.profilePictureUrl || '/default-avatar.png', // Default avatar if none
    // rank is optional in global Participant type, so it can be omitted if not available
  }));

  // Transform creator data for OrganizerCard
  const organizerForCard = typeof tournament.creator === 'string' 
    ? { id: tournament.creator, name: 'Loading organizer...', avatar: '/default-avatar.png', bio: '' } // Basic placeholder if only ID
    : {
        id: tournament.creator._id,
        name: tournament.creator.username,
        // Construct avatar URL if not directly provided, similar to TournamentsPage
        avatar: tournament.creator.profilePictureUrl || `http://localhost:5000/api/users/${tournament.creator._id}/profile-picture`,
        bio: tournament.creator.bio || 'Organizer bio not available.',
        socials: tournament.creator.socials
      };

  const {
    name: title,
    coverImageUrl,
    description = 'No description available.',
    startDate,
    endDate,
    prizePool = 0,
    entryFee = 0,
    maxPlayers: maxParticipants,
    game: genre,
    status,
    rules = [],
    language = 'N/A',
    prizes = []
  } = tournament;

  // Determine the final cover image URL to pass to the header
  const headerCoverImage = coverImageUrl || 'https://picsum.photos/seed/default-tournament/1200/400';

  // Update console.log to show the new headerCoverImage variable
  console.log('TournamentDetailsPage - headerCoverImage URL being passed to Header:', headerCoverImage);
  console.log('TournamentDetailsPage - raw coverImageUrl from data:', coverImageUrl);
  console.log('TournamentDetailsPage - tournament object:', tournament);

  // Use fixed color scheme for all tournaments
  const colors = fixedColors;

  // Get the genre display string
  const genreDisplay = getGenreDisplayName(genre);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const calculateDaysLeft = () => { // Renamed to avoid conflict
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const isCreator = authUser && typeof tournament.creator === 'object' && authUser.id === tournament.creator._id;

  const handleBeginTournament = async () => {
    if (!id || !tournamentData) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication required.');
      return;
    }

    if (window.confirm('Are you sure you want to begin this tournament? This action cannot be undone and will prevent new users from joining.')) {
      try {
        const response = await fetch(`http://localhost:5000/api/tournaments/${id}/begin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to begin tournament');
        }
        alert('Tournament successfully started!');
        // Update tournament data with the response from the begin endpoint
        // which should include the updated tournament object (with status: 'ongoing')
        setTournamentData(prevData => prevData ? { ...prevData, tournament: result.tournament } : null);
        // OR simply re-fetch all details if the response doesn't nest 'tournament' like that:
        // await fetchTournamentDetails(); 
      } catch (err) {
        alert(`Error beginning tournament: ${err instanceof Error ? err.message : String(err)}`);
        console.error("Error beginning tournament:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed animated background */}
      <AnimatedBackground />
      
     {/* Centered header with limited width */}
<div className="w-full px-4 sm:px-6 relative z-10">
  <div className="grid grid-cols-12 gap-4 lg:gap-6 py-12">
    <div className="col-span-12 md:col-span-6 lg:col-span-8 md:col-start-4 lg:col-start-3">
      <TournamentHeader
        tournamentId={id!}
        title={title}
        genre={genreDisplay}
        language={language}
        status={status === 'ongoing' ? 'In Progress' : status === 'completed' ? 'Completed' : 'Open'}
        daysLeft={calculateDaysLeft()}
        coverImage={headerCoverImage}
        prizePool={prizePool}
        entryFee={entryFee}
        participants={transformedParticipants.length}
        maxParticipants={maxParticipants}
        colors={colors}
        startDate={startDate}
      />
    </div>
  </div>
</div>
      
      {/* Main content - full width with padding */}
      <div className="w-full px-4 sm:px-6 pb-16 relative z-10">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Centered content - no sidebars */}
          <div className="col-span-12 md:col-start-3 md:col-span-8 lg:col-start-3 lg:col-span-8">
            {/* Tournament content with organizer card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Tournament content */}
              <div className="col-span-1 md:col-span-2">
                <TournamentContent
                  description={description}
                  startDate={startDate}
                  endDate={endDate}
                  prizes={prizes}
                  participants={transformedParticipants}
                  maxParticipants={maxParticipants}
                  rules={rules}
                  matchups={matchups}
                  colors={colors}
                  genre={genreDisplay}
                  language={language}
                  formatDate={formatDate}
                />
              </div>
              
              {/* Organizer card - with full height to match content and top margin to align headers */}
              <div className="col-span-1 flex flex-col h-full">
                <div className="mt-[0px] flex-grow h-full">
                  <OrganizerCard
                    organizer={organizerForCard}
                    colors={colors}
                    participants={transformedParticipants.length}
                    prizePool={prizePool}
                  />
                </div>
              </div>
            </div>

            {/* Creator Controls - Begin Tournament Button */}
            {isCreator && tournament.status === 'upcoming' && (
              <div className="col-span-12 md:col-start-3 md:col-span-8 lg:col-start-3 lg:col-span-8 mb-8 text-center">
                <button
                  onClick={handleBeginTournament}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Begin Tournament & Generate Bracket
                </button>
          {/* Tournament bracket - Now a direct child of the main grid, spanning its full width */}
          {tournament.status !== 'upcoming' && (
            <div className="col-span-12">
              <TournamentBracket matchups={matchups as TournamentBracketProps['matchups']} />
            </div>
          )}
          {tournament.status !== 'upcoming' && (
            <div className="col-span-12">
              <TournamentBracket matchups={matchups} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;