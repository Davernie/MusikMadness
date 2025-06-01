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
  const [isRefreshingUrls, setIsRefreshingUrls] = useState(false);
  
  // Define types for our matchup data (updated to match backend structure)
  interface Submission {
    id: string;
    songTitle: string;
    description: string;
    audioUrl: string;
    streamUrl?: string | null; // New field for presigned URLs
    originalFileName: string;
    mimetype?: string;
    audioType?: 'r2' | 'local'; // Indicates storage type
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

  interface StreamData {
    submissionId: string;
    streamUrl: string | null;
    audioType: 'r2' | 'local';
    expiresAt: string | null;
  }

  interface StreamUrlsResponse {
    matchupId: string;
    streamUrls: {
      player1: StreamData | null;
      player2: StreamData | null;
    };
    generatedAt: string;
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
  const [streamUrls, setStreamUrls] = useState<StreamUrlsResponse | null>(null);

  // Check if current user is the tournament creator
  const isCreator = authUser && tournament && tournament.creator && authUser.id === tournament.creator._id;
  const canSelectWinner = isCreator && tournament?.status === 'ongoing' && 
                          (matchup?.status === 'active' || matchup?.status === 'upcoming') && 
                          !matchup?.winnerParticipantId &&
                          matchup?.player1.id && matchup?.player2.id;

  // Function to refresh streaming URLs
  const refreshStreamUrls = async () => {
    if (!tournamentId || !matchupId) return;
    
    setIsRefreshingUrls(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchup/${matchupId}/stream-urls`, {
        headers: getDefaultHeaders()
      });
      
      if (response.ok) {
        const streamData = await response.json();
        setStreamUrls(streamData);
        
        // Update matchup with fresh streaming URLs
        if (matchup) {
          const updatedMatchup = { ...matchup };
          
          if (streamData.streamUrls.player1 && updatedMatchup.player1.submission) {
            updatedMatchup.player1.submission.streamUrl = streamData.streamUrls.player1.streamUrl;
            updatedMatchup.player1.submission.audioUrl = streamData.streamUrls.player1.streamUrl || updatedMatchup.player1.submission.audioUrl;
            updatedMatchup.player1.submission.audioType = streamData.streamUrls.player1.audioType;
          }
          
          if (streamData.streamUrls.player2 && updatedMatchup.player2.submission) {
            updatedMatchup.player2.submission.streamUrl = streamData.streamUrls.player2.streamUrl;
            updatedMatchup.player2.submission.audioUrl = streamData.streamUrls.player2.streamUrl || updatedMatchup.player2.submission.audioUrl;
            updatedMatchup.player2.submission.audioType = streamData.streamUrls.player2.audioType;
          }
          
          setMatchup(updatedMatchup);
        }
      } else {
        console.warn('Failed to refresh streaming URLs');
      }
    } catch (error) {
      console.error('Error refreshing streaming URLs:', error);
    } finally {
      setIsRefreshingUrls(false);
    }
  };

  // Auto-refresh URLs for R2 files that might expire
  useEffect(() => {
    if (matchup && streamUrls) {
      const hasR2Files = [streamUrls.streamUrls.player1, streamUrls.streamUrls.player2]
        .some(stream => stream && stream.audioType === 'r2' && stream.expiresAt);
      
      if (hasR2Files) {
        // Check if any URLs are close to expiring (within 5 minutes)
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        const needsRefresh = [streamUrls.streamUrls.player1, streamUrls.streamUrls.player2]
          .some(stream => {
            if (stream && stream.expiresAt) {
              const expiryTime = new Date(stream.expiresAt);
              return expiryTime <= fiveMinutesFromNow;
            }
            return false;
          });
        
        if (needsRefresh) {
          console.log('Stream URLs expiring soon, refreshing...');
          refreshStreamUrls();
        }
      }
    }
  }, [matchup, streamUrls]);

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
        
        // Fetch fresh streaming URLs after getting matchup data
        if (data.matchup) {
          await refreshStreamUrls();
        }
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-fuchsia-500/5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Back button with enhanced styling */}
        <button 
          onClick={handleBack}
          className="group flex items-center text-cyan-400 hover:text-cyan-300 transition-all duration-300 mb-8 
                     bg-gray-900/50 backdrop-blur-sm rounded-full px-4 py-2 border border-cyan-500/20 
                     hover:border-cyan-400/40 hover:bg-gray-900/70 hover:shadow-lg hover:shadow-cyan-500/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
          Back to Tournament
        </button>
        
        {/* Main container with enhanced glass morphism */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl 
                        shadow-cyan-500/5 relative overflow-hidden">
          {/* Animated border gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-fuchsia-500/20 to-cyan-500/20 
                          rounded-2xl opacity-30 animate-gradient bg-[length:200%_200%] pointer-events-none" />
          
          <div className="relative p-8">
            {/* Enhanced header with floating animation */}
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-fuchsia-400/10 rounded-full blur-3xl transform scale-150" />
              <h1 className="text-4xl md:text-5xl font-bold text-white relative z-10 animate-float">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 
                                animate-gradient bg-[length:200%_200%]">
                  Round {matchup.round} Matchup
                </span>
              </h1>
              <p className="text-gray-300 mt-3 text-lg opacity-80">{matchup.tournamentName}</p>
            </div>

          <div className="flex flex-col md:flex-row items-center justify-center mb-8">
            {/* First player */}
            <div className="md:w-[42%]">
              <TrackPlayer 
                track={{
                  id: matchup.player1.id || '',
                  title: matchup.player1.submission?.songTitle || matchup.player1.name,
                  artist: matchup.player1.artist,
                  audioUrl: matchup.player1.submission?.audioUrl || '',
                  streamUrl: matchup.player1.submission?.streamUrl,
                  audioType: matchup.player1.submission?.audioType
                }}
                competitorId={matchup.player1.id || ''}
                competitorProfileImage={matchup.player1.profilePictureUrl || undefined}
                isLeft={true}
                gradientStart="cyan"
                gradientEnd="blue"
                onUrlRefreshNeeded={refreshStreamUrls}
              />
              
              {/* Stream info for debugging */}
              {matchup.player1.submission?.audioType === 'r2' && (
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                  </svg>
                  Streaming from R2
                  {isRefreshingUrls && <span className="ml-1 animate-spin">⟳</span>}
                </div>
              )}
              
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
                
                {/* Refresh button for stream URLs */}
                {(matchup.player1.submission?.audioType === 'r2' || matchup.player2.submission?.audioType === 'r2') && (
                  <button
                    onClick={refreshStreamUrls}
                    disabled={isRefreshingUrls}
                    className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 text-xs bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 rounded-full border border-gray-500/30 transition-all disabled:opacity-50"
                    title="Refresh streaming URLs"
                  >
                    {isRefreshingUrls ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Refreshing
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                          <path d="M21 3v5h-5"/>
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                          <path d="M3 21v-5h5"/>
                        </svg>
                        Refresh
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {/* Second player */}
            <div className="md:w-[42%]">
              <TrackPlayer 
                track={{
                  id: matchup.player2.id || '',
                  title: matchup.player2.submission?.songTitle || matchup.player2.name,
                  artist: matchup.player2.artist,
                  audioUrl: matchup.player2.submission?.audioUrl || '',
                  streamUrl: matchup.player2.submission?.streamUrl,
                  audioType: matchup.player2.submission?.audioType
                }}
                competitorId={matchup.player2.id || ''}
                competitorProfileImage={matchup.player2.profilePictureUrl || undefined}
                isLeft={false}
                gradientStart="fuchsia"
                gradientEnd="purple"
                onUrlRefreshNeeded={refreshStreamUrls}
              />
              
              {/* Stream info for debugging */}
              {matchup.player2.submission?.audioType === 'r2' && (
                <div className="mt-2 text-xs text-gray-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                  </svg>
                  Streaming from R2
                  {isRefreshingUrls && <span className="ml-1 animate-spin">⟳</span>}
                </div>
              )}
              
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


