import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Added import
import styles from './TrackPlayer.module.css';
import YouTubePlayer from '../YouTubePlayer';
import SoundCloudPlayer from '../SoundCloudPlayer';

// Create a static audio context to manage multiple players
// This will ensure only one audio can play at a time
const AudioContext = {
  currentlyPlaying: null as string | null,
  pauseAllExcept: (id: string) => {
    AudioContext.currentlyPlaying = id;
    // The actual pausing logic will be in each component's effect
    document.dispatchEvent(new CustomEvent('audio-exclusive-play', { detail: { id } }));
  },
  getCurrentlyPlaying: () => AudioContext.currentlyPlaying
};

interface TrackPlayerProps {
  track: {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    streamUrl?: string | null; // New field for presigned URLs
    audioType?: 'r2' | 'local' | 'youtube' | 'soundcloud'; // Added soundcloud
    // YouTube-specific fields
    youtubeVideoId?: string;
    youtubeThumbnail?: string;
    youtubeDuration?: number;
    // SoundCloud-specific fields
    soundcloudTrackId?: number;
    soundcloudArtwork?: string;
    soundcloudDuration?: number;
    soundcloudUsername?: string;
    soundcloudUrl?: string;
    embedUrl?: string;
    // coverImage?: string; // Keep or remove based on whether it's still needed elsewhere
  };
  competitorId: string; // Added prop
  competitorProfileImage?: string; // Added prop
  isLeft: boolean;
  gradientStart: string;
  gradientEnd: string;
  onUrlRefreshNeeded?: () => void; // Callback for when URL refresh is needed
}

const TrackPlayer: React.FC<TrackPlayerProps> = ({ track, competitorId, competitorProfileImage, isLeft, gradientStart, gradientEnd, onUrlRefreshNeeded }) => {  // Debug logging for all track types
  // Console debug output for troubleshooting audio issues
  // console.log('TrackPlayer track data debug:', JSON.stringify({
  //   trackId: track.id,
  //   hasAudioUrl: !!track.audioUrl,
  //   hasStreamUrl: !!track.streamUrl,
  //   audioType: track.audioType,
  //   audioUrlLength: track.audioUrl?.length,
  //   streamUrlLength: track.streamUrl?.length
  // }, null, 2));

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);  const [volume, setVolume] = useState(0.8); // Default volume
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  const volumeControlRef = useRef<HTMLDivElement>(null);  // Reset player when track changes
  useEffect(() => {
    if (track.audioType === 'youtube') {
      // Reset YouTube player state - let YouTubePlayer component handle its own state
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setError(null);
      setDuration(track.youtubeDuration || 0);
    } else if (track.audioType === 'soundcloud') {
      // Reset SoundCloud player state - let SoundCloudPlayer component handle its own state
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setError(null);
      setDuration(track.soundcloudDuration || 0);
    } else {
      // Reset audio player
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setError(null);
      }
    }
  }, [track.id, track.audioUrl, track.youtubeVideoId, track.youtubeDuration, track.soundcloudTrackId, track.soundcloudDuration]);// Listen for exclusive play event to pause this player if another is playing
  useEffect(() => {
    const handleExclusivePlay = (e: CustomEvent) => {
      const { id } = e.detail;      // If another player is playing, pause this one
      if (id !== track.id && isPlaying) {
        if (track.audioType === 'youtube') {
          // For YouTube, we'll rely on the callback system to coordinate
          setIsPlaying(false);
        } else if (track.audioType === 'soundcloud') {
          // For SoundCloud, we'll rely on the callback system to coordinate
          setIsPlaying(false);
        } else if (audioRef.current) {
          audioRef.current.pause();
          cancelAnimationFrame(animationRef.current as number);
        }
        setIsPlaying(false);
      }
    };

    // Add event listener with type assertion for CustomEvent
    document.addEventListener('audio-exclusive-play', handleExclusivePlay as EventListener);
    
    // Cleanup
    return () => {
      document.removeEventListener('audio-exclusive-play', handleExclusivePlay as EventListener);
    };
  }, [track.id, isPlaying, track.audioType]);
    const togglePlay = () => {
    if (error) {
      // If there was an error, try reloading
      setError(null);
      if (track.audioType === 'youtube') {
        // For YouTube, we'll let the YouTubePlayer component handle reload
        return;
      } else if (audioRef.current) {
        audioRef.current.load();
        return;
      }
    }    if (track.audioType === 'youtube') {
      // Handle YouTube player - we can't directly control the YouTube player
      // but we can coordinate with other players through the callback system
      // The actual play/pause will be handled by the YouTubePlayer component
      if (!isPlaying) {
        // Tell other players to pause
        AudioContext.pauseAllExcept(track.id);
        // The YouTubePlayer component will handle the actual playback
      }
    } else if (track.audioType === 'soundcloud') {
      // Handle SoundCloud player - similar to YouTube, we coordinate through callbacks
      // The actual play/pause will be handled by the SoundCloudPlayer component
      if (!isPlaying) {
        // Tell other players to pause
        AudioContext.pauseAllExcept(track.id);
        // The SoundCloudPlayer component will handle the actual playback
      }
    } else {
      // Handle audio player
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          cancelAnimationFrame(animationRef.current as number);
          setIsPlaying(false);
        } else {
          // Tell other players to pause
          AudioContext.pauseAllExcept(track.id);
          
          audioRef.current.play()
            .then(() => {
              animationRef.current = requestAnimationFrame(updateProgress);
              setIsPlaying(true);
            })
            .catch(err => {
              console.error('Error playing audio:', err);
              
              // Check if this might be an expired R2 URL              if (track.audioType === 'r2' && onUrlRefreshNeeded) {
                console.log('R2 URL might be expired, requesting refresh...');
                onUrlRefreshNeeded();
              } else {
                setError('Could not play audio. Please try again.');
              }
            });
        }
      }
    }
  };
  
  const updateProgress = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const currentTime = audioRef.current.currentTime;
      
      setCurrentTime(currentTime);
      
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
      
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  };    useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }      if (isPlaying) {
        if (track.audioType === 'youtube') {
          // For YouTube, we'll just update our state
          // The YouTubePlayer component handles its own cleanup
        } else if (track.audioType === 'soundcloud') {
          // For SoundCloud, we'll just update our state
          // The SoundCloudPlayer component handles its own cleanup
        } else if (audioRef.current) {
          audioRef.current.pause();
        }
        // Clear from context if this was the playing track
        if (AudioContext.currentlyPlaying === track.id) {
          AudioContext.currentlyPlaying = null;
        }
      }
    };
  }, [isPlaying, track.id, track.audioType]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      const currentTime = audioRef.current.currentTime;
      
      setCurrentTime(currentTime);
      
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  };
  
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  const handleError = () => {
    console.error('Audio loading error for track:', track.id, 'URL:', track.audioUrl);
    
    // Check if this might be an expired R2 URL    if (track.audioType === 'r2' && onUrlRefreshNeeded) {
      console.log('R2 audio loading failed, requesting URL refresh...');
      onUrlRefreshNeeded();
    } else {
      setError('Failed to load audio. Please try again.');
    }
    
    setIsLoading(false);
    setIsPlaying(false);
  };
    const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    // Clear the currently playing track from AudioContext when done
    if (AudioContext.currentlyPlaying === track.id) {
      AudioContext.currentlyPlaying = null;
    }
  };
    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedValue = (x / progressBar.offsetWidth) * audioRef.current.duration;
      
      audioRef.current.currentTime = clickedValue;
      setCurrentTime(clickedValue);
      setProgress((clickedValue / audioRef.current.duration) * 100);
    }
  };
  
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
  
  // Set initial volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };  // YouTube player event handlers - memoized to prevent unnecessary re-renders
  const handleYouTubePlay = useCallback(() => {
    AudioContext.pauseAllExcept(track.id);
    setIsPlaying(true);
  }, [track.id]);

  const handleYouTubePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // SoundCloud player event handlers - memoized to prevent unnecessary re-renders
  const handleSoundCloudPlay = useCallback(() => {
    AudioContext.pauseAllExcept(track.id);
    setIsPlaying(true);  }, [track.id]);

  return (
    <div className={`flex flex-col items-${isLeft ? 'start' : 'end'} p-6 bg-gray-800/80 backdrop-blur-md rounded-xl border border-${isLeft ? gradientStart : gradientEnd}-500/30 w-full`}>
      <div className="flex items-center w-full mb-4">
        {isLeft ? (
          // Left player layout
          <>
            <div className="flex items-center">
              <Link to={`/profile/${competitorId}`}>
                <img 
                  src={competitorProfileImage || '/src/assets/images/default-avatar.png'} // Use default avatar
                  alt={`${track.artist}'s profile`} // Updated alt text
                  className="h-16 w-16 object-cover rounded-md mr-3 cursor-pointer" // Added cursor-pointer
                />
              </Link>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white">{track.title}</h3>
                <p className="text-gray-300">{track.artist}</p>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
            </div>              <div className="flex items-center ml-auto">
              {/* Volume control - only show for regular audio files */}
              {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (
                <div className="relative mr-2" ref={volumeControlRef}>
                <button
                  onClick={toggleVolumeControl}
                  className={`p-2 rounded-full text-white hover:bg-gray-700/50 transition`}
                >
                  {volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
                
                {showVolumeControl && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-800 rounded-lg shadow-lg z-10 w-32">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full accent-cyan-500"
                    />                  </div>
                )}
              </div>
              )}
              
              {/* Play/Pause button - only show for regular audio files */}
              {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (
                <button 
                  onClick={togglePlay}
                  disabled={isLoading}
                  className={`p-3 rounded-full bg-gradient-to-r from-${gradientStart}-500 to-blue-600 
                    hover:${styles['shadow-glow-cyan']} transition duration-200
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                    ${isPlaying ? styles['animate-pulse-scale'] : ''}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isPlaying ? (
                    <div className={styles['playing-indicator']}>
                      <div className={styles['playing-bar']}></div>
                      <div className={styles['playing-bar']}></div>
                      <div className={styles['playing-bar']}></div>
                    </div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (          // Right player layout (mirrored)
          <>
            <div className="flex items-center">
              {/* Play/Pause button - only show for regular audio files */}
              {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (
                <button 
                  onClick={togglePlay}
                  disabled={isLoading}
                  className={`p-3 rounded-full bg-gradient-to-r from-purple-600 to-${gradientEnd}-500 
                    hover:${styles['shadow-glow-fuchsia']} transition duration-200
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                    ${isPlaying ? styles['animate-pulse-scale'] : ''}`}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : isPlaying ? (
                    <div className={styles['playing-indicator']}>
                      <div className={styles['playing-bar']}></div>
                      <div className={styles['playing-bar']}></div>
                      <div className={styles['playing-bar']}></div>
                    </div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  )}
                </button>
              )}
              
              {/* Volume control - only show for regular audio files */}
              {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (
                <div className="relative ml-2" ref={volumeControlRef}>
                <button
                  onClick={toggleVolumeControl}
                  className={`p-2 rounded-full text-white hover:bg-gray-700/50 transition`}
                >
                  {volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4zM23 9l-6 6M17 9l6 6" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 5L6 9H2v6h4l5 4zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
                
                {showVolumeControl && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-3 bg-gray-800 rounded-lg shadow-lg z-10 w-32">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full accent-cyan-500"
                    />                  </div>
                )}
              </div>
              )}
            </div>
            
            <div className="flex items-center ml-auto">
              <div className="flex flex-col items-end mr-3">
                <h3 className="text-xl font-bold text-white">{track.title}</h3>
                <p className="text-gray-300">{track.artist}</p>
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
              <Link to={`/profile/${competitorId}`}>
                <img 
                  src={competitorProfileImage || '/src/assets/images/default-avatar.png'} // Use default avatar
                  alt={`${track.artist}'s profile`} // Updated alt text
                  className="h-16 w-16 object-cover rounded-md cursor-pointer" // Added cursor-pointer
                />
              </Link>
            </div>
          </>
        )}
      </div>      {/* Audio/Video player */}
      {track.audioType === 'youtube' ? (
        <div className="w-full mt-3">
          <YouTubePlayer
            videoId={track.youtubeVideoId || ''}
            title={track.title}
            thumbnail={track.youtubeThumbnail}
            duration={track.youtubeDuration}
            className="w-full"
            autoplay={false}
            showControls={true}
            onPlay={handleYouTubePlay}
            onPause={handleYouTubePause}
          />
        </div>      ) : track.audioType === 'soundcloud' ? (        <div className="w-full mt-3">
          <SoundCloudPlayer
            trackId={track.soundcloudTrackId}
            title={track.title}
            artwork={track.soundcloudArtwork}
            duration={track.soundcloudDuration}
            originalUrl={track.soundcloudUrl || track.streamUrl || track.audioUrl}
            className="w-full"
            autoplay={false}
            onPlay={handleSoundCloudPlay}
          />
        </div>
      ) : (
        /* Audio element for regular audio files */
        <audio 
          ref={audioRef}
          src={track.streamUrl || track.audioUrl}
          onEnded={handleEnded}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={handleError}
          className="w-full hidden"
          preload="metadata"
          crossOrigin="anonymous"
        />
      )}{/* Custom progress bar - only show for audio tracks */}
      {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (
        <>
          <div 
            className={`w-full bg-gray-700 rounded-full h-1.5 mt-3 cursor-pointer ${styles['progress-bar']}`}
            onClick={handleProgressBarClick}
          >
            <div 
              className={`h-1.5 rounded-full bg-gradient-to-r ${
                isLeft 
                  ? `from-${gradientStart}-500 to-blue-600`
                  : `from-fuchsia-600 to-${gradientEnd}-500`
              } ${styles['progress-track']}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Time indicators */}
          <div className={`flex ${!isLeft ? 'flex-row-reverse' : ''} justify-between w-full mt-1 text-xs text-gray-400`}>
            {isLeft ? (
              <>
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </>
            ) : (
              <>
                <span>{formatTime(duration)}</span>
                <span>{formatTime(currentTime)}</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrackPlayer;
