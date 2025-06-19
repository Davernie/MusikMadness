import React, { useState, useEffect, useRef } from 'react';
import { Play, ExternalLink, Music, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '../utils/soundcloud';

interface SoundCloudPlayerProps {
  trackId?: number; // Made optional since we might not have it
  title: string;
  artwork?: string;
  duration?: number;
  className?: string;
  autoplay?: boolean;
  showControls?: boolean;
  originalUrl?: string; // Add original URL to construct embed
  onPlay?: () => void;
  onPause?: () => void;
}

const SoundCloudPlayer: React.FC<SoundCloudPlayerProps> = ({
  trackId,
  title,
  artwork,
  duration,
  className = '',
  autoplay = false,
  showControls = true,
  originalUrl,
  onPlay,
  onPause
}) => {
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [volume, setVolume] = useState(0.8); // Default volume (80%)
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const volumeControlRef = useRef<HTMLDivElement>(null);  // Don't render if no valid trackId and no originalUrl
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

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  // Toggle volume control visibility
  const toggleVolumeControl = () => {
    setShowVolumeControl(prev => !prev);
  };

  // Close volume control when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeControlRef.current && 
          !volumeControlRef.current.contains(e.target as Node)) {
        setShowVolumeControl(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
  };

  // Create embed URL - use originalUrl if available, otherwise use trackId
  const embedUrl = (() => {
    if (originalUrl) {
      // Create embed URL from the original SoundCloud URL
      const params = new URLSearchParams();
      params.append('url', originalUrl);
      params.append('auto_play', autoplay.toString());
      params.append('show_artwork', 'false'); // Hide artwork/title section
      params.append('show_comments', 'false');
      params.append('show_playcount', 'false');
      params.append('show_user', 'false'); // Hide user information
      params.append('visual', 'false'); // Disable visual mode to hide title overlay
      params.append('color', 'ff6600');
      params.append('hide_related', 'true');
      params.append('volume', Math.round(volume * 100).toString()); // Add volume parameter
      return `https://w.soundcloud.com/player/?${params.toString()}`;
    } else if (trackId) {
      // Fallback to trackId-based embed URL
      return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&auto_play=${autoplay}&show_artwork=false&show_comments=false&show_playcount=false&show_user=false&visual=false&color=ff6600&hide_related=true&volume=${Math.round(volume * 100)}`;
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
        </div>        {/* Controls only - title removed */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={openInSoundCloud}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open in SoundCloud
          </button>
        </div>
      </div>
    );
  }  return (
    <div className={`soundcloud-player ${className}`}>
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {embedUrl ? (
          <iframe
            key={`soundcloud-${trackId || 'url'}-${Math.round(volume * 100)}`}
            width="100%"
            height="120"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            src={embedUrl}
            className="w-full"
          />
        ) : (
          <div className="w-full h-[120px] bg-gray-800 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Unable to load SoundCloud player</p>
          </div>
        )}

        {/* Volume and External link controls */}
        <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
          {/* Volume Control */}
          <div className="relative" ref={volumeControlRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleVolumeControl();
              }}
              className="bg-black/80 hover:bg-black text-white p-2 rounded-lg transition-colors duration-200"
              title="Volume Control"
              type="button"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {showVolumeControl && (
              <div className="absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-lg shadow-lg z-50 w-32">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ff6600 0%, #ff6600 ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                  }}
                />
                <div className="text-xs text-gray-300 text-center mt-1">
                  {Math.round(volume * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* External link button */}
          <button
            onClick={openInSoundCloud}
            className="bg-black/80 hover:bg-black text-white p-2 rounded-lg transition-colors duration-200"
            title="Open in SoundCloud"
          >
            <ExternalLink className="w-4 h-4" />
          </button>        </div>
      </div>
    </div>
  );
};

export default SoundCloudPlayer;
