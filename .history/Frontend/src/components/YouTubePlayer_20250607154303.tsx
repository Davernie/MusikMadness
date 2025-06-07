import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, ExternalLink, Youtube } from 'lucide-react';
import { formatDuration } from '../utils/youtube';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  className?: string;
  autoplay?: boolean;
  showControls?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Singleton YouTube API manager for better scalability
class YouTubeAPIManager {
  private static instance: YouTubeAPIManager;
  private isLoaded = false;
  private isLoading = false;
  private callbacks: (() => void)[] = [];
  private playerInstances = new Set<string>();

  static getInstance(): YouTubeAPIManager {
    if (!YouTubeAPIManager.instance) {
      YouTubeAPIManager.instance = new YouTubeAPIManager();
    }
    return YouTubeAPIManager.instance;
  }

  async loadAPI(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }

    if (this.isLoading) {
      return new Promise((resolve) => {
        this.callbacks.push(resolve);
      });
    }

    if (typeof window.YT !== 'undefined') {
      this.isLoaded = true;
      return Promise.resolve();
    }

    this.isLoading = true;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      
      const timeout = setTimeout(() => {
        reject(new Error('YouTube API load timeout'));
      }, 10000);

      window.onYouTubeIframeAPIReady = () => {
        clearTimeout(timeout);
        this.isLoaded = true;
        this.isLoading = false;
        
        // Resolve all pending callbacks
        this.callbacks.forEach(callback => callback());
        this.callbacks = [];
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeout);
        this.isLoading = false;
        reject(new Error('Failed to load YouTube API'));
      };

      document.head.appendChild(script);
    });
  }

  registerPlayer(playerId: string): void {
    this.playerInstances.add(playerId);
  }

  unregisterPlayer(playerId: string): void {
    this.playerInstances.delete(playerId);
  }

  getActivePlayerCount(): number {
    return this.playerInstances.size;
  }
}

// Generate unique player IDs with better collision resistance
const generatePlayerId = (videoId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `yt-player-${videoId.slice(0, 8)}-${timestamp}-${random}`;
};

// Rate limiting for player creation
class PlayerRateLimit {
  private static creationTimes: number[] = [];
  private static readonly MAX_CREATIONS_PER_MINUTE = 30;

  static canCreatePlayer(): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old entries
    this.creationTimes = this.creationTimes.filter(time => time > oneMinuteAgo);
    
    if (this.creationTimes.length >= this.MAX_CREATIONS_PER_MINUTE) {
      return false;
    }
    
    this.creationTimes.push(now);
    return true;
  }
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = React.memo(({
  videoId,
  title,
  thumbnail,
  duration,
  className = '',
  autoplay = false,
  showControls = true,
  onPlay,
  onPause
}) => {  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef<string>('');
  const currentVideoIdRef = useRef<string>('');
  const apiManager = useRef(YouTubeAPIManager.getInstance());
  const mountedRef = useRef(true);

  // Don't render if no valid videoId
  if (!videoId || videoId.trim() === '') {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-800 rounded-lg ${className}`}>
        <div className="text-gray-400 text-center">
          <Youtube className="w-8 h-8 mx-auto mb-2" />
          <p>No video ID available</p>
        </div>
      </div>
    );
  }

  // Generate stable player ID only when video changes
  useEffect(() => {
    if (currentVideoIdRef.current !== videoId) {
      // Unregister old player
      if (playerIdRef.current) {
        apiManager.current.unregisterPlayer(playerIdRef.current);
      }
      
      playerIdRef.current = generatePlayerId(videoId);
      currentVideoIdRef.current = videoId;
      
      // Register new player
      apiManager.current.registerPlayer(playerIdRef.current);
    }
  }, [videoId]);

  // Load YouTube API
  useEffect(() => {
    let mounted = true;

    const loadAPI = async () => {
      try {
        await apiManager.current.loadAPI();
        if (mounted) {
          setIsAPIReady(true);
        }
      } catch (error) {
        console.error('Failed to load YouTube API:', error);
        if (mounted) {
          setPlayerError('Failed to load YouTube API');
        }
      }
    };

    loadAPI();

    return () => {
      mounted = false;
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Player cleanup error:', error);
        }
      }
      
      if (playerIdRef.current) {
        apiManager.current.unregisterPlayer(playerIdRef.current);
      }
    };
  }, []);  // Create player when conditions are met
  const createPlayer = useCallback(async () => {
    if (!isAPIReady || !showPlayer || !videoId || !containerRef.current || isCreatingPlayer) {
      return;
    }

    // Rate limiting check
    if (!PlayerRateLimit.canCreatePlayer()) {
      setPlayerError('Too many players created. Please wait a moment.');
      return;
    }

    // Only destroy and recreate if video has actually changed
    if (playerRef.current && currentVideoIdRef.current === videoId) {
      return;
    }

    setIsCreatingPlayer(true);
    setIsLoading(true);
    setPlayerError(null);

    // Clean up any existing player
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Player already destroyed or invalid:', error);
      }
      playerRef.current = null;
    }    // Set up timeout to handle cases where player never loads due to blocked requests
    const playerTimeout = setTimeout(() => {
      if (mountedRef.current && isCreatingPlayer) {
        console.warn('YouTube player creation timed out, likely due to blocked analytics requests');
        setIsLoading(false);
        setIsCreatingPlayer(false);
        setShowFallback(true);
        // Don't set error - player might still work, just analytics are blocked
      }
    }, 8000); // 8 second timeout

    try {
      // Create a new div element for the YouTube player to avoid React conflicts
      const playerElement = document.createElement('div');
      playerElement.id = playerIdRef.current;
      playerElement.style.width = '100%';
      playerElement.style.height = '256px';
      
      // Clear container and add player element
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(playerElement);
      }

      playerRef.current = new window.YT.Player(playerIdRef.current, {
        height: '256',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: showControls ? 1 : 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1,
          // Disable analytics to prevent ad blocker conflicts
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
        },
        events: {          onReady: (event: any) => {
            clearTimeout(playerTimeout);
            if (!mountedRef.current) return;
            
            console.log('YouTube player ready for video:', videoId);
            setIsLoading(false);
            setPlayerError(null);
            setIsCreatingPlayer(false);
            setShowFallback(false);
            
            if (autoplay) {
              try {
                event.target.playVideo();
              } catch (error) {
                console.error('Error auto-playing video:', error);
              }
            }
          },
          onStateChange: (event: any) => {
            if (!mountedRef.current) return;
            
            const playerState = event.data;
            
            if (playerState === window.YT.PlayerState.PLAYING) {
              // Clear loading state when video actually starts playing
              setIsLoading(false);
              setIsCreatingPlayer(false);
              setIsPlaying(true);
              onPlay?.();
            } else if (
              playerState === window.YT.PlayerState.PAUSED ||
              playerState === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
              onPause?.();
            }
          },
          onError: (event: any) => {
            clearTimeout(playerTimeout);
            if (!mountedRef.current) return;
            
            const errorMessages: Record<number, string> = {
              2: 'Invalid video ID',
              5: 'HTML5 player error',
              100: 'Video not found',
              101: 'Video not allowed in embedded players',
              150: 'Video not allowed in embedded players'
            };
            
            const errorMessage = errorMessages[event.data] || 'Unknown player error';
            console.error('YouTube player error:', event.data, errorMessage);
            setPlayerError(errorMessage);
            setIsLoading(false);
            setIsCreatingPlayer(false);
          }
        },
      });

      // Add additional error handling for network issues (ERR_BLOCKED_BY_CLIENT)
      window.addEventListener('error', (e) => {
        if (e.message && e.message.includes('ERR_BLOCKED_BY_CLIENT')) {
          console.warn('Analytics request blocked by ad blocker - this is normal and won\'t affect playback');
        }
      });

    } catch (error) {
      clearTimeout(playerTimeout);
      console.error('Failed to create YouTube player:', error);
      setPlayerError('Failed to create player');
      setIsLoading(false);
      setIsCreatingPlayer(false);
    }
  }, [isAPIReady, showPlayer, videoId, autoplay, showControls, onPlay, onPause]);

  useEffect(() => {
    createPlayer();
  }, [createPlayer]);  const handlePlayClick = useCallback(() => {
    if (!showPlayer) {
      setShowPlayer(true);
      return;
    }

    if (playerError || showFallback) {
      setPlayerError(null);
      setShowFallback(false);
      createPlayer();
      return;
    }

    if (playerRef.current) {
      try {
        const currentState = playerRef.current.getPlayerState();
        
        if (isPlaying || currentState === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.error('Error controlling player:', error);
        setPlayerError('Player control error');
      }
    }
  }, [showPlayer, playerError, showFallback, isPlaying, createPlayer]);

  const openInYouTube = useCallback(() => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  }, [videoId]);

  if (!showPlayer) {
    return (
      <div className={`relative group cursor-pointer ${className}`}>
        {/* Thumbnail with play overlay */}
        <div 
          className="relative bg-gray-900 rounded-lg overflow-hidden"
          onClick={handlePlayClick}
        >          <img
            src={thumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
            alt={title}
            className="w-full h-48 object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors duration-200">
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}

          {/* YouTube badge */}
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Youtube className="w-3 h-3" />
            YouTube
          </div>
        </div>

        {/* Title and controls */}
        <div className="mt-3">
          <h4 className="text-white font-medium text-sm line-clamp-2">{title}</h4>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handlePlayClick}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Play className="w-3 h-3" fill="currentColor" />
              Play
            </button>
            <button
              onClick={openInYouTube}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open in YouTube
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`youtube-player ${className}`}>      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 z-10">
            <div className="text-center text-white">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm">Loading player...</div>
              {isCreatingPlayer && (
                <div className="text-xs text-gray-400 mt-1">
                  Note: If this takes too long, ad blockers may be blocking YouTube analytics
                </div>
              )}
            </div>
          </div>
        )}          {playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-center">
              <div className="text-red-400 mb-2">{playerError}</div>
              <button
                onClick={handlePlayClick}
                className="text-xs text-gray-400 hover:text-white"
              >
                Click to retry
              </button>
            </div>
          </div>
        )}

        {showFallback && !playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 z-10">
            <div className="text-center text-white">
              <Youtube className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-sm mb-2">Player loading timed out</div>
              <div className="text-xs text-gray-400 mb-3">This usually happens when ad blockers block YouTube analytics</div>
              <button
                onClick={openInYouTube}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                Watch on YouTube
              </button>
            </div>
          </div>
        )}
        
        {/* Container for YouTube player - React won't manage the contents */}
        <div 
          ref={containerRef} 
          className="w-full h-64"
          style={{ minHeight: '256px' }}
        />
        
        {/* External link button */}
        <button
          onClick={openInYouTube}
          className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-2 rounded-lg transition-colors duration-200 z-20"
          title="Open in YouTube"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        {showControls && (
          <div className="flex items-center gap-2 mt-2">            <button
              onClick={handlePlayClick}
              disabled={isCreatingPlayer}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" fill="currentColor" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
