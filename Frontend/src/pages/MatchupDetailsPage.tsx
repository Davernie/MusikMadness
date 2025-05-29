import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/profile/AnimatedBackground';
import TrackPlayer from '../components/tournament/TrackPlayer';
import { API_BASE_URL, getDefaultHeaders } from '../utils/apiConfig';
import { useAuth } from '../context/AuthContext';
import './MatchupDetailsPage.css';

// Component to display a matchup between two tracks with voting
const MatchupDetailsPage: React.FC = () => {
  const { tournamentId, matchupId } = useParams<{ tournamentId: string; matchupId: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  
  // Define types for our matchup data (updated to match backend structure)
  interface Submission {
    id: string;
    songTitle: string;
    description: string;
    audioUrl: string;
    originalFileName: string;
  }

  interface Competitor {
    id: string | null;
    name: string;
    artist: string;
    score: number;
    profilePictureUrl: string | null;
    submission: Submission | null;
  }
  
  interface MatchupData {
    id: string;
    tournamentId: string;
    tournamentName: string;
    round: number;
    player1: Competitor;
    player2: Competitor;
    status: 'active' | 'completed' | 'upcoming' | 'bye';
    winnerParticipantId?: string | null;
  }

  interface TournamentData {
    _id: string;
    creator: {
      _id: string;
      username: string;
    };
    status: 'upcoming' | 'ongoing' | 'completed';
  }
  
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Check if current user is the tournament creator
  const isCreator = authUser && tournament && tournament.creator && authUser.id === tournament.creator._id;
  const canSelectWinner = isCreator && tournament?.status === 'ongoing' && 
                          (matchup?.status === 'active' || matchup?.status === 'upcoming') && 
                          !matchup?.winnerParticipantId &&
                          matchup?.player1.id && matchup?.player2.id;

  // Fetch matchup data
  useEffect(() => {
    const fetchMatchupData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchup/${matchupId}`, {
          headers: getDefaultHeaders()
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch matchup data');
        }
        
        const data = await response.json();
        console.log('Matchup data received:', data); // For debugging
        setMatchup(data.matchup);
      } catch (err) {
        console.error('Error fetching matchup data:', err);
        setError(`Failed to load matchup details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTournamentData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`, {
          headers: getDefaultHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch tournament data');
        }
        
        const data = await response.json();
        setTournament(data.tournament);
      } catch (err) {
        console.error('Error fetching tournament data:', err);
      }
    };
    
    if (tournamentId && matchupId) {
      fetchMatchupData();
      fetchTournamentData();
    }
  }, [tournamentId, matchupId]);

  // Handle winner selection
  const handleSelectWinner = async (playerId: string) => {
    if (isSelectingWinner || !matchup || !canSelectWinner || !playerId) return;
    
    const playerName = playerId === matchup.player1.id ? matchup.player1.name : matchup.player2.name;
    
    if (!window.confirm(`Are you sure you want to select ${playerName} as the winner? This action cannot be undone.`)) {
      return;
    }
    
    setIsSelectingWinner(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchup/${matchupId}/winner`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ winnerParticipantId: playerId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to select winner');
      }
      
      const data = await response.json();
      
      // Show success message
      alert(`${playerName} has been selected as the winner!`);
      
      // Navigate back to tournament page to see updated bracket
      navigate(`/tournaments/${tournamentId}`);
    } catch (err) {
      console.error('Error selecting winner:', err);
      alert(`Failed to select winner: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSelectingWinner(false);
    }
  };
  
  // Handle voting (deprecated for manual winner selection, but keeping for future use)
  const handleVote = async (playerId: string) => {
    if (isVoting || !matchup) return;
    
    setIsVoting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchup/${matchupId}/vote`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ playerId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      const data = await response.json();
      setMatchup(data.matchup);
      
      // Get player name safely
      const playerName = playerId === matchup.player1.id ? matchup.player1.name : matchup.player2.name;
      
      // Show success message
      alert(`Thank you for voting for ${playerName}!`);
    } catch (err) {
      console.error('Error submitting vote:', err);
      alert('Failed to submit your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleBack = () => {
    navigate(`/tournaments/${tournamentId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading matchup details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-md rounded-xl border border-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // No matchup data
  if (!matchup) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-md rounded-xl border border-yellow-500/30">
          <h2 className="text-xl font-bold text-white mb-2">Matchup Not Found</h2>
          <p className="text-gray-300 mb-4">This matchup might have been removed or doesn't exist.</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            Back to Tournament
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <button 
          onClick={handleBack}
          className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Tournament
        </button>
        
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">
              Round {matchup.round} Matchup
            </span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center mb-8">
            {/* First player */}
            <div className="md:w-[42%]">
              <TrackPlayer 
                track={{
                  id: matchup.player1.id || '',
                  title: matchup.player1.name,
                  artist: matchup.player1.artist,
                  audioUrl: matchup.player1.submission?.audioUrl || ''
                }}
                competitorId={matchup.player1.id || ''}
                competitorProfileImage={matchup.player1.profilePictureUrl || undefined}
                isLeft={true}
                gradientStart="cyan"
                gradientEnd="blue"
              />
              {matchup.status === 'active' && matchup.player1.id && (
                <button 
                  onClick={() => handleVote(matchup.player1.id!)}
                  disabled={isVoting}
                  className={`mt-4 w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 
                    hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg 
                    text-center transform transition hover:scale-105 
                    ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isVoting ? 'Submitting...' : `Vote for ${matchup.player1.name}`}
                </button>
              )}
              {canSelectWinner && matchup.player1.id && (
                <button 
                  onClick={() => handleSelectWinner(matchup.player1.id!)}
                  disabled={isSelectingWinner}
                  className={`mt-2 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 
                    hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg 
                    text-center transform transition hover:scale-105 border-2 border-green-400/30
                    ${isSelectingWinner ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSelectingWinner ? 'Selecting...' : `Select ${matchup.player1.name} as Winner`}
                </button>
              )}
              {matchup.winnerParticipantId === matchup.player1.id && (
                <div className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 
                  border-2 border-yellow-400/50 text-yellow-300 font-medium rounded-lg text-center">
                  🏆 Winner
                </div>
              )}
            </div>
            
            {/* VS divider */}
            <div className="md:w-[16%] flex items-center justify-center py-6 md:py-0">
              <div className="relative">
                <div className="rounded-full bg-gradient-to-r from-cyan-500/80 to-fuchsia-500/80 backdrop-blur-md p-1.5">
                  <div className="rounded-full bg-black/70 backdrop-blur-md p-4 md:p-5 border border-white/30 shadow-lg">
                    <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">VS</div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 md:w-44 h-36 md:h-44 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-full blur-xl -z-10"></div>
              </div>
            </div>
            
            {/* Second player */}
            <div className="md:w-[42%]">
              <TrackPlayer 
                track={{
                  id: matchup.player2.id || '',
                  title: matchup.player2.name,
                  artist: matchup.player2.artist,
                  audioUrl: matchup.player2.submission?.audioUrl || ''
                }}
                competitorId={matchup.player2.id || ''}
                competitorProfileImage={matchup.player2.profilePictureUrl || undefined}
                isLeft={false}
                gradientStart="fuchsia"
                gradientEnd="purple"
              />
              {matchup.status === 'active' && matchup.player2.id && (
                <button 
                  onClick={() => handleVote(matchup.player2.id!)}
                  disabled={isVoting}
                  className={`mt-4 w-full py-3 px-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 
                    hover:from-fuchsia-600 hover:to-purple-700 text-white font-medium rounded-lg 
                    text-center transform transition hover:scale-105
                    ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isVoting ? 'Submitting...' : `Vote for ${matchup.player2.name}`}
                </button>
              )}
              {canSelectWinner && matchup.player2.id && (
                <button 
                  onClick={() => handleSelectWinner(matchup.player2.id!)}
                  disabled={isSelectingWinner}
                  className={`mt-2 w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 
                    hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg 
                    text-center transform transition hover:scale-105 border-2 border-green-400/30
                    ${isSelectingWinner ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSelectingWinner ? 'Selecting...' : `Select ${matchup.player2.name} as Winner`}
                </button>
              )}
              {matchup.winnerParticipantId === matchup.player2.id && (
                <div className="mt-2 w-full py-3 px-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 
                  border-2 border-yellow-400/50 text-yellow-300 font-medium rounded-lg text-center">
                  🏆 Winner
                </div>
              )}
            </div>
          </div>
            
          {/* Voting status */}
          {matchup.status === 'active' && matchup.winnerParticipantId && (
            <div className="text-center text-gray-300">
              <p>Winner: {matchup.winnerParticipantId === matchup.player1.id ? matchup.player1.name : matchup.player2.name}</p>
            </div>
          )}

          {/* Matchup Status */}
          <div className="mt-8 text-center">
            {matchup.status === 'completed' && matchup.winnerParticipantId && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">🏆 Matchup Complete</h3>
                <p className="text-gray-300">
                  Winner: <span className="text-yellow-300 font-semibold">
                    {matchup.winnerParticipantId === matchup.player1.id ? matchup.player1.name : matchup.player2.name}
                  </span>
                </p>
              </div>
            )}

            {isCreator && (
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg p-4">
                <h3 className="text-lg font-bold text-blue-300 mb-2">Tournament Creator Controls</h3>
                {canSelectWinner ? (
                  <p className="text-gray-300 text-sm">
                    As the tournament creator, you can select the winner of this matchup using the green buttons above.
                  </p>
                ) : matchup.winnerParticipantId ? (
                  <p className="text-gray-300 text-sm">
                    Winner has been selected. The bracket will be updated automatically.
                  </p>
                ) : (
                  <p className="text-gray-300 text-sm">
                    This matchup is not ready for winner selection yet.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupDetailsPage;


