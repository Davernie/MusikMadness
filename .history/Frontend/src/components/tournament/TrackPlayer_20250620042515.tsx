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

const TrackPlayer: React.FC<TrackPlayerProps> = ({ track, competitorId, competitorProfileImage, isLeft, onUrlRefreshNeeded }) => {  // Debug logging for all track types
  console.log('🎵 TrackPlayer mounted with track data:', {
    id: track.id,
    title: track.title,
    artist: track.artist,
    audioUrl: track.audioUrl,
    streamUrl: track.streamUrl,
    audioType: track.audioType,
    isLeft: isLeft,
    hasAudioUrl: !!track.audioUrl,
    hasStreamUrl: !!track.streamUrl,
    effectiveUrl: track.streamUrl || track.audioUrl,
    shouldShowPlayButton: track.audioType !== 'youtube' && track.audioType !== 'soundcloud'
  });
  
  console.log('🎵 Full track object:', track);
  
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
  }, [track.id, isPlaying, track.audioType]);    const togglePlay = () => {
    console.log('🎵 TrackPlayer togglePlay called for track:', track.id);
    console.log('🎵 Track data:', {
      audioUrl: track.audioUrl,
      streamUrl: track.streamUrl,
      audioType: track.audioType,
      isPlaying: isPlaying
    });
    
    if (error) {
      console.log('🎵 Had error, trying to reload');
      // If there was an error, try reloading
      setError(null);
      if (track.audioType === 'youtube') {
        // For YouTube, we'll let the YouTubePlayer component handle reload
        return;
      } else if (audioRef.current) {
        audioRef.current.load();
        return;
      }
    }

    // Check if we have a valid audio URL
    const audioSrc = track.streamUrl || track.audioUrl;
    if (!audioSrc && track.audioType !== 'youtube' && track.audioType !== 'soundcloud') {
      console.log('🎵 No audio URL available');
      setError('No audio source available');
      return;
    }

    console.log('🎵 Using audio source:', audioSrc);

    if (track.audioType === 'youtube') {
      console.log('🎵 Handling YouTube player');
      // Handle YouTube player - we can't directly control the YouTube player
      // but we can coordinate with other players through the callback system
      // The actual play/pause will be handled by the YouTubePlayer component
      if (!isPlaying) {
        // Tell other players to pause
        AudioContext.pauseAllExcept(track.id);
        // The YouTubePlayer component will handle the actual playback
      }
    } else if (track.audioType === 'soundcloud') {
      console.log('🎵 Handling SoundCloud player');
      // Handle SoundCloud player - similar to YouTube, we coordinate through callbacks
      // The actual play/pause will be handled by the SoundCloudPlayer component
      if (!isPlaying) {
        // Tell other players to pause
        AudioContext.pauseAllExcept(track.id);
        // The SoundCloudPlayer component will handle the actual playback
      }
    } else {
      console.log('🎵 Handling regular audio player');
      // Handle audio player
      if (audioRef.current) {
        console.log('🎵 Audio ref exists, current src:', audioRef.current.src);
        console.log('🎵 Audio ready state:', audioRef.current.readyState);
        
        if (isPlaying) {
          console.log('🎵 Pausing audio');
          audioRef.current.pause();
          cancelAnimationFrame(animationRef.current as number);
          setIsPlaying(false);
        } else {
          console.log('🎵 Attempting to play audio');
          // Tell other players to pause
          AudioContext.pauseAllExcept(track.id);
          
          audioRef.current.play()
            .then(() => {
              console.log('🎵 Audio play successful');
              animationRef.current = requestAnimationFrame(updateProgress);
              setIsPlaying(true);
            })            .catch(err => {
              console.error('🎵 Error playing audio:', err);
              
              // Check if this might be an expired R2 URL
              if (track.audioType === 'r2' && onUrlRefreshNeeded) {
                console.log('🎵 R2 URL might be expired, requesting refresh...');
                onUrlRefreshNeeded();
              } else {
                setError('Could not play audio. Please try again.');
              }
            });
        }
      } else {
        console.log('🎵 No audio ref available');
        setError('Audio element not ready');
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
    console.error('🎵 Audio loading error for track:', track.id, 'URL:', track.audioUrl);
    console.error('🎵 Stream URL:', track.streamUrl);
    console.error('🎵 Audio type:', track.audioType);
    
    // Check if this might be an expired R2 URL
    if (track.audioType === 'r2' && onUrlRefreshNeeded) {
      console.log('🎵 R2 audio loading failed, requesting URL refresh...');
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
    // Set initial volume when component mounts or audio ref changes
  useEffect(() => {
    console.log('🎵 Setting up audio element for track:', track.id);
    if (audioRef.current) {
      console.log('🎵 Audio ref available, setting volume and src');
      audioRef.current.volume = volume;
      const audioSrc = track.streamUrl || track.audioUrl;
      console.log('🎵 Setting audio src to:', audioSrc);
      
      if (audioSrc && audioRef.current.src !== audioSrc) {
        audioRef.current.src = audioSrc;
        audioRef.current.load();
      }
    } else {
      console.log('🎵 No audio ref available yet');
    }
  }, [volume, track.streamUrl, track.audioUrl, track.id]);
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
    setIsPlaying(true);  }, [track.id]);  return (
    <div className="w-full">
      <div className="flex items-center w-full mb-6">
        {isLeft ? (
          // Left player layout
          <>
            <div className="flex items-center">
              <Link to={`/profile/${competitorId}`}>
                <div className="relative group">
                  <img 
                    src={competitorProfileImage || '/src/assets/images/default-avatar.png'} // Use default avatar
                    alt={`${track.artist}'s profile`} // Updated alt text
                    className="h-16 w-16 object-cover rounded-xl mr-4 cursor-pointer transition-all duration-300 border border-white/10 group-hover:border-cyan-400/50 group-hover:shadow-lg group-hover:shadow-cyan-500/20" // Added cursor-pointer
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-white mb-1 tracking-wide">{track.title}</h3>
                <p className="text-gray-300/90 font-medium">{track.artist}</p>
                {error && <p className="text-red-400 text-xs mt-2 px-2 py-1 bg-red-500/10 rounded border border-red-500/20">{error}</p>}
              </div>
            </div><div className="flex items-center ml-auto">              {/* Volume control - only show for regular audio files */}
              {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (
                <div className="relative mr-3" ref={volumeControlRef}>
                  <button
                    onClick={toggleVolumeControl}
                    className={`p-2 rounded-full text-white/90 transition-all duration-300 hover:text-white border border-white/10 hover:border-white/20
                      ${isLeft 
                        ? 'hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20' 
                        : 'hover:bg-fuchsia-500/20 hover:shadow-lg hover:shadow-fuchsia-500/20'
                      }`}
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
                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 p-4 rounded-xl shadow-2xl z-20 w-36 border border-white/10
                      ${isLeft 
                        ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm' 
                        : 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm'
                      }`}
                      style={{
                        boxShadow: isLeft 
                          ? '0 10px 30px -5px rgba(6, 182, 212, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.1)' 
                          : '0 10px 30px -5px rgba(217, 70, 239, 0.3), 0 0 0 1px rgba(217, 70, 239, 0.1)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-300 font-medium">Volume</span>
                        <span className="text-xs text-gray-400">{Math.round(volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                          isLeft ? 'accent-cyan-500' : 'accent-fuchsia-500'
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${
                            isLeft ? 'rgba(6, 182, 212, 0.8)' : 'rgba(217, 70, 239, 0.8)'
                          } 0%, ${
                            isLeft ? 'rgba(6, 182, 212, 0.8)' : 'rgba(217, 70, 239, 0.8)'
                          } ${volume * 100}%, rgba(75, 85, 99, 0.8) ${volume * 100}%, rgba(75, 85, 99, 0.8) 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
                {/* Play/Pause button - only show for regular audio files */}
              {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (                <button 
                  onClick={() => {
                    console.log('🎵 Play button clicked for track:', track.id);
                    togglePlay();
                  }}
                  disabled={isLoading}
                  className={`p-3 rounded-full transition-all duration-300 hover:scale-[1.02] border border-white/20
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:border-white/40'}
                    ${isLeft 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 border-cyan-400/30' 
                      : 'bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 border-fuchsia-400/30'
                    }`}
                  style={{
                    boxShadow: isLeft 
                      ? '0 4px 15px -3px rgba(6, 182, 212, 0.3)' 
                      : '0 4px 15px -3px rgba(217, 70, 239, 0.3)'
                  }}
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
            <div className="flex items-center">              {/* Play/Pause button - only show for regular audio files */}
              {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (                <button 
                  onClick={() => {
                    console.log('🎵 Play button clicked for track:', track.id);
                    togglePlay();
                  }}
                  disabled={isLoading}
                  className={`p-3 rounded-full transition-all duration-300 hover:scale-[1.02] border border-white/20
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:border-white/40'}
                    bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 border-fuchsia-400/30`}
                  style={{
                    boxShadow: '0 4px 15px -3px rgba(217, 70, 239, 0.3)'
                  }}
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
                <div className="relative ml-3" ref={volumeControlRef}>
                  <button
                    onClick={toggleVolumeControl}
                    className={`p-2 rounded-full text-white/90 transition-all duration-300 hover:text-white border border-white/10 hover:border-white/20
                      ${isLeft 
                        ? 'hover:bg-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/20' 
                        : 'hover:bg-fuchsia-500/20 hover:shadow-lg hover:shadow-fuchsia-500/20'
                      }`}
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
                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 p-4 rounded-xl shadow-2xl z-20 w-36 border border-white/10
                      ${isLeft 
                        ? 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm' 
                        : 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-sm'
                      }`}
                      style={{
                        boxShadow: isLeft 
                          ? '0 10px 30px -5px rgba(6, 182, 212, 0.3), 0 0 0 1px rgba(6, 182, 212, 0.1)' 
                          : '0 10px 30px -5px rgba(217, 70, 239, 0.3), 0 0 0 1px rgba(217, 70, 239, 0.1)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-300 font-medium">Volume</span>
                        <span className="text-xs text-gray-400">{Math.round(volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                          isLeft ? 'accent-cyan-500' : 'accent-fuchsia-500'
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${
                            isLeft ? 'rgba(6, 182, 212, 0.8)' : 'rgba(217, 70, 239, 0.8)'
                          } 0%, ${
                            isLeft ? 'rgba(6, 182, 212, 0.8)' : 'rgba(217, 70, 239, 0.8)'
                          } ${volume * 100}%, rgba(75, 85, 99, 0.8) ${volume * 100}%, rgba(75, 85, 99, 0.8) 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
              <div className="flex items-center ml-auto">
              <div className="flex flex-col items-end mr-4">
                <h3 className="text-xl font-bold text-white mb-1 tracking-wide">{track.title}</h3>
                <p className="text-gray-300/90 font-medium">{track.artist}</p>
                {error && <p className="text-red-400 text-xs mt-2 px-2 py-1 bg-red-500/10 rounded border border-red-500/20">{error}</p>}
              </div>
              <Link to={`/profile/${competitorId}`}>
                <div className="relative group">
                  <img 
                    src={competitorProfileImage || '/src/assets/images/default-avatar.png'} // Use default avatar
                    alt={`${track.artist}'s profile`} // Updated alt text
                    className="h-16 w-16 object-cover rounded-xl cursor-pointer transition-all duration-300 border border-white/10 group-hover:border-fuchsia-400/50 group-hover:shadow-lg group-hover:shadow-fuchsia-500/20" // Added cursor-pointer
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-fuchsia-500/0 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            </div>
          </>
        )}
      </div>      {/* Audio/Video player */}
      {track.audioType === 'youtube' ? (
        <div className="w-full mt-4 rounded-xl overflow-hidden border border-white/10 shadow-lg" 
             style={{
               boxShadow: isLeft 
                 ? '0 8px 25px -5px rgba(6, 182, 212, 0.15)' 
                 : '0 8px 25px -5px rgba(217, 70, 239, 0.15)'
             }}>
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
          />        </div>) : track.audioType === 'soundcloud' ? (
        <div className="w-full mt-4 rounded-xl overflow-hidden border border-white/10 shadow-lg" 
             style={{
               boxShadow: isLeft 
                 ? '0 8px 25px -5px rgba(6, 182, 212, 0.15)' 
                 : '0 8px 25px -5px rgba(217, 70, 239, 0.15)'
             }}>
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
      )}      {/* Custom progress bar - only show for audio tracks */}
      {track.audioType !== 'youtube' && track.audioType !== 'soundcloud' && (
        <>
          <div 
            className={`w-full bg-gray-700/50 rounded-full h-2 mt-4 cursor-pointer transition-all duration-300 hover:h-2.5 ${styles['progress-bar']} border border-white/5`}
            onClick={handleProgressBarClick}
            style={{
              background: 'linear-gradient(to right, rgba(55, 65, 81, 0.8), rgba(75, 85, 99, 0.6))',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div 
              className={`h-full rounded-full transition-all duration-300 ${styles['progress-track']}`}
              style={{ 
                width: `${progress}%`,
                background: isLeft 
                  ? 'linear-gradient(to right, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.8))' 
                  : 'linear-gradient(to right, rgba(217, 70, 239, 0.9), rgba(236, 72, 153, 0.8))',
                boxShadow: isLeft 
                  ? '0 0 8px rgba(6, 182, 212, 0.4)' 
                  : '0 0 8px rgba(217, 70, 239, 0.4)'
              }}
            />
          </div>
          
          {/* Time indicators */}
          <div className={`flex ${!isLeft ? 'flex-row-reverse' : ''} justify-between w-full mt-2 text-sm font-medium`}>
            {isLeft ? (
              <>
                <span className="text-cyan-400/90 tracking-wide">{formatTime(currentTime)}</span>
                <span className="text-gray-400/70 tracking-wide">{formatTime(duration)}</span>
              </>
            ) : (
              <>
                <span className="text-gray-400/70 tracking-wide">{formatTime(duration)}</span>
                <span className="text-fuchsia-400/90 tracking-wide">{formatTime(currentTime)}</span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrackPlayer;
