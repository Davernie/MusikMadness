import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, ExternalLink, Youtube } from 'lucide-react';
import { formatDuration, getYouTubeThumbnail } from '../utils/youtube';

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

// Advanced memory cleanup for YouTube players
class PlayerMemoryManager {
  private static activePlayers = new Map<string, any>();
  
  static registerPlayer(id: string, player: any) {
    this.activePlayers.set(id, player);
  }
  
  static unregisterPlayer(id: string) {
    const player = this.activePlayers.get(id);
    if (player) {
      try {
        player.destroy();
      } catch (error) {
        console.warn('Error destroying player:', error);
      }
      this.activePlayers.delete(id);
    }
  }
    static cleanupAll() {
    for (const [, player] of this.activePlayers) {
      try {
        player.destroy();
      } catch (error) {
        console.warn('Error destroying player during cleanup:', error);
      }
    }
    this.activePlayers.clear();
  }
  
  static getActiveCount() {
    return this.activePlayers.size;
  }
}

// Throttle utility for performance optimization
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
};

// Debounce utility for preventing rapid clicks
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Singleton YouTube API manager for better scalability
class YouTubeAPIManager {
  private static instance: YouTubeAPIManager;
  private isLoaded = false;
  private isLoading = false;
  private callbacks: (() => void)[] = [];
  private playerInstances = new Set<string>();
  private lastAPICall = 0;
  private readonly MIN_API_INTERVAL = 100; // Minimum interval between API calls

  static getInstance(): YouTubeAPIManager {
    if (!YouTubeAPIManager.instance) {
      YouTubeAPIManager.instance = new YouTubeAPIManager();
    }
    return YouTubeAPIManager.instance;
  }

  // Throttled API loading
  async loadAPI(): Promise<void> {
    const now = Date.now();
    if (now - this.lastAPICall < this.MIN_API_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_API_INTERVAL - (now - this.lastAPICall)));
    }
    this.lastAPICall = Date.now();

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

// Enhanced rate limiting for player creation with throttling
class PlayerRateLimit {
  private static creationTimes: number[] = [];
  private static readonly MAX_CREATIONS_PER_MINUTE = 10; // Further reduced for better performance
  private static readonly MIN_CREATION_INTERVAL = 150; // Increased minimum interval
  private static lastCreation = 0;

  static canCreatePlayer(): boolean {
    const now = Date.now();
    
    // Check minimum interval
    if (now - this.lastCreation < this.MIN_CREATION_INTERVAL) {
      return false;
    }

    const oneMinuteAgo = now - 60000;
    
    // Remove old entries
    this.creationTimes = this.creationTimes.filter(time => time > oneMinuteAgo);
    
    if (this.creationTimes.length >= this.MAX_CREATIONS_PER_MINUTE) {
      return false;
    }
    
    this.creationTimes.push(now);
    this.lastCreation = now;
    return true;
  }
}

// Memoized thumbnail component with lazy loading and robust error handling
const PlayerThumbnail = React.memo<{
  videoId: string;
  thumbnail?: string;
  title: string;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  isVisible: boolean;
}>(({ videoId, thumbnail, title, onImageError, isVisible }) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  
  // List of thumbnail URLs to try in order (start with high quality, then degrade)
  const thumbnailSources = useMemo(() => {
    const sources = [];
    
    // Use provided thumbnail first if available
    if (thumbnail) {
      sources.push(thumbnail);
    }
    
    // Try different YouTube qualities in order of preference
    sources.push(
      getYouTubeThumbnail(videoId, 'high'), 
      getYouTubeThumbnail(videoId, 'medium'),
      getYouTubeThumbnail(videoId, 'default'),
      getYouTubeThumbnail(videoId, 'maxres') // Try maxres last as it's not always available
    );
    
    return sources;
  }, [videoId, thumbnail]);
  
  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (currentSrcIndex < thumbnailSources.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
    } else {
      setHasError(true);
      onImageError(e);
    }
  }, [currentSrcIndex, thumbnailSources, onImageError]);
  
  const handleLoad = useCallback(() => {
    setHasError(false);
  }, []);
  
  // Reset when videoId changes
  useEffect(() => {
    setCurrentSrcIndex(0);
    setHasError(false);
  }, [videoId]);

  if (!isVisible) {
    return (
      <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-48 bg-gradient-to-r from-red-600 to-red-700 flex flex-col items-center justify-center text-white">
        <Youtube className="w-12 h-12 mb-2 opacity-80" />
        <div className="text-sm font-medium">YouTube Video</div>
        <div className="text-xs opacity-80 mt-1">Thumbnail unavailable</div>
      </div>
    );
  }

  return (
    <img
      src={thumbnailSources[currentSrcIndex]}
      alt={title}
      className="w-full h-48 object-cover"
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
});

PlayerThumbnail.displayName = 'PlayerThumbnail';

// Memoized play button overlay
const PlayButtonOverlay = React.memo(() => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 transition-colors duration-200">
      <Play className="w-8 h-8 ml-1" fill="currentColor" />
    </div>
  </div>
));

PlayButtonOverlay.displayName = 'PlayButtonOverlay';

// Memoized duration badge
const DurationBadge = React.memo<{ duration?: number }>(({ duration }) => {
  if (!duration) return null;
  
  return (
    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
      {formatDuration(duration)}
    </div>
  );
});

DurationBadge.displayName = 'DurationBadge';

// Memoized YouTube badge
const YouTubeBadge = React.memo(() => (
  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
    <Youtube className="w-3 h-3" />
    YouTube
  </div>
));

YouTubeBadge.displayName = 'YouTubeBadge';

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
  const [playerError, setPlayerError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [isClickDisabled, setIsClickDisabled] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef<string>('');
  const currentVideoIdRef = useRef<string>('');
  const apiManagerRef = useRef<YouTubeAPIManager>(YouTubeAPIManager.getInstance());
  const retryCountRef = useRef(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const thumbnailRef = useRef<HTMLDivElement>(null);

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

  // Intersection Observer for lazy loading and visibility tracking
  useEffect(() => {
    if (!thumbnailRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    observerRef.current.observe(thumbnailRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Memoized player configuration
  const playerConfig = useMemo(() => ({
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
    }
  }), [videoId, autoplay, showControls]);  // Dummy error handler for PlayerThumbnail component compatibility
  const handleImageError = useCallback(() => {
    // Error handling is now done inside PlayerThumbnail component
  }, []);

  // Memoized external link handler
  const openInYouTube = useCallback(() => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  }, [videoId]);

  // Throttled state change handler
  const throttledStateChange = useMemo(
    () => throttle((playerState: number) => {
      if (playerState === window.YT?.PlayerState.PLAYING) {
        setIsPlaying(true);
        onPlay?.();
      } else if (
        playerState === window.YT?.PlayerState.PAUSED ||
        playerState === window.YT?.PlayerState.ENDED
      ) {
        setIsPlaying(false);
        onPause?.();
      }
    }, 100),
    [onPlay, onPause]
  );

  // Throttled error handler
  const throttledErrorHandler = useMemo(
    () => throttle((errorData: any) => {
      console.error('YouTube player error:', errorData);
      setPlayerError(true);
      setIsLoading(false);
      setIsCreatingPlayer(false);
      apiManagerRef.current.unregisterPlayer(playerIdRef.current);
      PlayerMemoryManager.unregisterPlayer(playerIdRef.current);
    }, 200),
    []
  );

  // Debounced click handler with enhanced rate limiting
  const debouncedPlayClick = useMemo(
    () => debounce(() => {
      // Prevent rapid clicking
      if (isClickDisabled) {
        return;
      }

      setIsClickDisabled(true);
      setTimeout(() => setIsClickDisabled(false), 1000); // Increased debounce time

      if (!showPlayer) {
        setShowPlayer(true);
        return;
      }

      if (playerError) {
        // Implement retry limit
        if (retryCountRef.current >= 3) {
          console.warn('Max retry attempts reached');
          return;
        }
        
        retryCountRef.current++;
        setPlayerError(false);
        setRetryCount(retryCountRef.current);
        return;
      }

      if (playerRef.current) {
        try {
          const currentState = playerRef.current.getPlayerState();
          
          if (isPlaying || currentState === window.YT?.PlayerState.PLAYING) {
            playerRef.current.pauseVideo();
          } else {
            // Ensure player is ready before attempting to play
            if (currentState === window.YT?.PlayerState.CUED || 
                currentState === window.YT?.PlayerState.PAUSED ||
                currentState === window.YT?.PlayerState.ENDED) {
              playerRef.current.playVideo();
            } else {
              // Player might not be ready, try loading the video first
              playerRef.current.loadVideoById(videoId);
              setTimeout(() => {
                if (playerRef.current) {
                  playerRef.current.playVideo();
                }
              }, 300); // Reduced timeout
            }
          }
        } catch (error) {
          console.error('Error controlling player:', error);
          // Don't set error state immediately, try one more time
          try {
            playerRef.current.loadVideoById(videoId);
          } catch (secondError) {
            console.error('Second attempt failed:', secondError);
            setPlayerError(true);
          }
        }
      }
    }, 200), // Increased debounce delay for better performance
    [isClickDisabled, showPlayer, playerError, isPlaying, videoId]
  );

  // Generate stable player ID only when video changes
  useEffect(() => {
    if (currentVideoIdRef.current !== videoId) {
      playerIdRef.current = generatePlayerId(videoId);
      currentVideoIdRef.current = videoId;
      retryCountRef.current = 0; // Reset retry count for new video
      setRetryCount(0);
    }
  }, [videoId]);

  // Load YouTube API using the manager
  useEffect(() => {
    const loadAPI = async () => {
      try {
        await apiManagerRef.current.loadAPI();
        setIsAPIReady(true);
      } catch (error) {
        console.error('Failed to load YouTube API:', error);
        setPlayerError(true);
      }
    };

    loadAPI();
  }, []);

  // Create player when conditions are met - optimized with better dependencies
  useEffect(() => {
    if (!isAPIReady || !showPlayer || !videoId || !containerRef.current || isCreatingPlayer) {
      return;
    }

    // Only destroy and recreate if video has actually changed
    if (playerRef.current && currentVideoIdRef.current === videoId) {
      return;
    }

    // Check rate limiting
    if (!PlayerRateLimit.canCreatePlayer()) {
      console.warn('Rate limit exceeded for player creation');
      setPlayerError(true);
      return;
    }

    setIsCreatingPlayer(true);

    // Clean up any existing player with enhanced memory management
    if (playerRef.current) {
      try {
        apiManagerRef.current.unregisterPlayer(playerIdRef.current);
        PlayerMemoryManager.unregisterPlayer(playerIdRef.current);
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Player already destroyed or invalid:', error);
      }
      playerRef.current = null;
    }

    setIsLoading(true);
    setPlayerError(false);

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

    try {
      // Register the player with both managers
      apiManagerRef.current.registerPlayer(playerIdRef.current);

      playerRef.current = new window.YT.Player(playerIdRef.current, {
        ...playerConfig,
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready for video:', videoId);
            PlayerMemoryManager.registerPlayer(playerIdRef.current, playerRef.current);
            setIsLoading(false);
            setPlayerError(false);
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
            throttledStateChange(event.data);
          },
          onError: (event: any) => {
            throttledErrorHandler(event.data);
          }
        },
      });
    } catch (error) {
      console.error('Failed to create YouTube player:', error);
      setPlayerError(true);
      setIsLoading(false);
      setIsCreatingPlayer(false);
      // Unregister on error
      apiManagerRef.current.unregisterPlayer(playerIdRef.current);
      PlayerMemoryManager.unregisterPlayer(playerIdRef.current);
    }

    // Enhanced cleanup function for this effect
    return () => {
      if (playerRef.current) {
        try {
          apiManagerRef.current.unregisterPlayer(playerIdRef.current);
          PlayerMemoryManager.unregisterPlayer(playerIdRef.current);
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Player cleanup error:', error);
        }
        playerRef.current = null;
      }
    };
  }, [isAPIReady, showPlayer, videoId, playerConfig, throttledStateChange, throttledErrorHandler]); // Optimized dependencies

  // Cleanup on unmount with enhanced memory management
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          apiManagerRef.current.unregisterPlayer(playerIdRef.current);
          PlayerMemoryManager.unregisterPlayer(playerIdRef.current);
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Unmount cleanup error:', error);
        }
        playerRef.current = null;
      }
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Memoized thumbnail view
  const thumbnailView = useMemo(() => (
    <div ref={thumbnailRef} className={`relative group cursor-pointer ${className}`}>
      {/* Thumbnail with play overlay */}
      <div 
        className="relative bg-gray-900 rounded-lg overflow-hidden"
        onClick={debouncedPlayClick}
      >
        <PlayerThumbnail
          videoId={videoId}
          thumbnail={thumbnail}
          title={title}
          onImageError={handleImageError}
          isVisible={isVisible}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
        
        <PlayButtonOverlay />
        <DurationBadge duration={duration} />
        <YouTubeBadge />
      </div>

      {/* Title and controls */}
      <div className="mt-3">
        <h4 className="text-white font-medium text-sm line-clamp-2">{title}</h4>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={debouncedPlayClick}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            disabled={isClickDisabled}
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
  ), [className, debouncedPlayClick, videoId, thumbnail, title, handleImageError, duration, openInYouTube, isClickDisabled, isVisible]);

  // Memoized player view
  const playerView = useMemo(() => (
    <div className={`youtube-player ${className}`}>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-white">Loading player...</div>
          </div>
        )}
        
        {playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-center">
              <div className="text-red-400 mb-2">
                Player Error {retryCount > 0 && `(Retry ${retryCount}/3)`}
              </div>
              <button
                onClick={debouncedPlayClick}
                className="text-xs text-gray-400 hover:text-white"
                disabled={retryCount >= 3 || isClickDisabled}
              >
                {retryCount >= 3 ? 'Max retries reached' : 'Click to retry'}
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
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={debouncedPlayClick}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              disabled={isClickDisabled}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" fill="currentColor" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
          </div>
        )}
      </div>
    </div>
  ), [className, isLoading, playerError, retryCount, debouncedPlayClick, isClickDisabled, openInYouTube, title, showControls, isPlaying]);

  if (!showPlayer) {
    return thumbnailView;
  }

  return playerView;
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;
