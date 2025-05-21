import React, { useState, useRef, useEffect } from 'react';
import './TrackPlayer.module.css';

interface TrackPlayerProps {
  track: {
    id: string;
    title: string;
    artist: string;
    audioUrl: string;
    coverImage?: string;
  };
  isLeft: boolean;
  gradientStart: string;
  gradientEnd: string;
}

const TrackPlayer: React.FC<TrackPlayerProps> = ({ track, isLeft, gradientStart, gradientEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();
  
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
      } else {
        setIsLoading(true);
        audioRef.current.play()
          .then(() => {
            animationRef.current = requestAnimationFrame(updateProgress);
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Error playing audio:', err);
            setError('Could not play audio. Please try again.');
          })
          .finally(() => {
            setIsLoading(false);
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
      }
    };
  }, [isPlaying]);

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
    setError('Failed to load audio. Please try again.');
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

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className={`flex flex-col items-${isLeft ? 'start' : 'end'} p-6 bg-gray-800/80 backdrop-blur-md rounded-xl border border-${isLeft ? gradientStart : gradientEnd}-500/30 w-full`}>
      <div className="flex items-center w-full mb-4">
        <div className={`flex items-center ${!isLeft && 'ml-auto order-2'}`}>
          <img 
            src={track.coverImage || '/src/assets/images/SmallMM_Transparent.png'} 
            alt={track.title} 
            className="h-16 w-16 object-cover rounded-md mr-3"
          />
          <div className={`flex flex-col ${!isLeft && 'text-right mr-3'}`}>
            <h3 className="text-xl font-bold text-white">{track.title}</h3>
            <p className="text-gray-300">{track.artist}</p>
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
          </div>
        </div>
        <button 
          onClick={togglePlay}
          disabled={isLoading}
          className={`p-3 rounded-full bg-gradient-to-r from-${gradientStart}-500 to-${isLeft ? 'blue' : 'purple'}-600 
            ${!isLeft ? 'mr-auto' : 'ml-auto'} hover:shadow-glow-${gradientStart} transition duration-200
            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <rect width="4" height="16" x="6" y="4"></rect>
              <rect width="4" height="16" x="14" y="4"></rect>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </button>
      </div>
      
      {/* Audio player */}
      <audio 
        ref={audioRef}
        src={track.audioUrl}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        className="w-full"
        preload="metadata"
      />
      
      {/* Custom progress bar */}
      <div 
        className="w-full bg-gray-700 rounded-full h-1.5 mt-3 cursor-pointer"
        onClick={handleProgressBarClick}
      >
        <div 
          className={`h-1.5 rounded-full bg-gradient-to-r from-${gradientStart}-500 to-${isLeft ? 'blue' : 'purple'}-600`} 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Time indicators */}
      <div className="flex justify-between w-full mt-1 text-xs text-gray-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default TrackPlayer;
