import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useParams, useNavigate } from 'react-router-dom';
import TrackPlayer from '../components/tournament/TrackPlayer';
import { API_BASE_URL } from '../utils/apiConfig';
import { useAuth } from '../context/AuthContext';
import defaultUserAvatar from '../assets/images/default-avatar.png'; // Import default avatar
import './MatchupDetailsPage.css';

// Component to display a matchup between two tracks with voting
const MatchupDetailsPage: React.FC = () => {
  const { tournamentId, matchupId } = useParams<{ tournamentId: string; matchupId: string }>();
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [isRefreshingUrls, setIsRefreshingUrls] = useState(false);    // Define types for our matchup data (updated to match backend structure)
  interface Submission {
    id: string;
    songTitle: string;
    description: string;
    audioUrl: string;
    streamUrl?: string | null; // New field for presigned URLs
    originalFileName: string;
    mimetype?: string;
    audioType?: 'r2' | 'local' | 'youtube' | 'soundcloud'; // Updated to include YouTube and SoundCloud
    // YouTube-specific fields
    youtubeVideoId?: string;
    youtubeThumbnail?: string;
    youtubeDuration?: number;
    // SoundCloud-specific fields
    soundcloudTrackId?: number;
    soundcloudArtwork?: string;
    soundcloudDuration?: number;
    soundcloudUsername?: string;
    soundcloudUrl?: string;
  }

  interface Competitor {
    id: string | null;
    username: string;
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
  }  interface StreamData {
    submissionId: string;
    streamUrl: string | null;
    audioType: 'r2' | 'local' | 'youtube' | 'soundcloud';
    expiresAt: string | null;
    // YouTube-specific fields
    videoId?: string;
    thumbnail?: string;
    duration?: number;
    title?: string;
    embedUrl?: string;
    // SoundCloud-specific fields
    trackId?: number;
    artwork?: string;
    username?: string;
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
    status: 'upcoming' | 'ongoing' | 'completed' | 'In Progress';
  }
  
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [streamUrls, setStreamUrls] = useState<StreamUrlsResponse | null>(null); // This state can still be useful for other things like expiry checks

  // Check if current user is the tournament creator
  const isCreator = authUser && tournament && tournament.creator && authUser.id === tournament.creator._id;
  const canSelectWinner = isCreator && (tournament?.status === 'ongoing' || tournament?.status === 'In Progress') && 
                          (matchup?.status === 'active' || matchup?.status === 'upcoming') &&                          !matchup?.winnerParticipantId &&
                          matchup?.player1.id && matchup?.player2.id;

  // Function to refresh streaming URLs
  const refreshStreamUrls = useCallback(async (matchupDataToRefresh?: MatchupData) => {
    const dataToUse = matchupDataToRefresh || matchup; // Use provided data or fallback to state

    if (!tournamentId || !matchupId || !dataToUse) {
      console.warn('refreshStreamUrls called without sufficient data.');
      return;
    }
    
    setIsRefreshingUrls(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchup/${matchupId}/stream-urls`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const streamDataResponse = await response.json() as StreamUrlsResponse;
        setStreamUrls(streamDataResponse); // Update this for potential other uses

        const newMatchup = { ...dataToUse }; // Use the determined data (passed or from state)
        let changed = false;        const p1Stream = streamDataResponse.streamUrls.player1;
        if (p1Stream && newMatchup.player1.submission) {
          newMatchup.player1.submission.streamUrl = p1Stream.embedUrl || p1Stream.streamUrl;
          newMatchup.player1.submission.audioType = p1Stream.audioType;
          if (p1Stream.audioType === 'youtube' && p1Stream.videoId) {
            newMatchup.player1.submission.youtubeVideoId = p1Stream.videoId;
          }
          if (p1Stream.audioType === 'soundcloud') {
            if (p1Stream.trackId) newMatchup.player1.submission.soundcloudTrackId = p1Stream.trackId;
            if (p1Stream.artwork) newMatchup.player1.submission.soundcloudArtwork = p1Stream.artwork;
            if (p1Stream.username) newMatchup.player1.submission.soundcloudUsername = p1Stream.username;
          }
          changed = true;
        }

        const p2Stream = streamDataResponse.streamUrls.player2;
        if (p2Stream && newMatchup.player2.submission) {
          newMatchup.player2.submission.streamUrl = p2Stream.embedUrl || p2Stream.streamUrl;
          newMatchup.player2.submission.audioType = p2Stream.audioType;
          if (p2Stream.audioType === 'youtube' && p2Stream.videoId) {
            newMatchup.player2.submission.youtubeVideoId = p2Stream.videoId;
          }
          if (p2Stream.audioType === 'soundcloud') {
            if (p2Stream.trackId) newMatchup.player2.submission.soundcloudTrackId = p2Stream.trackId;
            if (p2Stream.artwork) newMatchup.player2.submission.soundcloudArtwork = p2Stream.artwork;
            if (p2Stream.username) newMatchup.player2.submission.soundcloudUsername = p2Stream.username;
          }
          changed = true;
        }

        if (changed) {
          setMatchup(newMatchup);
        }
      } else {
        console.warn('Failed to refresh streaming URLs. Status:', response.status);
        const errorData = await response.text();
        console.warn('Error data from stream-urls:', errorData);
      }
    } catch (error) {
      console.error('Error refreshing streaming URLs:', error);    } finally {
      setIsRefreshingUrls(false);
    }
  }, [tournamentId, matchupId, token]); // Removed matchup and setMatchup to prevent infinite loops

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
          refreshStreamUrls(matchup); // Pass the current matchup to refreshStreamUrls
        }
      }
    }
  }, [matchup, streamUrls, refreshStreamUrls]); // Added refreshStreamUrls to dependencies

  // Fetch matchup data
  useEffect(() => {
    const fetchMatchupData = async () => {
      setIsLoading(true);
      setError(null);
        try {
        const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchup/${matchupId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!response.ok) { 
          const errorText = await response.text();
          console.error('Failed to fetch matchup:', response.status, errorText);
          setError(`Failed to fetch matchup: ${response.status}`);
          setIsLoading(false);
          return; // Stop further processing
        }
        
        const data = await response.json();
        // console.log('Matchup data received:', data);
        // setMatchup(data.matchup); // Set initial matchup data - will be set by refreshStreamUrls or if no streams
        
        // Fetch fresh streaming URLs after getting matchup data
        if (data.matchup) {
          // Call refreshStreamUrls with the freshly fetched matchup data.
          // This will also call setMatchup inside it.
          await refreshStreamUrls(data.matchup); 
        } else {
          setMatchup(null); // Handle case where matchup is null from API
        }
      } catch (err) {
        console.error('Error fetching matchup data:', err);
        setError(`Failed to load matchup details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };    const fetchTournamentData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
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
  }, [tournamentId, matchupId, token]); // Removed refreshStreamUrls to prevent infinite loops

  // Handle winner selection
  const handleSelectWinner = async (playerId: string) => {
    if (isSelectingWinner || !matchup || !canSelectWinner || !playerId) return;
    
    if (!token) {
      alert('Authentication required.');
      return;
    }
    
    const playerName = playerId === matchup.player1.id ? matchup.player1.username : matchup.player2.username;
    
    if (!window.confirm(`Are you sure you want to select ${playerName} as the winner? This action cannot be undone.`)) {
      return;
    }
    
    setIsSelectingWinner(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/matchup/${matchupId}/winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ winnerParticipantId: playerId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to select winner');
      }
      
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
  

  
  const handleBack = () => {
    navigate(`/tournaments/${tournamentId}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Simple background layers */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-transparent to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Back button with tournament card styling and winner reaction */}
        <button 
          onClick={handleBack}
          className={`group flex items-center text-white transition-all duration-300 mb-8 
                     rounded-xl px-6 py-3 border border-white/5 hover:border-white/20 
                     hover:transform hover:-translate-y-1 backdrop-blur-sm
                     ${matchup?.status === 'completed' && matchup?.winnerParticipantId ? 'animate-victory-pulse winner-glow' : ''}`}
          style={{ 
            background: 'rgba(15, 15, 20, 0.7)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            ...(matchup?.status === 'completed' && matchup?.winnerParticipantId && {
              background: 'rgba(15, 15, 20, 0.8)',
              boxShadow: '0 10px 30px -5px rgba(250, 204, 21, 0.2), 0 0 0 1px rgba(250, 204, 21, 0.1)'
            })
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
          Back to Tournament
        </button>
        
        {/* Main container with tournament card styling and winner reactions */}
        <div 
          className={`group relative overflow-hidden rounded-xl transition-all duration-500 backdrop-blur-sm
                     ${matchup?.status === 'completed' && matchup?.winnerParticipantId ? 'winner-glow animate-victory-pulse' : ''}`}
          style={{ 
            background: 'rgba(15, 15, 20, 0.7)',
            boxShadow: matchup?.status === 'completed' && matchup?.winnerParticipantId 
              ? '0 10px 30px -5px rgba(250, 204, 21, 0.2), 0 0 0 1px rgba(250, 204, 21, 0.1)'
              : '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.1)'
          }}
        >
          {/* Border with color accent */}
          <div className="absolute inset-0 border border-white/5 rounded-xl"></div>
          
          {/* Accent color bar at top */}
          <div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(to right, rgba(6, 182, 212, 0.8), rgba(217, 70, 239, 0.8), rgba(6, 182, 212, 0.4))',
            }}
          ></div>
          
          <div className="relative p-8">
            {/* Header with tournament card style */}
            <div className="text-center mb-12 relative">
              {/* Epic background glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-fuchsia-400/10 to-cyan-400/10 rounded-full blur-3xl transform scale-150 animate-gradient bg-[length:200%_200%]" />
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3 animate-float">
                <span 
                  className="inline-block w-2 h-12 rounded-full shimmer"
                  style={{ background: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.8), rgba(217, 70, 239, 0.8))' }}
                ></span>
                <span className="gradient-text-animate relative z-10">
                  Round {matchup.round} Matchup
                </span>
                <span 
                  className="inline-block w-2 h-12 rounded-full shimmer"
                  style={{ background: 'linear-gradient(to bottom, rgba(217, 70, 239, 0.8), rgba(6, 182, 212, 0.8))' }}
                ></span>
              </h1>
              <p className="text-gray-300 text-lg opacity-80 scale-in">{matchup.tournamentName}</p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center mb-8">
              {/* First player container with tournament card styling */}
              <div className="md:w-[42%]">
                <div 
                  className="relative overflow-hidden rounded-xl transition-all duration-500 tournament-card-hover backdrop-blur-sm p-6 scale-in"
                  style={{ 
                    background: 'rgba(15, 15, 20, 0.7)',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.1)'
                  }}
                >
                  {/* Border and accent for player 1 */}
                  <div className="absolute inset-0 border border-white/5 rounded-xl"></div>
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ background: 'linear-gradient(to right, rgba(6, 182, 212, 0.8), rgba(6, 182, 212, 0.4))' }}
                  ></div>
                  
                  <TrackPlayer 
                    track={{
                      id: matchup.player1.id || '',
                      title: matchup.player1.submission?.songTitle || matchup.player1.username,
                    artist: matchup.player1.artist,
                    audioUrl: matchup.player1.submission?.audioUrl || '',
                    streamUrl: matchup.player1.submission?.streamUrl,
                    audioType: matchup.player1.submission?.audioType,
                    youtubeVideoId: matchup.player1.submission?.youtubeVideoId,
                    youtubeThumbnail: matchup.player1.submission?.youtubeThumbnail,
                    youtubeDuration: matchup.player1.submission?.youtubeDuration,
                    soundcloudTrackId: matchup.player1.submission?.soundcloudTrackId,
                    soundcloudArtwork: matchup.player1.submission?.soundcloudArtwork,
                    soundcloudDuration: matchup.player1.submission?.soundcloudDuration,
                    soundcloudUsername: matchup.player1.submission?.soundcloudUsername,
                    soundcloudUrl: matchup.player1.submission?.soundcloudUrl
                  }}
                  competitorId={matchup.player1.id || ''}
                  competitorProfileImage={matchup.player1.profilePictureUrl || defaultUserAvatar}
                  isLeft={true}
                  gradientStart="cyan"
                  gradientEnd="blue"
                  onUrlRefreshNeeded={refreshStreamUrls}
                />
                
                {/* Stream info with tournament card styling */}
                {matchup.player1.submission?.audioType === 'r2' && (
                  <div className="mt-3 text-xs text-gray-400 flex items-center justify-center bg-white/5 rounded-lg py-2 px-3 border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                    </svg>
                    Streaming from R2
                    {isRefreshingUrls && <span className="ml-1 animate-spin">⟳</span>}
                  </div>
                )}
                
                {/* Winner selection button with tournament card styling */}
                {canSelectWinner && matchup.player1.id && (
                  <button 
                    onClick={() => handleSelectWinner(matchup.player1.id!)}
                    disabled={isSelectingWinner}
                    className={`mt-4 w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 
                      hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg 
                      text-center transform transition-all duration-300 hover:scale-[1.02] border border-cyan-400/30
                      ${isSelectingWinner ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSelectingWinner ? 'Selecting...' : `Select ${matchup.player1.username} as Winner`}
                  </button>
                )}
                
                {/* Simple winner badge */}
                {matchup.winnerParticipantId === matchup.player1.id && (
                  <div className="mt-3 w-full py-2 px-4 winner-subtle rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">�</span>
                      <span className="text-sm font-medium winner-text-subtle">Winner</span>
                    </div>
                  </div>
                )}
                </div>
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
                      onClick={() => refreshStreamUrls()}
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
              
              {/* Second player container with tournament card styling */}
              <div className="md:w-[42%]">
                <div 
                  className="relative overflow-hidden rounded-xl transition-all duration-500 tournament-card-hover backdrop-blur-sm p-6 scale-in"
                  style={{ 
                    background: 'rgba(15, 15, 20, 0.7)',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(217, 70, 239, 0.1)'
                  }}
                >
                  {/* Border and accent for player 2 */}
                  <div className="absolute inset-0 border border-white/5 rounded-xl"></div>
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ background: 'linear-gradient(to right, rgba(217, 70, 239, 0.8), rgba(217, 70, 239, 0.4))' }}
                  ></div>
                  
                <TrackPlayer 
                  track={{
                    id: matchup.player2.id || '',
                    title: matchup.player2.submission?.songTitle || matchup.player2.username,
                    artist: matchup.player2.artist,
                    audioUrl: matchup.player2.submission?.audioUrl || '',
                    streamUrl: matchup.player2.submission?.streamUrl,
                    audioType: matchup.player2.submission?.audioType,
                    youtubeVideoId: matchup.player2.submission?.youtubeVideoId,
                    youtubeThumbnail: matchup.player2.submission?.youtubeThumbnail,
                    youtubeDuration: matchup.player2.submission?.youtubeDuration,
                    soundcloudTrackId: matchup.player2.submission?.soundcloudTrackId,
                    soundcloudArtwork: matchup.player2.submission?.soundcloudArtwork,
                    soundcloudDuration: matchup.player2.submission?.soundcloudDuration,
                    soundcloudUsername: matchup.player2.submission?.soundcloudUsername,
                    soundcloudUrl: matchup.player2.submission?.soundcloudUrl
                  }}
                  competitorId={matchup.player2.id || ''}
                  competitorProfileImage={matchup.player2.profilePictureUrl || defaultUserAvatar}
                  isLeft={false}
                  gradientStart="fuchsia"
                  gradientEnd="pink"
                  onUrlRefreshNeeded={refreshStreamUrls}
                />
                
                {/* Stream info with tournament card styling */}
                {matchup.player2.submission?.audioType === 'r2' && (
                  <div className="mt-3 text-xs text-gray-400 flex items-center justify-center bg-white/5 rounded-lg py-2 px-3 border border-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                    </svg>
                    Streaming from R2
                    {isRefreshingUrls && <span className="ml-1 animate-spin">⟳</span>}
                  </div>
                )}
                
                {/* Winner selection button with tournament card styling */}
                {canSelectWinner && matchup.player2.id && (
                  <button 
                    onClick={() => handleSelectWinner(matchup.player2.id!)}
                    disabled={isSelectingWinner}
                    className={`mt-4 w-full py-3 px-4 bg-gradient-to-r from-fuchsia-500 to-pink-600 
                      hover:from-fuchsia-600 hover:to-pink-700 text-white font-medium rounded-lg 
                      text-center transform transition-all duration-300 hover:scale-[1.02] border border-fuchsia-400/30
                      ${isSelectingWinner ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSelectingWinner ? 'Selecting...' : `Select ${matchup.player2.username} as Winner`}
                  </button>
                )}
                
                {/* ULTIMATE EPIC Winner badge with massive page-wide effects */}
                {matchup.winnerParticipantId === matchup.player2.id && (
                  <div className="mt-4 w-full relative overflow-visible">
                    {/* ULTIMATE animated background that explodes beyond container */}
                    <div className="absolute -inset-16 bg-gradient-to-r from-yellow-400/50 via-amber-400/70 to-yellow-400/50 animate-gradient bg-[length:400%_400%] rounded-3xl blur-3xl scale-200 animate-epic-bounce"></div>
                    <div className="absolute -inset-12 bg-gradient-to-r from-yellow-300/40 via-amber-300/60 to-yellow-300/40 animate-gradient bg-[length:300%_300%] rounded-2xl blur-2xl scale-175 animate-victory-pulse"></div>
                    <div className="absolute -inset-8 bg-gradient-to-r from-yellow-200/30 via-amber-200/50 to-yellow-200/30 animate-gradient bg-[length:200%_200%] rounded-xl blur-xl scale-150 animate-twinkle"></div>
                    
                    {/* Screen shake and ultimate shimmer effect container */}
                    <div className="relative winner-container screen-shake ultimate-shimmer">
                      {/* Winner halo effect */}
                      <div className="winner-halo"></div>
                      
                      {/* Main ULTIMATE winner badge */}
                      <div className="relative bg-gradient-to-r from-yellow-500/70 to-amber-500/70 
                        border-4 border-yellow-300/90 text-yellow-50 font-black rounded-xl text-center
                        py-8 px-8 backdrop-blur-md shadow-2xl transform transition-all duration-500 hover:scale-110
                        flex items-center justify-center gap-6 winner-glow animate-victory-pulse epic-text-glow">
                        
                        {/* ULTIMATE animated trophy with massive explosion effect */}
                        <div className="relative trophy-explosion-mega">
                          <span className="text-8xl animate-epic-bounce filter drop-shadow-2xl">🏆</span>
                          <div className="absolute -inset-6 bg-yellow-400/60 rounded-full blur-2xl animate-ping"></div>
                          <div className="absolute -inset-4 bg-yellow-300/50 rounded-full blur-xl animate-pulse"></div>
                          <div className="absolute -inset-8 bg-amber-400/40 rounded-full blur-3xl animate-ping delay-150"></div>
                          <div className="absolute -inset-10 bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-300"></div>
                          
                          {/* Rotating sparkle trail */}
                          <div className="sparkle-trail" style={{ top: '-20px', left: '50%' }}></div>
                          <div className="sparkle-trail" style={{ top: '50%', right: '-20px', animationDelay: '1s' }}></div>
                          <div className="sparkle-trail" style={{ bottom: '-20px', left: '50%', animationDelay: '2s' }}></div>
                          <div className="sparkle-trail" style={{ top: '50%', left: '-20px', animationDelay: '0.5s' }}></div>
                        </div>
                        
                        {/* ULTIMATE winner text with massive effects */}
                        <div className="flex flex-col items-center relative">
                          <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-100 via-yellow-50 to-yellow-100 animate-gradient bg-[length:400%_400%] filter drop-shadow-lg">
                            🎉 ULTIMATE CHAMPION 🎉
                          </span>
                          <div className="w-32 h-2 bg-gradient-to-r from-transparent via-yellow-200 to-transparent mt-3 animate-pulse rounded-full"></div>
                          <span className="text-lg font-bold text-yellow-200 mt-2 animate-twinkle epic-text-glow">🌟 VICTORIOUS LEGEND 🌟</span>
                        </div>
                        
                        {/* ULTIMATE sparkle explosion effects covering huge area */}
                        <div className="absolute -top-8 -right-8 text-6xl text-yellow-300 animate-celebration">🎊</div>
                        <div className="absolute -top-12 -left-8 text-5xl text-amber-300 animate-twinkle delay-100">⭐</div>
                        <div className="absolute -bottom-8 -right-12 text-5xl text-yellow-400 animate-epic-bounce delay-200">✨</div>
                        <div className="absolute -bottom-12 -left-8 text-4xl text-amber-400 animate-celebration delay-300">🌟</div>
                        <div className="absolute top-1/2 -right-16 text-4xl text-yellow-300 animate-twinkle delay-400">💫</div>
                        <div className="absolute top-1/2 -left-16 text-4xl text-amber-300 animate-epic-bounce delay-500">🎆</div>
                        <div className="absolute -top-16 left-1/4 text-3xl text-yellow-400 animate-celebration delay-600">🎉</div>
                        <div className="absolute -bottom-16 right-1/4 text-3xl text-amber-400 animate-twinkle delay-700">⚡</div>
                        
                        {/* Epic firework explosions */}
                        <div className="firework-explosion" style={{ top: '-30px', left: '20%', animationDelay: '0.5s' }}></div>
                        <div className="firework-explosion" style={{ top: '20%', right: '-30px', animationDelay: '1s' }}></div>
                        <div className="firework-explosion" style={{ bottom: '-30px', right: '20%', animationDelay: '1.5s' }}></div>
                        <div className="firework-explosion" style={{ bottom: '20%', left: '-30px', animationDelay: '2s' }}></div>
                      </div>
                      
                      {/* ULTIMATE expanding victory rings */}
                      <div className="absolute inset-0 border-4 border-yellow-400/70 rounded-xl animate-ping"></div>
                      <div className="absolute -inset-4 border-2 border-yellow-300/50 rounded-xl animate-ping delay-150"></div>
                      <div className="absolute -inset-8 border border-amber-300/30 rounded-2xl animate-ping delay-300"></div>
                      <div className="absolute -inset-12 border border-yellow-200/20 rounded-3xl animate-ping delay-450"></div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
              
            {/* Matchup Status with tournament card styling */}
            <div className="mt-8 space-y-4">
              {matchup.status === 'completed' && matchup.winnerParticipantId && (
                <div className="relative page-victory-container">
                  {/* ULTIMATE MEGA page-wide victory effects */}
                  <div className="fixed inset-0 pointer-events-none z-50">
                    {/* Screen-wide golden confetti rain with epic density */}
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/25 via-transparent to-amber-400/25 animate-gradient bg-[length:400%_400%]"></div>
                    
                    {/* MEGA floating victory elements across entire screen */}
                    <div className="absolute top-10 left-10 text-8xl animate-celebration delay-100 float-up">🎊</div>
                    <div className="absolute top-20 right-20 text-7xl animate-epic-bounce delay-200 float-up">🏆</div>
                    <div className="absolute top-32 left-1/4 text-6xl animate-twinkle delay-300 float-up">⭐</div>
                    <div className="absolute top-40 right-1/3 text-5xl animate-celebration delay-400 float-up">✨</div>
                    <div className="absolute bottom-32 left-16 text-7xl animate-epic-bounce delay-500 float-up">🎆</div>
                    <div className="absolute bottom-20 right-12 text-6xl animate-twinkle delay-600 float-up">🌟</div>
                    <div className="absolute top-1/2 left-8 text-5xl animate-celebration delay-700 float-up">💫</div>
                    <div className="absolute top-1/3 right-8 text-6xl animate-epic-bounce delay-800 float-up">🎉</div>
                    <div className="absolute top-16 left-1/2 text-5xl animate-twinkle delay-900 float-up">🌠</div>
                    <div className="absolute bottom-40 right-1/4 text-4xl animate-celebration delay-1000 float-up">⚡</div>
                    <div className="absolute top-3/4 left-1/3 text-6xl animate-epic-bounce delay-1100 float-up">💥</div>
                    <div className="absolute bottom-16 left-1/2 text-5xl animate-twinkle delay-1200 float-up">🎇</div>
                  </div>
                  
                  {/* ULTIMATE Epic background effects with massive scale */}
                  <div className="absolute -inset-32 bg-gradient-to-r from-yellow-400/40 via-amber-400/60 to-yellow-400/40 animate-gradient bg-[length:500%_500%] rounded-full blur-3xl scale-200 animate-epic-bounce ultimate-shimmer"></div>
                  <div className="absolute -inset-24 bg-gradient-to-r from-yellow-300/30 via-amber-300/50 to-yellow-300/30 animate-gradient bg-[length:400%_400%] rounded-3xl blur-2xl scale-175 animate-victory-pulse"></div>
                  <div className="absolute -inset-16 bg-gradient-to-r from-yellow-200/25 via-amber-200/40 to-yellow-200/25 animate-gradient bg-[length:300%_300%] rounded-2xl blur-xl scale-150 animate-twinkle"></div>
                  
                  <div 
                    className="relative overflow-visible rounded-3xl backdrop-blur-md p-16 text-center border-6 border-yellow-300/80 shadow-2xl transform transition-all duration-1000 hover:scale-[1.08] winner-glow screen-shake ultimate-shimmer epic-text-glow"
                    style={{ 
                      background: 'rgba(15, 15, 20, 0.95)',
                      boxShadow: '0 40px 120px -20px rgba(250, 204, 21, 0.7), 0 0 0 4px rgba(250, 204, 21, 0.4), inset 0 0 80px rgba(250, 204, 21, 0.15)'
                    }}
                  >
                    {/* ULTIMATE animated accent bars with massive effects */}
                    <div 
                      className="absolute top-0 left-0 right-0 h-4 rounded-t-3xl animate-gradient bg-[length:400%_400%] epic-text-glow"
                      style={{ background: 'linear-gradient(90deg, rgba(250, 204, 21, 1), rgba(245, 158, 11, 0.8), rgba(250, 204, 21, 1), rgba(245, 158, 11, 0.8), rgba(250, 204, 21, 1))' }}
                    ></div>
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-4 rounded-b-3xl animate-gradient bg-[length:400%_400%] animation-delay-150 epic-text-glow"
                      style={{ background: 'linear-gradient(90deg, rgba(245, 158, 11, 1), rgba(250, 204, 21, 0.8), rgba(245, 158, 11, 1), rgba(250, 204, 21, 0.8), rgba(245, 158, 11, 1))' }}
                    ></div>
                    
                    {/* ULTIMATE epic header with MEGA animations */}
                    <div className="relative mb-12 ultimate-victory-header">
                      {/* ULTIMATE background glow with massive multiple layers */}
                      <div className="absolute -inset-16 bg-gradient-to-r from-yellow-400/30 to-amber-400/30 rounded-full blur-3xl transform scale-300 animate-pulse"></div>
                      <div className="absolute -inset-12 bg-gradient-to-r from-yellow-300/25 to-amber-300/25 rounded-full blur-2xl transform scale-250 animate-epic-bounce delay-100"></div>
                      <div className="absolute -inset-8 bg-gradient-to-r from-yellow-200/20 to-amber-200/20 rounded-full blur-xl transform scale-200 animate-twinkle delay-200"></div>
                      <div className="absolute -inset-4 bg-gradient-to-r from-yellow-100/15 to-amber-100/15 rounded-full blur transform scale-150 animate-celebration delay-300"></div>
                      
                      <h3 className="relative text-9xl font-black mb-8 flex items-center justify-center gap-8 transform animate-victory-pulse epic-text-glow">
                        {/* ULTIMATE animated trophies with MEGA glow */}
                        <div className="relative trophy-explosion-mega">
                          <span className="text-10xl animate-epic-bounce filter drop-shadow-2xl">🏆</span>
                          <div className="absolute -inset-8 bg-yellow-400/60 rounded-full blur-2xl animate-ping"></div>
                          <div className="absolute -inset-6 bg-yellow-300/50 rounded-full blur-xl animate-pulse"></div>
                          <div className="absolute -inset-10 bg-amber-400/40 rounded-full blur-3xl animate-ping delay-150"></div>
                          <div className="absolute -inset-12 bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-300"></div>
                          
                          {/* MEGA sparkle trails */}
                          <div className="sparkle-trail" style={{ top: '-40px', left: '50%', width: '15px', height: '15px' }}></div>
                          <div className="sparkle-trail" style={{ top: '50%', right: '-40px', animationDelay: '1s', width: '15px', height: '15px' }}></div>
                          <div className="sparkle-trail" style={{ bottom: '-40px', left: '50%', animationDelay: '2s', width: '15px', height: '15px' }}></div>
                          <div className="sparkle-trail" style={{ top: '50%', left: '-40px', animationDelay: '0.5s', width: '15px', height: '15px' }}></div>
                        </div>
                        
                        {/* ULTIMATE epic text with MEGA gradient animation */}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-100 via-yellow-50 to-amber-100 animate-gradient bg-[length:500%_500%] filter drop-shadow-2xl transform animate-celebration epic-text-glow">
                          ⚡ LEGENDARY ULTIMATE VICTORY! ⚡
                        </span>
                        
                        {/* ULTIMATE animated trophies with MEGA glow */}
                        <div className="relative trophy-explosion-mega">
                          <span className="text-10xl animate-epic-bounce delay-75 filter drop-shadow-2xl">🏆</span>
                          <div className="absolute -inset-8 bg-yellow-400/60 rounded-full blur-2xl animate-ping delay-75"></div>
                          <div className="absolute -inset-6 bg-yellow-300/50 rounded-full blur-xl animate-pulse delay-75"></div>
                          <div className="absolute -inset-10 bg-amber-400/40 rounded-full blur-3xl animate-ping delay-225"></div>
                          <div className="absolute -inset-12 bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-375"></div>
                          
                          {/* MEGA sparkle trails */}
                          <div className="sparkle-trail" style={{ top: '-40px', left: '50%', animationDelay: '0.3s', width: '15px', height: '15px' }}></div>
                          <div className="sparkle-trail" style={{ top: '50%', right: '-40px', animationDelay: '1.3s', width: '15px', height: '15px' }}></div>
                          <div className="sparkle-trail" style={{ bottom: '-40px', left: '50%', animationDelay: '2.3s', width: '15px', height: '15px' }}></div>
                          <div className="sparkle-trail" style={{ top: '50%', left: '-40px', animationDelay: '0.8s', width: '15px', height: '15px' }}></div>
                        </div>
                      </h3>
                      
                      {/* ULTIMATE sparkle explosion effects covering massive area */}
                      <div className="absolute -top-16 -left-16 text-8xl text-yellow-300 animate-celebration float-up">🎊</div>
                      <div className="absolute -top-20 -right-16 text-7xl text-amber-300 animate-twinkle delay-100 float-up">⭐</div>
                      <div className="absolute -bottom-16 -left-20 text-7xl text-yellow-400 animate-epic-bounce delay-200 float-up">✨</div>
                      <div className="absolute -bottom-20 -right-16 text-6xl text-amber-400 animate-celebration delay-300 float-up">🌟</div>
                      <div className="absolute top-1/2 -left-24 text-6xl text-yellow-300 animate-twinkle delay-400 float-up">💫</div>
                      <div className="absolute top-1/2 -right-24 text-6xl text-amber-300 animate-epic-bounce delay-500 float-up">🎆</div>
                      <div className="absolute -top-24 left-1/4 text-5xl text-yellow-400 animate-celebration delay-600 float-up">🎉</div>
                      <div className="absolute -bottom-24 right-1/4 text-5xl text-amber-400 animate-twinkle delay-700 float-up">⚡</div>
                      <div className="absolute -top-12 left-1/2 text-6xl text-yellow-300 animate-epic-bounce delay-800 float-up">🌠</div>
                      <div className="absolute -bottom-12 left-1/2 text-6xl text-amber-300 animate-celebration delay-900 float-up">💥</div>
                    </div>
                    
                    {/* EPIC Champion announcement */}
                    <div className="relative champion-announcement">
                      <p className="text-3xl text-gray-200 mb-4 font-bold animate-pulse">🎖️ THE ULTIMATE CHAMPION IS: 🎖️</p>
                      <div className="relative inline-block mega-champion-name">
                        {/* MASSIVE background glow for winner name */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/40 to-amber-400/40 rounded-2xl blur-2xl animate-pulse scale-125"></div>
                        <div className="absolute -inset-2 bg-gradient-to-r from-yellow-300/30 to-amber-300/30 rounded-xl blur-xl animate-epic-bounce"></div>
                        
                        <span className="relative text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-100 via-yellow-50 to-amber-100 px-8 py-4 animate-gradient bg-[length:400%_400%] filter drop-shadow-2xl">
                          🎆 {matchup.winnerParticipantId === matchup.player1.id ? matchup.player1.username : matchup.player2.username} 🎆
                        </span>
                        
                        {/* Expanding champion rings */}
                        <div className="absolute inset-0 border-4 border-yellow-400/70 rounded-2xl animate-ping"></div>
                        <div className="absolute -inset-2 border-2 border-yellow-300/50 rounded-2xl animate-ping delay-150"></div>
                        <div className="absolute -inset-4 border border-amber-300/30 rounded-3xl animate-ping delay-300"></div>
                      </div>
                      
                      {/* ULTIMATE victory line with MASSIVE effects */}
                      <div className="flex items-center justify-center mt-8 victory-line-mega">
                        <div className="flex-1 h-2 bg-gradient-to-r from-transparent via-yellow-400 to-yellow-400 animate-pulse rounded-full"></div>
                        <span className="px-8 text-2xl text-yellow-200 font-black bg-gradient-to-r from-yellow-400/20 to-amber-400/20 rounded-full py-2 animate-twinkle border-2 border-yellow-300/50">
                          ⚡ LEGENDARY VICTORY ACHIEVED ⚡
                        </span>
                        <div className="flex-1 h-2 bg-gradient-to-l from-transparent via-yellow-400 to-yellow-400 animate-pulse rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isCreator && (
                <div 
                  className="relative overflow-hidden rounded-xl backdrop-blur-sm p-6 text-center"
                  style={{ 
                    background: 'rgba(15, 15, 20, 0.7)',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <div className="absolute inset-0 border border-blue-400/20 rounded-xl"></div>
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ background: 'linear-gradient(to right, rgba(59, 130, 246, 0.8), rgba(6, 182, 212, 0.4))' }}
                  ></div>
                  <h3 className="text-xl font-bold text-blue-300 mb-3 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" y1="19" x2="12" y2="23"/>
                      <line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                    Tournament Creator Controls
                  </h3>
                  {canSelectWinner ? (
                    <p className="text-gray-300">
                      As the tournament creator, you can select the winner of this matchup using the colored buttons above.
                    </p>
                  ) : matchup.winnerParticipantId ? (
                    <p className="text-gray-300">
                      Winner has been selected. The bracket will be updated automatically.
                    </p>
                  ) : (
                    <p className="text-gray-300">
                      This matchup is not ready for winner selection yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupDetailsPage;


