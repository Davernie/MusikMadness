import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import TrackPlayer from '../components/tournament/TrackPlayer'; 
import AnimatedBackground from '../components/AnimatedBackground'; // Assuming AnimatedBackground is here
import { API_BASE_URL } from '../config/apiConfig'; // Assuming apiConfig is here

// Placeholder for default avatar - replace with your actual path or import
const defaultUserAvatar = "./default-avatar.png"; 

// Component to display a matchup between two tracks with voting
const MatchupDetailsPage: React.FC = () => {
  const { tournamentId, matchupId } = useParams<{ tournamentId: string; matchupId: string }>();
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [streamUrls, setStreamUrls] = useState<StreamUrlsResponse | null>(null);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [isRefreshingUrls, setIsRefreshingUrls] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Check if current user is the tournament creator
  const isCreator = authUser && tournament && tournament.creator && authUser.id === tournament.creator._id;
  const canSelectWinner = isCreator && tournament?.status === 'ongoing' && 
                          (matchup?.status === 'active' || matchup?.status === 'upcoming') &&
                          !matchup?.winnerParticipantId &&
                          matchup?.player1.id && matchup?.player2.id;

  // Function to refresh streaming URLs
  const refreshStreamUrls = useCallback(async (matchupDataToRefresh?: MatchupData) => {
    const dataToUse = matchupDataToRefresh || matchup;
    if (!tournamentId || !matchupId || !dataToUse) return;

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
        setStreamUrls(streamDataResponse); // Keep this for R2 expiry logic

        // Update matchup state with fresh streaming URLs
        const newMatchup = { ...dataToUse }; // Create a new object to ensure re-render

        const p1Stream = streamDataResponse.streamUrls.player1;
        const p2Stream = streamDataResponse.streamUrls.player2;

        if (p1Stream && newMatchup.player1.submission) {
          const sub1 = newMatchup.player1.submission;
          sub1.audioType = p1Stream.audioType;
          if (p1Stream.audioType === 'youtube') {
            sub1.streamUrl = p1Stream.embedUrl || p1Stream.streamUrl; // Prioritize embedUrl
            sub1.youtubeVideoId = p1Stream.videoId || sub1.youtubeVideoId;
            sub1.youtubeThumbnail = p1Stream.thumbnail || sub1.youtubeThumbnail;
            sub1.youtubeDuration = p1Stream.duration || sub1.youtubeDuration;
          } else {
            sub1.streamUrl = p1Stream.streamUrl;
          }
        }

        if (p2Stream && newMatchup.player2.submission) {
          const sub2 = newMatchup.player2.submission;
          sub2.audioType = p2Stream.audioType;
          if (p2Stream.audioType === 'youtube') {
            sub2.streamUrl = p2Stream.embedUrl || p2Stream.streamUrl; // Prioritize embedUrl
            sub2.youtubeVideoId = p2Stream.videoId || sub2.youtubeVideoId;
            sub2.youtubeThumbnail = p2Stream.thumbnail || sub2.youtubeThumbnail;
            sub2.youtubeDuration = p2Stream.duration || sub2.youtubeDuration;
          } else {
            sub2.streamUrl = p2Stream.streamUrl;
          }
        }
        setMatchup(newMatchup);
      } else {
        console.warn('Failed to refresh streaming URLs. Status:', response.status);
        // Optionally set an error state here for the user
      }
    } catch (error) {
      console.error('Error refreshing streaming URLs:', error);
      // Optionally set an error state here for the user
    } finally {
      setIsRefreshingUrls(false);
    }
  }, [tournamentId, matchupId, token, matchup, setMatchup, setStreamUrls]);

  // Auto-refresh URLs for R2 files that might expire
  useEffect(() => {
    if (matchup && streamUrls) {
      const hasR2Files = [streamUrls.streamUrls.player1, streamUrls.streamUrls.player2]
        .some(stream => stream && stream.audioType === 'r2' && stream.expiresAt);
      
      if (hasR2Files) {
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        const needsRefresh = [streamUrls.streamUrls.player1, streamUrls.streamUrls.player2]
          .some(stream => {
            if (!stream || stream.audioType !== 'r2' || !stream.expiresAt) return false;
            const expiryDate = new Date(stream.expiresAt);
            return expiryDate <= fiveMinutesFromNow;
          });
        
        if (needsRefresh) {
          console.log('R2 stream URL expiring soon, refreshing...');
          refreshStreamUrls(); // Call without arguments, uses current `matchup` state
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
        console.log('Matchup data received:', data);
        setMatchup(data.matchup);
        // Set tournament data if it's part of the same response, or rely on fetchTournamentData
        if (data.tournament) {
            setTournament(data.tournament);
        }
        
        // Fetch fresh streaming URLs after getting matchup data
        if (data.matchup) {
          refreshStreamUrls(data.matchup); // Pass the freshly fetched matchup data
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
      fetchTournamentData(); // Continues to fetch tournament data separately
    }
  }, [tournamentId, matchupId, token, refreshStreamUrls]); // Added refreshStreamUrls to dependencies
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
            {/* Header without animations */}
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-fuchsia-400/10 rounded-full blur-3xl transform scale-150" />
              <h1 className="text-xl md:text-5xl font-bold text-white relative z-10 tracking-wider" style={{ fontFamily: 'crashbow, sans-serif' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400">
                  Round {matchup.round} Matchup
                </span>
              </h1>
              <p className="text-gray-300 mt-3 text-lg opacity-80">{matchup.tournamentName}</p>
            </div>

          <div className="flex flex-col md:flex-row items-center justify-center mb-8">
            {/* First player */}
            <div className="md:w-[42%]">              <TrackPlayer 
                track={{
                  id: matchup.player1.id || '',
                  title: matchup.player1.submission?.songTitle || matchup.player1.username,
                  artist: matchup.player1.artist,
                  audioUrl: matchup.player1.submission?.audioUrl || '',
                  streamUrl: matchup.player1.submission?.streamUrl,
                  audioType: matchup.player1.submission?.audioType,
                  youtubeVideoId: matchup.player1.submission?.youtubeVideoId,
                  youtubeThumbnail: matchup.player1.submission?.youtubeThumbnail,
                  youtubeDuration: matchup.player1.submission?.youtubeDuration
                }}
                competitorId={matchup.player1.id || ''}
              />
            </div>
            {/* VS Separator */}
            <div className="flex items-center justify-center md:justify-start md:mx-4 mb-4 md:mb-0">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
              <span className="text-cyan-500 font-bold mx-4">VS</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            </div>
            {/* Second player */}
            <div className="md:w-[42%]">              <TrackPlayer 
                track={{
                  id: matchup.player2.id || '',
                  title: matchup.player2.submission?.songTitle || matchup.player2.username,
                  artist: matchup.player2.artist,
                  audioUrl: matchup.player2.submission?.audioUrl || '',
                  streamUrl: matchup.player2.submission?.streamUrl,
                  audioType: matchup.player2.submission?.audioType,
                  youtubeVideoId: matchup.player2.submission?.youtubeVideoId,
                  youtubeThumbnail: matchup.player2.submission?.youtubeThumbnail,
                  youtubeDuration: matchup.player2.submission?.youtubeDuration
                }}
                competitorId={matchup.player2.id || ''}
              />
            </div>
          </div>

          {/* Debug info - to be removed or hidden in production */}
          {showDebug && matchup && (
            <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Debug Info</h3>
              <pre className="text-xs text-gray-200 whitespace-pre-wrap">
                {JSON.stringify(matchup, null, 2)}
              </pre>
            </div>
          )}

          {/* Winner selection - only visible to creator if matchup is active and has no winner */}
          {canSelectWinner && (
            <div className="mt-8">
              <p className="text-center text-gray-300 mb-4">Select the winner of this matchup:</p>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => handleSelectWinner(matchup.player1.id)}
                  className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition 
                              flex items-center justify-center gap-2"
                >
                  {isSelectingWinner && <span className="animate-spin">⏳</span>}
                  <span>Select {matchup.player1.username} as Winner</span>
                </button>
                <button 
                  onClick={() => handleSelectWinner(matchup.player2.id)}
                  className="flex-1 px-4 py-2 bg-fuchsia-500 text-white rounded-lg hover:bg-fuchsia-600 transition 
                              flex items-center justify-center gap-2"
                >
                  {isSelectingWinner && <span className="animate-spin">⏳</span>}
                  <span>Select {matchup.player2.username} as Winner</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchupDetailsPage;


