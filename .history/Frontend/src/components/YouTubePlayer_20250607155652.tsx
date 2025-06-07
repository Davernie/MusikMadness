import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, Play, RefreshCw, ExternalLink, Shield, X } from 'lucide-react';

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
  onError?: (error: string) => void;
}

// Singleton class to manage YouTube API loading globally
class YouTubeAPIManager {
  private static instance: YouTubeAPIManager;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  static getInstance(): YouTubeAPIManager {
    if (!YouTubeAPIManager.instance) {
      YouTubeAPIManager.instance = new YouTubeAPIManager();
    }
    return YouTubeAPIManager.instance;
  }

  async loadAPI(): Promise<void> {
    if (this.isLoaded) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.doLoadAPI();
    return this.loadPromise;
  }

  private async doLoadAPI(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;
    this.isLoading = true;

    try {
      // Check if already loaded
      if (window.YT && window.YT.Player) {
        this.isLoaded = true;
        this.isLoading = false;
        return Promise.resolve();
      }

      // Load YouTube IFrame API script
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      
      const loadPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('YouTube API loading timeout'));
        }, 15000);

        window.onYouTubeIframeAPIReady = () => {
          clearTimeout(timeout);
          this.isLoaded = true;
          this.isLoading = false;
          resolve();
        };

        script.onerror = () => {
          clearTimeout(timeout);
          this.isLoading = false;
          reject(new Error('Failed to load YouTube API script'));
        };
      });

      document.head.appendChild(script);
      await loadPromise;
    } catch (error) {
      this.isLoading = false;
      this.retryCount++;
      
      if (this.retryCount < this.maxRetries) {
        console.warn(`YouTube API load failed, retrying (${this.retryCount}/${this.maxRetries}):`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
        return this.doLoadAPI();
      }
      
      throw error;
    }
  }

  isAPIReady(): boolean {
    return this.isLoaded && window.YT && window.YT.Player;
  }
}

// Rate limiting class to prevent too many simultaneous players
class PlayerRateLimit {
  private static instance: PlayerRateLimit;
  private playerCreationTimes: number[] = [];
  private readonly maxPlayersPerMinute = 30;
  private readonly windowMs = 60000; // 1 minute

  static getInstance(): PlayerRateLimit {
    if (!PlayerRateLimit.instance) {
      PlayerRateLimit.instance = new PlayerRateLimit();
    }
    return PlayerRateLimit.instance;
  }

  canCreatePlayer(): boolean {
    const now = Date.now();
    // Remove old entries
    this.playerCreationTimes = this.playerCreationTimes.filter(
      time => now - time < this.windowMs
    );
    
    return this.playerCreationTimes.length < this.maxPlayersPerMinute;
  }

  recordPlayerCreation(): void {
    this.playerCreationTimes.push(Date.now());
  }
}

// Generate unique player IDs with collision resistance
const generatePlayerId = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `youtube-player-${timestamp}-${random}`;
};

// Ad blocker detection utility
const detectAdBlocker = async (): Promise<boolean> => {
  try {
    // Test if we can load a common ad-related resource
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors'
    });
    return false; // No ad blocker detected
  } catch {
    return true; // Likely ad blocker or network issue
  }
};

// Enhanced error messages for specific YouTube error codes
const getYouTubeErrorMessage = (errorCode: number): string => {
  switch (errorCode) {
    case 2:
      return 'Invalid video ID. Please check the video URL.';
    case 5:
      return 'HTML5 player error. Your browser may not support this video.';
    case 100:
      return 'Video not found or has been removed.';
    case 101:
    case 150:
      return 'Video is not available for embedding or restricted by owner.';
    default:
      return `YouTube player error (${errorCode}). Please try again.`;
  }
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  thumbnail,
  duration,
  className = '',
  autoplay = false,
  showControls = true,
  onPlay,
  onPause,
  onError
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [hasAdBlocker, setHasAdBlocker] = useState<boolean | null>(null);
  const [timeoutStage, setTimeoutStage] = useState<'none' | 'warning' | 'error' | 'fallback'>('none');
  
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const playerId = useRef(generatePlayerId());
  
  const apiManager = YouTubeAPIManager.getInstance();
  const rateLimit = PlayerRateLimit.getInstance();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying YouTube player:', e);
      }
      playerInstanceRef.current = null;
    }
    
    setPlayer(null);
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  // Progressive timeout strategy
  const startTimeoutProtection = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 3 second warning
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && isLoading) {
        setTimeoutStage('warning');
        console.warn('YouTube player loading slowly...');
      }
    }, 3000);

    // 8 second error
    setTimeout(() => {
      if (mountedRef.current && isLoading) {
        setTimeoutStage('error');
        console.error('YouTube player loading timeout');
      }
    }, 8000);

    // 12 second force fallback
    setTimeout(() => {
      if (mountedRef.current && isLoading) {
        setTimeoutStage('fallback');
        setShowFallback(true);
        setIsLoading(false);
        setError('Player took too long to load. This may be due to ad blockers or network issues.');
        onError?.('Player loading timeout');
      }
    }, 12000);
  }, [isLoading, onError]);

  // Create YouTube player
  const createPlayer = useCallback(async () => {
    if (!mountedRef.current || !playerRef.current || !videoId) return;

    // Check rate limiting
    if (!rateLimit.canCreatePlayer()) {
      setError('Too many players created recently. Please wait a moment.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setTimeoutStage('none');
      
      // Start timeout protection
      startTimeoutProtection();

      // Load API if needed
      await apiManager.loadAPI();

      if (!mountedRef.current) return;

      // Check if API is really ready
      if (!apiManager.isAPIReady()) {
        throw new Error('YouTube API not ready after loading');
      }

      // Record player creation for rate limiting
      rateLimit.recordPlayerCreation();

      // Clear any existing player
      cleanup();

      // Create new player with minimal parameters to avoid ad blocker conflicts
      const newPlayer = new window.YT.Player(playerId.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          // Minimal parameters to reduce ad blocker detection
          autoplay: autoplay ? 1 : 0,
          controls: showControls ? 1 : 0,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          // Remove analytics parameters that might trigger ad blockers
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            if (!mountedRef.current) return;
            
            console.log('YouTube player ready for video:', videoId);
            setIsLoading(false);
            setTimeoutStage('none');
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            if (autoplay) {
              try {
                event.target.playVideo();
              } catch (e) {
                console.warn('Autoplay failed:', e);
              }
            }
          },
          onStateChange: (event: any) => {
            if (!mountedRef.current) return;
            
            const state = event.data;
            console.log('YouTube player state change:', state, 'for video:', videoId);
            
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              onPlay?.();
            } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              onPause?.();
            }
          },
          onError: (event: any) => {
            if (!mountedRef.current) return;
            
            const errorCode = event.data;
            const errorMessage = getYouTubeErrorMessage(errorCode);
            console.error('YouTube player error:', errorCode, errorMessage, 'for video:', videoId);
            
            setError(errorMessage);
            setIsLoading(false);
            setTimeoutStage('fallback');
            onError?.(errorMessage);
          }
        }
      });

      playerInstanceRef.current = newPlayer;
      setPlayer(newPlayer);

    } catch (error) {
      if (!mountedRef.current) return;
      
      console.error('Failed to create YouTube player:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load video player';
      setError(errorMessage);
      setIsLoading(false);
      setTimeoutStage('fallback');
      onError?.(errorMessage);
    }
  }, [videoId, autoplay, showControls, onPlay, onPause, onError, startTimeoutProtection, cleanup]);

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  thumbnail,
  duration,
  className = '',
  autoplay = false,
  showControls = true,
  onPlay,
  onPause,
  onError
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [hasAdBlocker, setHasAdBlocker] = useState<boolean | null>(null);
  const [timeoutStage, setTimeoutStage] = useState<'none' | 'warning' | 'error' | 'fallback'>('none');
  
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const playerId = useRef(generatePlayerId());
  
  const apiManager = YouTubeAPIManager.getInstance();
  const rateLimit = PlayerRateLimit.getInstance();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying YouTube player:', e);
      }
      playerInstanceRef.current = null;
    }
    
    setPlayer(null);
    setIsLoading(false);
    setIsPlaying(false);
  }, []);

  // Progressive timeout strategy
  const startTimeoutProtection = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 3 second warning
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && isLoading) {
        setTimeoutStage('warning');
        console.warn('YouTube player loading slowly...');
      }
    }, 3000);

    // 8 second error
    setTimeout(() => {
      if (mountedRef.current && isLoading) {
        setTimeoutStage('error');
        console.error('YouTube player loading timeout');
      }
    }, 8000);

    // 12 second force fallback
    setTimeout(() => {
      if (mountedRef.current && isLoading) {
        setTimeoutStage('fallback');
        setShowFallback(true);
        setIsLoading(false);
        setError('Player took too long to load. This may be due to ad blockers or network issues.');
        onError?.('Player loading timeout');
      }
    }, 12000);
  }, [isLoading, onError]);

  // Create YouTube player
  const createPlayer = useCallback(async () => {
    if (!mountedRef.current || !playerRef.current || !videoId) return;

    // Check rate limiting
    if (!rateLimit.canCreatePlayer()) {
      setError('Too many players created recently. Please wait a moment.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setTimeoutStage('none');
      
      // Start timeout protection
      startTimeoutProtection();

      // Load API if needed
      await apiManager.loadAPI();

      if (!mountedRef.current) return;

      // Check if API is really ready
      if (!apiManager.isAPIReady()) {
        throw new Error('YouTube API not ready after loading');
      }

      // Record player creation for rate limiting
      rateLimit.recordPlayerCreation();

      // Clear any existing player
      cleanup();

      // Create new player with minimal parameters to avoid ad blocker conflicts
      const newPlayer = new window.YT.Player(playerId.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          // Minimal parameters to reduce ad blocker detection
          autoplay: autoplay ? 1 : 0,
          controls: showControls ? 1 : 0,
          disablekb: 0,
          fs: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          // Remove analytics parameters that might trigger ad blockers
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            if (!mountedRef.current) return;
            
            console.log('YouTube player ready for video:', videoId);
            setIsLoading(false);
            setTimeoutStage('none');
            
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            
            if (autoplay) {
              try {
                event.target.playVideo();
              } catch (e) {
                console.warn('Autoplay failed:', e);
              }
            }
          },
          onStateChange: (event: any) => {
            if (!mountedRef.current) return;
            
            const state = event.data;
            console.log('YouTube player state change:', state, 'for video:', videoId);
            
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              onPlay?.();
            } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              onPause?.();
            }
          },
          onError: (event: any) => {
            if (!mountedRef.current) return;
            
            const errorCode = event.data;
            const errorMessage = getYouTubeErrorMessage(errorCode);
            console.error('YouTube player error:', errorCode, errorMessage, 'for video:', videoId);
            
            setError(errorMessage);
            setIsLoading(false);
            setTimeoutStage('fallback');
            onError?.(errorMessage);
          }
        }
      });

      playerInstanceRef.current = newPlayer;
      setPlayer(newPlayer);

    } catch (error) {
      if (!mountedRef.current) return;
      
      console.error('Failed to create YouTube player:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load video player';
      setError(errorMessage);
      setIsLoading(false);
      setTimeoutStage('fallback');
      onError?.(errorMessage);
    }
  }, [videoId, autoplay, showControls, onPlay, onPause, onError, startTimeoutProtection, cleanup]);

  // Effect for ad blocker detection
  useEffect(() => {
    detectAdBlocker().then(setHasAdBlocker);
  }, []);

  // Effect for player creation and cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    if (videoId) {
      createPlayer();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [videoId, createPlayer, cleanup]);

  // Memoized event handlers
  const handleRetry = useCallback(() => {
    setError(null);
    setShowFallback(false);
    setTimeoutStage('none');
    createPlayer();
  }, [createPlayer]);

  const handleOpenYouTube = useCallback(() => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  }, [videoId]);

  const handleDismissError = useCallback(() => {
    setError(null);
    setTimeoutStage('none');
  }, []);

  // Render fallback thumbnail with controls
  const renderFallback = () => (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Play className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <button
            onClick={handleOpenYouTube}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors"
            title="Watch on YouTube"
          >
            <Play className="w-8 h-8 fill-current" />
          </button>
        </div>
        
        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
      
      {/* Title and controls */}
      <div className="p-4">
        <h4 className="text-white font-medium text-sm line-clamp-2 mb-3">{title}</h4>
        
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry Player
          </button>
          <button
            onClick={handleOpenYouTube}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open in YouTube
          </button>
        </div>
      </div>
    </div>
  );

  // Render error message
  const renderError = () => {
    if (!error && timeoutStage === 'none') return null;

    const isTimeout = timeoutStage !== 'none';
    const isWarning = timeoutStage === 'warning';
    
    return (
      <div className={`absolute top-2 left-2 right-2 z-10 ${isWarning ? 'bg-yellow-900/90' : 'bg-red-900/90'} text-white p-3 rounded-lg border ${isWarning ? 'border-yellow-500/50' : 'border-red-500/50'}`}>
        <div className="flex items-start gap-2">
          <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isWarning ? 'text-yellow-400' : 'text-red-400'}`} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mb-1">
              {isWarning ? 'Loading slowly...' : 'Player Error'}
            </div>
            <div className="text-xs opacity-90">
              {error || (isTimeout ? 'Player is taking longer than expected to load' : '')}
            </div>
            
            {hasAdBlocker && (
              <div className="mt-2 text-xs opacity-75 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Ad blocker detected - this may affect video loading
              </div>
            )}
            
            {!isWarning && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <button
                  onClick={handleRetry}
                  className="text-blue-300 hover:text-blue-200 transition-colors"
                >
                  Try Again
                </button>
                <span className="text-gray-400">•</span>
                <button
                  onClick={handleOpenYouTube}
                  className="text-red-300 hover:text-red-200 transition-colors"
                >
                  Open in YouTube
                </button>
              </div>
            )}
          </div>
          
          {!isWarning && (
            <button
              onClick={handleDismissError}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Show fallback if needed
  if (showFallback || timeoutStage === 'fallback') {
    return renderFallback();
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
            <div className="text-white text-sm">
              {timeoutStage === 'warning' ? 'Still loading...' : 'Loading player...'}
            </div>
          </div>
        </div>
      )}
      
      {/* Error overlay */}
      {renderError()}
      
      {/* YouTube player container */}
      <div className="aspect-video">
        <div
          ref={playerRef}
          id={playerId.current}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default YouTubePlayer;
