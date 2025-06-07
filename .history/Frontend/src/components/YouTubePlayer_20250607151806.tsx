import React, { useState, useEffect, useRef } from 'react';
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

// Generate a unique ID for each player instance to prevent conflicts
let playerIdCounter = 0;

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
  const [showPlayer, setShowPlayer] = useState(autoplay);  const [isAPIReady, setIsAPIReady] = useState(false);
  const [playerError, setPlayerError] = useState(false);  const [isLoading, setIsLoading] = useState(false);  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [isClickDisabled, setIsClickDisabled] = useState(false);
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef<string>('');
  const currentVideoIdRef = useRef<string>('');

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
      playerIdRef.current = `youtube-player-${++playerIdCounter}-${videoId.slice(0, 8)}`;
      currentVideoIdRef.current = videoId;
    }
  }, [videoId]);

  // Load YouTube API
  useEffect(() => {
    if (typeof window.YT === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else {
      setIsAPIReady(true);
    }
  }, []);
  // Create player when conditions are met
  useEffect(() => {
    if (!isAPIReady || !showPlayer || !videoId || !containerRef.current || isCreatingPlayer) {
      return;
    }

    // Only destroy and recreate if video has actually changed
    if (playerRef.current && currentVideoIdRef.current === videoId) {
      return;
    }

    setIsCreatingPlayer(true);

    // Clean up any existing player
    if (playerRef.current) {
      try {
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
        },
        events: {          onReady: (event: any) => {
            console.log('YouTube player ready for video:', videoId);
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
            const playerState = event.data;
            
            if (playerState === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              onPlay?.();
            } else if (
              playerState === window.YT.PlayerState.PAUSED ||
              playerState === window.YT.PlayerState.ENDED
            ) {
              setIsPlaying(false);
              onPause?.();
            }
          },          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            setPlayerError(true);
            setIsLoading(false);
            setIsCreatingPlayer(false);
          }
        },
      });
    } catch (error) {
      console.error('Failed to create YouTube player:', error);
      setPlayerError(true);
      setIsLoading(false);
      setIsCreatingPlayer(false);
    }

    // Cleanup function for this effect
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Player cleanup error:', error);
        }
        playerRef.current = null;
      }    };
  }, [isAPIReady, showPlayer, videoId]); // Only recreate when essential conditions change

  const handlePlayClick = () => {
    if (!showPlayer) {
      setShowPlayer(true);
      return;
    }

    if (playerError) {
      // Just clear the error and try again, don't recreate the player
      setPlayerError(false);
      return;
    }

    if (playerRef.current) {
      try {
        const currentState = playerRef.current.getPlayerState();
        
        if (isPlaying || currentState === window.YT.PlayerState.PLAYING) {
          playerRef.current.pauseVideo();
        } else {
          // Ensure player is ready before attempting to play
          if (currentState === window.YT.PlayerState.CUED || 
              currentState === window.YT.PlayerState.PAUSED ||
              currentState === window.YT.PlayerState.ENDED) {
            playerRef.current.playVideo();
          } else {
            // Player might not be ready, try loading the video first
            playerRef.current.loadVideoById(videoId);
            setTimeout(() => {
              if (playerRef.current) {
                playerRef.current.playVideo();
              }
            }, 500);
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
  };

  const openInYouTube = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

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
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-white">Loading player...</div>
          </div>
        )}
        
        {playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
            <div className="text-center">
              <div className="text-red-400 mb-2">Player Error</div>
              <button
                onClick={handlePlayClick}
                className="text-xs text-gray-400 hover:text-white"
              >
                Click to retry
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
              onClick={handlePlayClick}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
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

export default YouTubePlayer;
