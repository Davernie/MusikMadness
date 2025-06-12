import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/profile/AnimatedBackground';
import TrackPlayer from '../components/tournament/TrackPlayer';
import { API_BASE_URL } from '../utils/apiConfig';
import { useAuth } from '../context/AuthContext';
import defaultUserAvatar from '../assets/images/default-avatar.png';
import './MatchupDetailsPage.css';

// Type definitions
interface Submission {
  songTitle: string;
  audioUrl?: string;
  streamUrl?: string;
  audioType?: string;
  youtubeVideoId?: string;
  youtubeThumbnail?: string;
  youtubeDuration?: number;
}

interface Competitor {
  id: string;
  name: string;
  artist: string;
  submission?: Submission;
}

interface MatchupData {
  round: number;
  tournamentName: string;
  player1: Competitor;
  player2: Competitor;
  status: string;
  winnerParticipantId?: string;
}

interface TournamentData {
  creator: { _id: string };
  status: string;
}

interface StreamData {
  audioType: string;
  streamUrl: string;
  embedUrl?: string;
  videoId?: string;
  thumbnail?: string;
  duration?: number;
  expiresAt?: string;
}

interface StreamUrlsResponse {
  streamUrls: {
    player1: StreamData;
    player2: StreamData;
  };
}

const MatchupDetailsPage: React.FC = () => {
  const { tournamentId, matchupId } = useParams<{ tournamentId: string; matchupId: string }>();
  const navigate = useNavigate();
  const { user: authUser, token } = useAuth();
  
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [tournament, setTournament] = useState<TournamentData | null>(null);  // Function to refresh streaming URLs
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
        setStreamUrls(streamDataResponse);

        // Update matchup state with fresh streaming URLs
        const newMatchup = { ...dataToUse };

        const p1Stream = streamDataResponse.streamUrls.player1;
        const p2Stream = streamDataResponse.streamUrls.player2;

        if (p1Stream && newMatchup.player1.submission) {
          const sub1 = newMatchup.player1.submission;
          sub1.audioType = p1Stream.audioType;
          if (p1Stream.audioType === 'youtube') {
            sub1.streamUrl = p1Stream.embedUrl || p1Stream.streamUrl;
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
            sub2.streamUrl = p2Stream.embedUrl || p2Stream.streamUrl;
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
      }
    } catch (error) {
      console.error('Error refreshing streaming URLs:', error);
    } finally {
      setIsRefreshingUrls(false);
    }
  }, [tournamentId, matchupId, token]);

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
          refreshStreamUrls();
        }
      }
    }
  }, [matchup, streamUrls, refreshStreamUrls]);

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
          return;
        }
        
        const data = await response.json();
        console.log('Matchup data received:', data);
        setMatchup(data.matchup);
        
        if (data.tournament) {
          setTournament(data.tournament);
        }
        
        // Fetch fresh streaming URLs after getting matchup data
        if (data.matchup) {
          refreshStreamUrls(data.matchup);
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
  }, [tournamentId, matchupId, token]);  // Handle winner selection
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
      
      alert(`${playerName} has been selected as the winner!`);
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
    <div className="matchup-details-page">
      <AnimatedBackground />
      
      <div className="page-container">
        {/* Header */}
        <div className="header-section">
          <button className="back-button" onClick={handleBack}>
            <svg xmlns="http://www.w3.org/2000/svg" className="back-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Tournament
          </button>
          
          <div className="matchup-header">
            <h1 className="round-title">Round {matchup.round}</h1>
            <h2 className="tournament-name">{matchup.tournamentName}</h2>
          </div>
        </div>

        {/* Refresh Media Button */}
        <div className="refresh-section">
          <button 
            onClick={() => refreshStreamUrls()}
            disabled={isRefreshingUrls}
            className="refresh-button"
          >
            {isRefreshingUrls ? (
              <>
                <div className="spinner"></div>
                Refreshing Media...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M3 21v-5h5"/>
                </svg>
                Refresh Media
              </>
            )}
          </button>
        </div>

        {/* Main matchup area */}
        <div className="matchup-container">
          {/* Player 1 */}
          <div className="player-section player-left">
            <div className="player-card">
              <div className="player-info">
                <img 
                  src={defaultUserAvatar} 
                  alt={matchup.player1.username}
                  className="player-avatar"
                />
                <div className="player-details">
                  <h3 className="player-name">{matchup.player1.username}</h3>
                  <p className="player-artist">{matchup.player1.artist}</p>
                </div>
              </div>
              
              <div className="track-section">
                <TrackPlayer 
                  track={{
                    id: matchup.player1.id || '',
                    title: matchup.player1.submission?.songTitle || matchup.player1.username,
                    artist: matchup.player1.artist,
                    audioUrl: matchup.player1.submission?.audioUrl || '',
                    streamUrl: matchup.player1.submission?.streamUrl,
                    audioType: matchup.player1.submission?.audioType as "youtube" | "r2" | "local" | undefined,
                    youtubeVideoId: matchup.player1.submission?.youtubeVideoId,
                    youtubeThumbnail: matchup.player1.submission?.youtubeThumbnail,
                    youtubeDuration: matchup.player1.submission?.youtubeDuration
                  }}
                  competitorId={matchup.player1.id || ''}
                  isLeft={true}
                  gradientStart="from-cyan-500"
                  gradientEnd="to-blue-500"
                />
              </div>
              
              {canSelectWinner && (
                <button 
                  onClick={() => handleSelectWinner(matchup.player1.id)}
                  className="winner-button left-button"
                  disabled={isSelectingWinner}
                >
                  {isSelectingWinner ? 'Selecting...' : 'Select Winner'}
                </button>
              )}
            </div>
          </div>

          {/* VS Divider */}
          <div className="vs-divider">
            <div className="vs-text">VS</div>
          </div>

          {/* Player 2 */}
          <div className="player-section player-right">
            <div className="player-card">
              <div className="player-info">
                <img 
                  src={defaultUserAvatar} 
                  alt={matchup.player2.username}
                  className="player-avatar"
                />
                <div className="player-details">
                  <h3 className="player-name">{matchup.player2.username}</h3>
                  <p className="player-artist">{matchup.player2.artist}</p>
                </div>
              </div>
              
              <div className="track-section">
                <TrackPlayer 
                  track={{
                    id: matchup.player2.id || '',
                    title: matchup.player2.submission?.songTitle || matchup.player2.username,
                    artist: matchup.player2.artist,
                    audioUrl: matchup.player2.submission?.audioUrl || '',
                    streamUrl: matchup.player2.submission?.streamUrl,
                    audioType: matchup.player2.submission?.audioType as "youtube" | "r2" | "local" | undefined,
                    youtubeVideoId: matchup.player2.submission?.youtubeVideoId,
                    youtubeThumbnail: matchup.player2.submission?.youtubeThumbnail,
                    youtubeDuration: matchup.player2.submission?.youtubeDuration
                  }}
                  competitorId={matchup.player2.id || ''}
                  isLeft={false}
                  gradientStart="from-fuchsia-500"
                  gradientEnd="to-purple-500"
                />
              </div>
              
              {canSelectWinner && (
                <button 
                  onClick={() => handleSelectWinner(matchup.player2.id)}
                  className="winner-button right-button"
                  disabled={isSelectingWinner}
                >
                  {isSelectingWinner ? 'Selecting...' : 'Select Winner'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupDetailsPage;


