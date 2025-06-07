import React, { useState, useEffect } from 'react';
import { Play, Pause, ExternalLink, Youtube } from 'lucide-react';
import { getYouTubeEmbedUrl, formatDuration } from '../utils/youtube';

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
}) => {  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [playerError, setPlayerError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('YouTubePlayer state:', { 
      videoId, 
      showPlayer, 
      isAPIReady, 
      hasPlayer: !!player,
      isPlaying,
      playerError,
      isLoading
    });
  }, [videoId, showPlayer, isAPIReady, player, isPlaying, playerError, isLoading]);

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

  useEffect(() => {
    // Load YouTube iframe API if not already loaded
    if (typeof window.YT === 'undefined' || typeof window.YT.Player === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onload = () => {
        // API script calls window.onYouTubeIframeAPIReady when ready
      };
      script.onerror = () => {
        console.error("Failed to load YouTube Iframe API script.");
        // Optionally, set an error state here to inform the user
      };
      document.body.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        setIsAPIReady(true);
      };
    } else {
      setIsAPIReady(true); // API already loaded
    }

    // No player destruction here; managed by the other useEffect
  }, []); // Runs once on mount

  useEffect(() => {
    const shouldPlayerBeActive = isAPIReady && showPlayer && videoId && videoId.trim() !== '';

    if (shouldPlayerBeActive) {
      const playerId = `youtube-player-${videoId}`;
      const newPlayerInstance = new window.YT.Player(playerId, {
        height: '256', // Match h-64 container (16rem * 16px/rem = 256px)
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
            if (autoplay || playWhenReady) { // Modified condition
              event.target.playVideo();
              setPlayWhenReady(false); // Reset flag
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
        },
      });

      setPlayer(newPlayerInstance);

      return () => {
        if (newPlayerInstance) {
          newPlayerInstance.destroy();
        }
      };
    } else {
      // Conditions for an active player are not met.
      if (player) { // `player` is the current value from state
        player.destroy();
        setPlayer(null);
      }
      if (isPlaying) { // Ensure isPlaying state is false if no player should be active
        setIsPlaying(false);
        // Consider if onPause?.() should be called here if isPlaying was true
      }
    }
  }, [isAPIReady, showPlayer, videoId, autoplay, showControls, onPlay, onPause, playWhenReady]); // Added playWhenReady to dependencies

  const handlePlayClick = () => {
    if (!showPlayer) {
      setShowPlayer(true);
      setPlayWhenReady(true); // Signal to play when ready
    } else if (player) {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
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
        <div id={`youtube-player-${videoId}`} className="w-full h-64" />
        
        {/* External link button */}
        <button
          onClick={openInYouTube}
          className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-2 rounded-lg transition-colors duration-200"
          title="Open in YouTube"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3">
        <h4 className="text-white font-medium text-sm">{title}</h4>
      </div>
    </div>
  );
};

export default YouTubePlayer;
