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
    
    const playerName = playerId === matchup.player1.id 
      ? (matchup.player1.username || matchup.player1.artist || 'Player 1')
      : (matchup.player2.username || matchup.player2.artist || 'Player 2');
    
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button with tournament card styling */}
        <button 
          onClick={handleBack}
          className="group flex items-center text-white transition-all duration-500 mb-8 
                     rounded-xl px-6 py-3 border border-white/5 hover:border-white/20 
                     hover:transform hover:-translate-y-1 backdrop-blur-sm"
          style={{ 
            background: 'rgba(15, 15, 20, 0.7)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 transition-transform group-hover:-translate-x-1"><path d="m15 18-6-6 6-6"/></svg>
          Back to Tournament
        </button>
        
        {/* Main container with tournament card styling */}
        <div 
          className="group relative overflow-hidden rounded-xl transition-all duration-500 backdrop-blur-sm"
          style={{ 
            background: 'rgba(15, 15, 20, 0.7)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.1)'
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
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
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
                      title: matchup.player1.submission?.songTitle || matchup.player1.username || matchup.player1.artist || 'Player 1',
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
                    {isSelectingWinner ? 'Selecting...' : `Select ${matchup.player1.username || matchup.player1.artist || 'Player 1'} as Winner`}
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
                    title: matchup.player2.submission?.songTitle || matchup.player2.username || matchup.player2.artist || 'Player 2',
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
                    {isSelectingWinner ? 'Selecting...' : `Select ${matchup.player2.username || matchup.player2.artist || 'Player 2'} as Winner`}
                  </button>
                )}
                
                {/* Simple winner badge */}
                {matchup.winnerParticipantId === matchup.player2.id && (
                  <div className="mt-3 w-full py-2 px-4 winner-subtle rounded-lg text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm">�</span>
                      <span className="text-sm font-medium winner-text-subtle">Winner</span>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
              
            {/* Matchup Status with tournament card styling */}
            <div className="mt-8 space-y-4">
              {matchup.status === 'completed' && matchup.winnerParticipantId && (
                <div 
                  className="relative overflow-hidden rounded-xl backdrop-blur-sm p-6 mb-4"
                  style={{ 
                    background: 'rgba(15, 15, 20, 0.7)',
                    boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(250, 204, 21, 0.2)'
                  }}
                >
                  <div className="absolute inset-0 border border-white/5 rounded-xl"></div>
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                    style={{ background: 'linear-gradient(to right, rgba(250, 204, 21, 0.8), rgba(250, 204, 21, 0.4))' }}
                  ></div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-200 mb-3 flex items-center justify-center gap-2">
                      <span className="text-base">🏆</span>
                      Matchup Complete
                    </h3>
                    <p className="text-gray-300 mb-2">
                      Winner: 
                      <span className="ml-2 text-yellow-400 font-medium">
                        {matchup.winnerParticipantId === matchup.player1.id 
                          ? (matchup.player1.username || matchup.player1.artist || 'Player 1')
                          : (matchup.player2.username || matchup.player2.artist || 'Player 2')
                        }
                      </span>
                    </p>
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


