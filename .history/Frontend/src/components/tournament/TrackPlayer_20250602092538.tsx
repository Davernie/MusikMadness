import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Added import
import styles from './TrackPlayer.module.css';
import defaultAvatar from '../../assets/images/default-avatar.png'; // Import default avatar

// Create a static audio context to manage multiple players
// This will ensure only one audio can play at a time
const AudioContext = {
  currentlyPlaying: null as string | null,
  pauseAllExcept: (id: string) => {
    AudioContext.currentlyPlaying = id;
    // The actual pausing logic will be in each component's effect
    document.dispatchEvent(new CustomEvent('audio-exclusive-play', { detail: { id } }));
  }
};

interface TrackPlayerProps {
  track: {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    streamUrl?: string | null; // New field for presigned URLs
    audioType?: 'r2' | 'local'; // Indicates storage type
    // coverImage?: string; // Keep or remove based on whether it's still needed elsewhere
  };
  competitorId: string; // Added prop
  competitorProfileImage?: string; // Added prop
  isLeft: boolean;
  gradientStart: string;
  gradientEnd: string;
  onUrlRefreshNeeded?: () => void; // Callback for when URL refresh is needed
}

const TrackPlayer: React.FC<TrackPlayerProps> = ({ track, competitorId, competitorProfileImage, isLeft, gradientStart, gradientEnd, onUrlRefreshNeeded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8); // Default volume
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  const volumeControlRef = useRef<HTMLDivElement>(null);
    // Reset player when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setError(null);
    }
  }, [track.id, track.audioUrl]);
  
  // Listen for exclusive play event to pause this player if another is playing
  useEffect(() => {
    const handleExclusivePlay = (e: CustomEvent) => {
      const { id } = e.detail;
      // If another player is playing, pause this one
      if (id !== track.id && isPlaying && audioRef.current) {
        audioRef.current.pause();
        cancelAnimationFrame(animationRef.current as number);
        setIsPlaying(false);
      }
    };

    // Add event listener with type assertion for CustomEvent
    document.addEventListener('audio-exclusive-play', handleExclusivePlay as EventListener);
    
    // Cleanup
    return () => {
      document.removeEventListener('audio-exclusive-play', handleExclusivePlay as EventListener);
    };
  }, [track.id, isPlaying]);
  
  const togglePlay = () => {
    if (error) {
      // If there was an error, try reloading the audio
      setError(null);
      if (audioRef.current) {
        audioRef.current.load();
        return;
      }
    }
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
            
            // Check if this might be an expired R2 URL
            if (track.audioType === 'r2' && onUrlRefreshNeeded) {
              console.log('R2 URL might be expired, requesting refresh...');
              setError('Stream URL expired. Refreshing...');
              onUrlRefreshNeeded();
            } else {
              setError('Could not play audio. Please try again.');
            }
          });
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
  };
    useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        // Clear from context if this was the playing track
        if (AudioContext.currentlyPlaying === track.id) {
          AudioContext.currentlyPlaying = null;
        }
      }
    };
  }, [isPlaying, track.id]);

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
    
    // Check if this might be an expired R2 URL
    if (track.audioType === 'r2' && onUrlRefreshNeeded) {
      console.log('R2 audio loading failed, requesting URL refresh...');
      setError('Stream URL expired. Click to refresh.');
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

  // Format time to display as mm:ss
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Click outside listener for volume control
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeControl(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const playerAlignmentClass = isLeft ? styles.playerLeft : styles.playerRight;
  const gradientStyle = { background: `linear-gradient(to ${isLeft ? 'left' : 'right'}, ${gradientStart}, ${gradientEnd})` };

  return (
    <div className={`${styles.trackPlayer} ${playerAlignmentClass}`} style={gradientStyle}>
      <div className={styles.albumArt}>
        {/* Link the competitor's profile image to their profile page */}
        <Link to={`/profile/${competitorId}`}>
          <img 
            src={competitorProfileImage || defaultAvatar} // Use defaultAvatar if competitorProfileImage is not available
            alt={`${track.artist}'s profile`} 
            className={styles.profileImage} 
          />
        </Link>
      </div>
      <div className={styles.trackInfoContainer}>
        <div className={styles.trackInfo}>
          <h3>{track.title}</h3>
          <p>{track.artist}</p>
          {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
        <div className={styles.controls}>
          {/* Play/Pause button */}
          <button 
            onClick={togglePlay}
            disabled={isLoading}
            className={`${styles.playPauseButton} ${isLoading ? styles.loading : ''} ${isPlaying ? styles.playing : ''}`}
          >
            {isLoading ? (
              <svg className={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPlaying ? (
              <div className={styles.playingIndicator}>
                <div className={styles.playingBar}></div>
                <div className={styles.playingBar}></div>
                <div className={styles.playingBar}></div>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.playIcon}>
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
          
          {/* Volume control */}
          <div className="relative" ref={volumeControlRef}>
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
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Audio player */}
      <audio 
        ref={audioRef}
        src={track.streamUrl || track.audioUrl}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        className="w-full"
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Custom progress bar */}
      <div 
        className={`w-full bg-gray-700 rounded-full h-1.5 mt-3 cursor-pointer ${styles['progress-bar']}`}
        onClick={handleProgressBarClick}
      >
        <div 
          className={`h-1.5 rounded-full bg-gradient-to-r ${
            isLeft 
              ? `from-${gradientStart}-500 to-blue-600`
              : `from-purple-600 to-${gradientEnd}-500`
          } ${styles['progress-track']}`}
          style={{ width: `${progress}%` }}
        />
      </div>      {/* Time indicators */}
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
    </div>
  );
};

export default TrackPlayer;
