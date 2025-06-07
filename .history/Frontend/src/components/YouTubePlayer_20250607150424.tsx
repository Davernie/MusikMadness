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

// Generate a unique ID for each player instance to prevent conflicts
let playerIdCounter = 0;

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
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
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerIdRef = useRef<string>('');

  // Generate stable player ID on mount
  useEffect(() => {
    playerIdRef.current = `youtube-player-${++playerIdCounter}-${videoId}`;
  }, [videoId]);

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

  // Cleanup function to safely destroy player
  const destroyPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (error) {
        console.warn('Player already destroyed or invalid:', error);
      }
      playerRef.current = null;
    }
  }, []);

  // Create player when conditions are met
  useEffect(() => {
    if (!isAPIReady || !showPlayer || !videoId || !containerRef.current) {
      return;
    }

    // Clean up any existing player
    destroyPlayer();

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
        events: {
          onReady: (event: any) => {
            console.log('YouTube player ready for video:', videoId);
            setIsLoading(false);
            setPlayerError(false);
            
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
          },
          onError: (event: any) => {
            console.error('YouTube player error:', event.data);
            setPlayerError(true);
            setIsLoading(false);
          }
        },
      });
    } catch (error) {
      console.error('Failed to create YouTube player:', error);
      setPlayerError(true);
      setIsLoading(false);
    }

    return destroyPlayer;
  }, [isAPIReady, showPlayer, videoId, autoplay, showControls, destroyPlayer]);

  // Cleanup on unmount
  useEffect(() => {
    return destroyPlayer;
  }, [destroyPlayer]);
  const handlePlayClick = () => {
    if (!showPlayer) {
      setShowPlayer(true);
      return;
    }

    if (playerError) {
      // Try to reload the player
      setPlayerError(false);
      setShowPlayer(false);
      setTimeout(() => setShowPlayer(true), 100);
      return;
    }

    if (playerRef.current) {
      try {
        if (isPlaying) {
          playerRef.current.pauseVideo();
        } else {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.error('Error controlling player:', error);
        setPlayerError(true);
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
    </div>  );
};

export default YouTubePlayer;

export default YouTubePlayer;
