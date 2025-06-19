import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ExternalLink, Music, Volume2, VolumeX } from 'lucide-react';
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
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [volume, setVolume] = useState(0.8); // Default volume (80%)
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);  const [trackDuration, setTrackDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(false);
  const [widget, setWidget] = useState<any>(null);
  
  const volumeControlRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Add global SC declaration
  declare global {
    interface Window {
      SC: any;
    }
  }// Don't render if no valid trackId and no originalUrl
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
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Toggle volume control visibility
  const toggleVolumeControl = () => {
    setShowVolumeControl(prev => !prev);
  };

  // Audio control functions
  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        onPlay?.();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTrackDuration(audioRef.current.duration);
      audioRef.current.volume = volume;
    }
    setIsLoading(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = parseFloat(e.target.value);
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleAudioError = () => {
    setIsLoading(false);
    console.error('Audio failed to load');
  };
  // Get audio stream URL (this would need to be implemented based on your backend)
  const getStreamUrl = () => {
    // Since we can't directly access SoundCloud streams, we'll use iframe with Widget API
    return null; // This will trigger iframe fallback
  };

  // Create embed URL for iframe fallback
  const embedUrl = (() => {
    if (originalUrl) {
      const params = new URLSearchParams();
      params.append('url', originalUrl);
      params.append('auto_play', autoplay.toString());
      params.append('visual', 'false'); 
      params.append('color', 'ff6600');
      return `https://w.soundcloud.com/player/?${params.toString()}`;
    } else if (trackId) {
      return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&auto_play=${autoplay}&visual=false&color=ff6600`;
    }
    return '';
  })();
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

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleAudioError);
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleAudioError);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, [showPlayer]);

  const handlePlayClick = () => {
    if (!showPlayer) {
      setShowPlayer(true);
      setIsLoading(true);
    } else {
      handlePlayPause();
    }
  };
  const openInSoundCloud = () => {
    // Use the original URL if available, otherwise construct from trackId
    const soundcloudUrl = originalUrl || (trackId ? `https://soundcloud.com/track/${trackId}` : '#');
    if (soundcloudUrl !== '#') {
      window.open(soundcloudUrl, '_blank');
    }
  };

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
        {getStreamUrl() ? (
          // Custom audio player when we have direct stream access
          <>
            <audio
              ref={audioRef}
              src={getStreamUrl() || undefined}
              preload="metadata"
              crossOrigin="anonymous"
            />
            
            {/* Custom Player Interface */}
            <div className="p-4">
              {/* Track Info */}
              <div className="flex items-center gap-3 mb-4">
                {artwork ? (
                  <img
                    src={artwork}
                    alt={title}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <Music className="w-6 h-6 text-white/80" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium text-sm truncate">{title}</h4>
                  {username && (
                    <p className="text-gray-400 text-xs truncate">by {username}</p>
                  )}
                </div>
                <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  SoundCloud
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={trackDuration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ff6600 0%, #ff6600 ${((currentTime / (trackDuration || 1)) * 100)}%, #4b5563 ${((currentTime / (trackDuration || 1)) * 100)}%, #4b5563 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(trackDuration)}</span>
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-between">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full p-3 transition-colors duration-200 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5" fill="currentColor" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                  )}
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="relative" ref={volumeControlRef}>
                    <button
                      onClick={toggleVolumeControl}
                      className="text-gray-400 hover:text-white p-2 transition-colors duration-200"
                      title="Volume Control"
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
                    className="text-gray-400 hover:text-white p-2 transition-colors duration-200"
                    title="Open in SoundCloud"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Fallback to SoundCloud iframe when no direct stream
          <>
            <iframe
              key={`soundcloud-${trackId || 'url'}`}
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={embedUrl}
              className="w-full"
            />
            
            {/* Custom volume overlay on iframe */}
            <div className="absolute top-2 right-2 flex items-center gap-2 z-20">
              <div className="relative" ref={volumeControlRef}>
                <button
                  onClick={toggleVolumeControl}
                  className="bg-black/80 hover:bg-black text-white p-2 rounded-lg transition-colors duration-200"
                  title="Volume Control"
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SoundCloudPlayer;
