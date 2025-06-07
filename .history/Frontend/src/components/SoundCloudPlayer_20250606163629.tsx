import React, { useState, useEffect } from 'react';
import { Play, ExternalLink, Music } from 'lucide-react';
import { formatDuration } from '../utils/soundcloud';

interface SoundCloudPlayerProps {
  trackId: number;
  title: string;
  username?: string;
  artwork?: string;
  duration?: number;
  className?: string;
  autoplay?: boolean;
  showControls?: boolean;
  originalUrl?: string; // Add original URL to construct embed
  onPlay?: () => void;
  onPause?: () => void;
}

declare global {
  interface Window {
    SC: any;
  }
}

const SoundCloudPlayer: React.FC<SoundCloudPlayerProps> = ({
  trackId,
  title,
  username,
  artwork,
  duration,
  className = '',
  autoplay = false,
  showControls = true,
  originalUrl,
  onPlay,
  onPause
}) => {
  // Debug logging
  useEffect(() => {
    console.log('SoundCloudPlayer debug:', {
      trackId,
      title,
      username,
      artwork,
      duration,
      autoplay,
      showControls
    });
  }, [trackId, title, username, artwork, duration, autoplay, showControls]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [isAPIReady, setIsAPIReady] = useState(false);
  const [widget, setWidget] = useState<any>(null);

  // Don't render if no valid trackId
  if (!trackId || trackId <= 0) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-800 rounded-lg ${className}`}>
        <div className="text-gray-400 text-center">
          <Music className="w-8 h-8 mx-auto mb-2" />
          <p>No track ID available</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Load SoundCloud Widget API if not already loaded
    if (!window.SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = () => {
        setIsAPIReady(true);
      };
      document.body.appendChild(script);
    } else {
      setIsAPIReady(true);
    }

    return () => {
      if (widget) {
        // SoundCloud widget doesn't have a destroy method, but we can remove event listeners
        widget.unbind(window.SC.Widget.Events.PLAY);
        widget.unbind(window.SC.Widget.Events.PAUSE);
      }
    };
  }, []);

  useEffect(() => {
    if (isAPIReady && showPlayer && !widget && window.SC) {
      const iframeId = `soundcloud-player-${trackId}`;
      const iframe = document.getElementById(iframeId);
      
      if (iframe) {
        const newWidget = window.SC.Widget(iframe);
        
        newWidget.bind(window.SC.Widget.Events.READY, () => {
          if (autoplay) {
            newWidget.play();
          }
        });

        newWidget.bind(window.SC.Widget.Events.PLAY, () => {
          setIsPlaying(true);
          onPlay?.();
        });

        newWidget.bind(window.SC.Widget.Events.PAUSE, () => {
          setIsPlaying(false);
          onPause?.();
        });

        setWidget(newWidget);
      }
    }
  }, [isAPIReady, showPlayer, trackId, autoplay]);

  const handlePlayClick = () => {
    if (!showPlayer) {
      setShowPlayer(true);
    } else if (widget) {
      if (isPlaying) {
        widget.pause();
      } else {
        widget.play();
      }
    }
  };

  const openInSoundCloud = () => {
    // We'll need to construct the URL from the trackId or store the original URL
    // For now, we'll use a generic SoundCloud link
    window.open(`https://soundcloud.com/track/${trackId}`, '_blank');
  };

  const embedUrl = getSoundCloudEmbedUrl(trackId);

  if (!showPlayer) {
    return (
      <div className={`relative group cursor-pointer ${className}`}>
        {/* Artwork with play overlay */}
        <div 
          className="relative bg-gray-900 rounded-lg overflow-hidden"
          onClick={handlePlayClick}
        >
          <img
            src={artwork || '/src/assets/images/default-soundcloud-artwork.png'}
            alt={title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 transition-colors duration-200">
              <Play className="w-8 h-8 ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatSoundCloudDuration(duration)}
            </div>
          )}

          {/* SoundCloud badge */}
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Music className="w-3 h-3" />
            SoundCloud
          </div>
        </div>

        {/* Title and controls */}
        <div className="mt-3">
          <h4 className="text-white font-medium text-sm line-clamp-2">{title}</h4>
          {username && (
            <p className="text-gray-400 text-xs mt-1">by {username}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handlePlayClick}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <Play className="w-3 h-3" fill="currentColor" />
              Play
            </button>
            <button
              onClick={openInSoundCloud}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Open in SoundCloud
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`soundcloud-player ${className}`}>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          id={`soundcloud-player-${trackId}`}
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={embedUrl}
          className="w-full"
        />
        
        {/* External link button */}
        <button
          onClick={openInSoundCloud}
          className="absolute top-2 right-2 bg-black/80 hover:bg-black text-white p-2 rounded-lg transition-colors duration-200"
          title="Open in SoundCloud"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        {username && (
          <p className="text-gray-400 text-xs mt-1">by {username}</p>
        )}
      </div>
    </div>
  );
};

export default SoundCloudPlayer;
