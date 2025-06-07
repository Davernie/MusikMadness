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
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef<string>('');
  const currentVideoIdRef = useRef<string>('');
  const apiManager = useRef(YouTubeAPIManager.getInstance());
  const mountedRef = useRef(true);
  const creationTimeoutCleanerRef = useRef<(() => void) | null>(null); // Ref to hold the current timeout cleaner

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
      
      // Clear any active player creation timeouts
      if (creationTimeoutCleanerRef.current) {
        console.log('[Unmount] Clearing active player creation timeouts for', playerIdRef.current);
        creationTimeoutCleanerRef.current();
        creationTimeoutCleanerRef.current = null;
      }
      
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
  }, []);  // Create player with improved fallback handling and ad blocker detection
  const createPlayer = useCallback(async () => {
    console.log('[createPlayer] Called with:', { isAPIReady, showPlayer, videoId: !!videoId, container: !!containerRef.current, isCreatingPlayer });
    
    if (!isAPIReady || !showPlayer || !videoId || !containerRef.current) {
      console.log('Skipping player creation - missing requirements');
      return;
    }

    // Check if we're already creating a player to prevent multiple simultaneous attempts
    if (isCreatingPlayer) {
      console.log('Already creating player, skipping');
      return;
    }

    // Clear any timeouts from a previous attempt for this instance
    if (creationTimeoutCleanerRef.current) {
      console.log('[createPlayer] Clearing previous creation timeouts for video:', videoId);
      creationTimeoutCleanerRef.current();
    }

    // Rate limiting check
    if (!PlayerRateLimit.canCreatePlayer()) {
      setPlayerError('Too many players created. Please wait a moment.');
      return;
    }

    // Only destroy and recreate if video has actually changed
    if (playerRef.current && currentVideoIdRef.current === videoId) {
      console.log('Player already exists for this video, skipping recreation');
      return;
    }

    console.log('Creating YouTube player for video:', videoId, 'Player ID:', playerIdRef.current);
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
    }

    let shortTimeoutId: NodeJS.Timeout | undefined;
    let mainTimeoutId: NodeJS.Timeout | undefined;
    let forceTimeoutId: NodeJS.Timeout | undefined;

    const clearAllCreationTimeouts = () => {
      console.log('[clearAllCreationTimeouts] Clearing all timeouts for video:', videoId, 'Player ID:', playerIdRef.current);
      clearTimeout(shortTimeoutId);
      clearTimeout(mainTimeoutId);
      clearTimeout(forceTimeoutId);
      if (creationTimeoutCleanerRef.current === clearAllCreationTimeouts) {
        creationTimeoutCleanerRef.current = null; // Unregister self
      }
    };

    // Register this cleaner
    creationTimeoutCleanerRef.current = clearAllCreationTimeouts;

    // Multiple timeouts for progressive fallback
    shortTimeoutId = setTimeout(() => {
      if (mountedRef.current && isCreatingPlayer) {
        console.warn('YouTube player taking longer than expected (3s) for video:', videoId);
      }
    }, 3000);

    mainTimeoutId = setTimeout(() => {
      if (mountedRef.current && isCreatingPlayer) {
        console.warn('YouTube player creation timed out (8s) - ad blocker likely blocking for video:', videoId);
        clearAllCreationTimeouts(); // Clear all timeouts first
        if (mountedRef.current) { // Check mounted again after potential delay from clearAllCreationTimeouts
            setIsLoading(false);
            setIsCreatingPlayer(false);
            setPlayerError('Unable to load YouTube player. This often happens when ad blockers interfere. Try disabling your ad blocker or opening the video directly on YouTube.');
        }
      }
    }, 8000); // Longer timeout before giving up

    forceTimeoutId = setTimeout(() => {
      if (mountedRef.current && (isCreatingPlayer || isLoading)) {
        console.error('Force stopping YouTube player creation (12s) - showing direct link for video:', videoId);
        clearAllCreationTimeouts(); // Clear all timeouts first
        if (mountedRef.current) { // Check mounted again
            setIsLoading(false);
            setIsCreatingPlayer(false);
            setPlayerError('YouTube player failed to load. Please use the "Open in YouTube" button below.');
        }
      }
    }, 12000);

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
        },
        events: {
          onReady: (event: any) => {
            if (!mountedRef.current) {
              console.log('[onReady] Component unmounted, but onReady fired for video:', videoId);
              clearAllCreationTimeouts();
              return;
            }
            
            console.log('YouTube player ready for video:', videoId, 'Player ID:', playerIdRef.current);
            clearAllCreationTimeouts();
            setIsLoading(false);
            setPlayerError(null);
            setIsCreatingPlayer(false);
            
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
            console.log('Player state changed for video', videoId, ':', playerState);
            
            if (playerState === window.YT.PlayerState.PLAYING) {
              clearAllCreationTimeouts(); // Clear timeouts if player successfully starts playing
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
            if (!mountedRef.current) {
              console.log('[onError] Component unmounted, but onError fired for video:', videoId);
              clearAllCreationTimeouts();
              return;
            }
            
            const errorMessages: Record<number, string> = {
              2: 'Invalid video ID',
              5: 'HTML5 player error',
              100: 'Video not found',
              101: 'Video not allowed in embedded players',
              150: 'Video not allowed in embedded players'
            };
            
            const errorMessage = errorMessages[event.data] || 'Unknown player error';
            console.error('YouTube player error for video:', videoId, 'Player ID:', playerIdRef.current, 'Error Code:', event.data, 'Message:', errorMessage);
            clearAllCreationTimeouts();
            setPlayerError(errorMessage);
            setIsLoading(false);
            setIsCreatingPlayer(false);
          }
        },
      });

    } catch (error) {
      console.error('Failed to create YouTube player instance for video:', videoId, 'Player ID:', playerIdRef.current, error);
      clearAllCreationTimeouts();
      if (mountedRef.current) {
        setPlayerError('Failed to create player instance');
        setIsLoading(false);
        setIsCreatingPlayer(false);
      }
    }
  }, [isAPIReady, showPlayer, videoId, autoplay, showControls, onPlay, onPause]); // Removed isCreatingPlayer to prevent infinite loop
  useEffect(() => {
    // Only attempt to create player if showPlayer is true and API is ready
    // and we're not already in the process of creating a player
    if (showPlayer && isAPIReady && !isCreatingPlayer) {
        console.log('[useEffect createPlayer] Calling createPlayer for video:', videoId);
        createPlayer();
    } else {
        console.log('[useEffect createPlayer] Conditions not met:', { showPlayer, isAPIReady, isCreatingPlayer, videoId });
    }
  }, [showPlayer, isAPIReady, videoId]); // Removed createPlayer from dependencies to prevent infinite loop
  const handlePlayClick = useCallback(() => {
    if (!showPlayer) {
      setShowPlayer(true);
      return;
    }

    if (playerError) {
      setPlayerError(null);
      // Reset states to trigger recreation through useEffect
      setIsCreatingPlayer(false);
      setIsLoading(false);
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
  }, [showPlayer, playerError, isPlaying]);

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
        >
          <img
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
    <div className={`youtube-player ${className}`}>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 z-10">
            <div className="text-center text-white">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm">Loading player...</div>
              {isCreatingPlayer && (
                <div className="text-xs text-gray-400 mt-1">
                  If this takes too long, try the "Open in YouTube" button
                </div>
              )}
            </div>
          </div>
        )}

        {playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 z-10">
            <div className="text-center text-white">
              <Youtube className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <div className="text-sm mb-2">Player Error</div>
              <div className="text-xs text-gray-400 mb-3">{playerError}</div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handlePlayClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={openInYouTube}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Open in YouTube
                </button>
              </div>
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
          <div className="flex items-center gap-2 mt-2">
            <button
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
