import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// import { mockTournaments } from '../utils/mockData'; // Will fetch from backend
import { getGenreDisplayName } from '../utils/genreUtils';
import { API_BASE_URL } from '../config/api';
import {
  OrganizerCard,
  TournamentContent,
  TournamentHeader,
  TournamentBracket,
  // TournamentCoverImage // Ensure TournamentCoverImage is imported if used directly
} from '../components/tournament';
import { ArrowLeft } from 'lucide-react';
import { Participant, FrontendBracketMatchup } from '../types/tournament'; // Corrected import path
// import { AuthContext } from '../context/AuthContext'; // No longer directly using AuthContext
import { useAuth } from '../context/AuthContext'; // <<< USE useAuth hook
import defaultAvatar from '../assets/images/default-avatar.png'; // Import default avatar
import { Tabs, TabsContent } from '../components/ui/Tabs';

// Define the expected structure for the fetched tournament
// This should align with what getTournamentById in tournamentController returns
interface BackendTournamentCreator {
  _id: string;
  username: string;
  profilePictureUrl?: string; // This might be constructed on frontend or part of backend response
  // Add other fields from User model if populated and needed
  bio?: string; // Assuming organizer card might need this
  socials?: { 
    twitter?: string; 
    instagram?: string; 
    website?: string;
    soundcloud?: string;
    spotify?: string;
  };
  website?: string;
  location?: string;
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
  status: 'Open' | 'In Progress' | 'Completed';
  rules?: string[]; // Assuming it might exist
  creator: BackendTournamentCreator | string | null; // Can be populated object, ID string, or null
  coverImage?: string; // This field might not exist if we only use coverImageUrl
  coverImageUrl?: string; // Added cover image URL
  language?: string; // Assuming it might exist
  prizes?: any[]; // Define more strictly if possible
  generatedBracket?: FrontendBracketMatchup[]; // Add generatedBracket here
  bracketSize?: number; // Size of the generated bracket
  // any other fields your Tournament model has
}

interface FetchedTournamentData {
  tournament: BackendTournamentDetails;
  // matchups: BackendMatchup[]; // This will be removed as generatedBracket is the new source
}

const fixedColors = { primary: '0,204,255', secondary: '255,0,255', accent: '0,204,255' };

const TournamentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tournamentData, setTournamentData] = useState<FetchedTournamentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user: authUser, token } = useAuth(); // <<< Get both user and token from useAuth
  
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
      const response = await fetch(`${API_BASE_URL}/tournaments/${id}`);
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
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center relative z-10">
          <div 
            className="rounded-xl p-8 border border-white/5"
            style={{
              background: 'rgba(15, 15, 20, 0.7)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 204, 255, 0.1)'
            }}
          >
            <p className="text-white text-xl">Loading tournament details...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !tournamentData) {
    return (
      <div className="min-h-screen">
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
  
  const { tournament } = tournamentData;

  const transformedParticipants: Participant[] = tournament.participants.map(p => ({
    id: p._id,
    username: p.username,
    profilePictureUrl: p.profilePictureUrl || defaultAvatar, // Use imported defaultAvatar
    // rank is optional in global Participant type, so it can be omitted if not available
  }));
  // Transform creator data for OrganizerCard
  const organizerForCard = typeof tournament.creator === 'string' 
    ? { id: tournament.creator, username: 'Loading organizer...', avatar: defaultAvatar, bio: '' } // Use imported defaultAvatar
    : tournament.creator && typeof tournament.creator === 'object'
    ? {
        id: tournament.creator._id,
        username: tournament.creator.username,
        // Construct avatar URL if not directly provided, similar to TournamentsPage
        avatar: tournament.creator.profilePictureUrl || defaultAvatar, // Use imported defaultAvatar
        bio: tournament.creator.bio || 'Organizer bio not available.',
        socials: tournament.creator.socials || {},
        website: tournament.creator.website,
        location: tournament.creator.location
      }
    : { id: 'unknown', username: 'Unknown Organizer', avatar: defaultAvatar, bio: 'Organizer information not available.' };

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
    prizes = [],
    generatedBracket,
    bracketSize
  } = tournament;

  // Determine the final cover image URL to pass to the header
  const headerCoverImage = coverImageUrl || 'https://picsum.photos/seed/default-tournament/1200/400';

  // Use fixed color scheme for all tournaments
  const colors = fixedColors;

  // Get the genre display string
  const genreDisplay = getGenreDisplayName(genre);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' on ' + date.toLocaleDateString('en-US', {
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

  const isCreator = authUser && tournament.creator && typeof tournament.creator === 'object' && authUser.id === tournament.creator._id;

  const handleBeginTournament = async () => {
    if (!id || !tournamentData) return;
    // console.log('🔍 Frontend - Token exists:', !!token);
    // console.log('🔍 Frontend - Token length:', token?.length);
    // console.log('🔍 Frontend - API_BASE_URL:', API_BASE_URL);
    // console.log('🔍 Frontend - Tournament ID:', id);
    
    if (!token) {
      alert('Authentication required.');
      return;
    }

    if (window.confirm('Are you sure you want to begin this tournament? This action cannot be undone and will prevent new users from joining.')) {
      try {
        // console.log('🔍 Frontend - Making request to:', `${API_BASE_URL}/tournaments/${id}/begin`);
        const response = await fetch(`${API_BASE_URL}/tournaments/${id}/begin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        // console.log('🔍 Frontend - Response status:', response.status);
        const result = await response.json();
        // console.log('🔍 Frontend - Response data:', result);
        
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
    <div className="min-h-screen">
     {/* Centered header with limited width */}
<div className="w-full px-4 sm:px-6 relative z-10">
  <div className="grid grid-cols-12 gap-4 lg:gap-6 py-12">
    <div className="col-span-12 md:col-span-6 lg:col-span-8 md:col-start-4 lg:col-start-3">
      <TournamentHeader
        tournamentId={id!}
        title={title}
        genre={genreDisplay}
        language={language}
        status={status}
        daysLeft={calculateDaysLeft()}
        coverImage={headerCoverImage}
        prizePool={prizePool}
        entryFee={entryFee}
        participants={transformedParticipants.length}
        maxParticipants={maxParticipants}
        colors={colors}
        startDate={startDate}
        organizerName={tournament.creator && typeof tournament.creator === 'object' ? tournament.creator.username : 'Unknown'}
        organizerAvatar={tournament.creator && typeof tournament.creator === 'object' ? (tournament.creator.profilePictureUrl || defaultAvatar) : defaultAvatar}
        organizerId={tournament.creator && typeof tournament.creator === 'object' ? tournament.creator._id : undefined}
        onBeginTournament={isCreator && status === 'Open' ? handleBeginTournament : undefined}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 md:items-start">
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
                  colors={colors}
                  genre={genreDisplay}
                  language={language}
                  formatDate={formatDate}
                />
              </div>
              
              {/* Organizer card - matches the height of tournament content */}
              <div className="col-span-1">
                <div className="sticky top-6">
                  <OrganizerCard
                    organizer={organizerForCard}
                    colors={colors}
                  />
                </div>
              </div>
            </div>
          </div> {/* This closes the grid for TournamentContent and OrganizerCard */}
          
          {/* Tournament bracket - Now a direct child of the main grid, spanning its full width */}
          {tournament.status !== 'Open' && (
            <div className="col-span-12">
              <Tabs defaultValue="bracket" className="w-full">
                <TabsContent value="bracket" className="mt-0">
                  <TournamentBracket 
                    participants={transformedParticipants}
                    generatedBracket={generatedBracket}
                    bracketSize={bracketSize}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;