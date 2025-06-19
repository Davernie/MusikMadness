import React, { useState } from 'react';
import { Play, ExternalLink, Music } from 'lucide-react';
import { formatDuration } from '../utils/soundcloud';

interface SoundCloudPlayerProps {
  trackId?: number; // Made optional since we might not have it
  title: string;
  username?: string;
  artwork?: string;
  duration?: number;
  className?: string;
  autoplay?: boolean;
  originalUrl?: string; // Add original URL to construct embed
  onPlay?: () => void;
}

const SoundCloudPlayer: React.FC<SoundCloudPlayerProps> = ({
  trackId,
  title,
  username,
  artwork,
  duration,
  className = '',
  autoplay = false,
  originalUrl,
  onPlay
}) => {
  const [showPlayer, setShowPlayer] = useState(autoplay);  // Don't render if no valid trackId and no originalUrl
  if ((!trackId || trackId <= 0) && !originalUrl) {
    return (
      <div className={`flex items-center justify-center h-48 bg-gray-800 rounded-lg ${className}`}>
        <div className="text-gray-400 text-center">
          <Music className="w-8 h-8 mx-auto mb-2" />
          <p>No track information available</p>
        </div>
      </div>
    );
  }

  const handlePlayClick = () => {
    if (!showPlayer) {
      setShowPlayer(true);
      onPlay?.();
    }
  };

  const openInSoundCloud = () => {
    // Use the original URL if available, otherwise construct from trackId
    const soundcloudUrl = originalUrl || (trackId ? `https://soundcloud.com/track/${trackId}` : '#');
    if (soundcloudUrl !== '#') {
      window.open(soundcloudUrl, '_blank');
    }
  };  // Create embed URL - use originalUrl if available, otherwise use trackId
  const embedUrl = (() => {
    if (originalUrl) {
      // Create embed URL from the original SoundCloud URL with maximum controls
      const params = new URLSearchParams();
      params.append('url', originalUrl);
      params.append('auto_play', autoplay.toString());
      params.append('visual', 'false'); 
      params.append('color', 'ff6600');
      // Remove restrictive parameters to get full player
      return `https://w.soundcloud.com/player/?${params.toString()}`;
    } else if (trackId) {
      // Fallback to trackId-based embed URL with maximum controls
      return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&auto_play=${autoplay}&visual=false&color=ff6600`;
    }
    return '';
  })();

  if (!showPlayer) {
    return (
      <div className={`relative group cursor-pointer ${className}`}>
        {/* Artwork with play overlay */}        <div 
          className="relative bg-gray-900 rounded-lg overflow-hidden"
          onClick={handlePlayClick}
        >
          {artwork ? (
            <img
              src={artwork}
              alt={title}
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
              <Music className="w-8 h-8 text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-200" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 hover:bg-white text-orange-600 rounded-full p-2 transition-all duration-200 shadow-lg">
              <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
            </div>
          </div>

          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}          {/* SoundCloud badge */}
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
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
  }  return (
    <div className={`soundcloud-player ${className}`}>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {embedUrl ? (
          <iframe
            key={`soundcloud-${trackId || 'url'}`}
            width="100%"
            height="300"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={embedUrl}
            className="w-full"
          />
        ) : (
          <div className="w-full h-[300px] bg-gray-800 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Unable to load SoundCloud player</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoundCloudPlayer;
