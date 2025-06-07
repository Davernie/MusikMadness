/**
 * YouTube utility functions for the frontend
 */

export const extractYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  const videoId = extractYouTubeVideoId(url);
  return videoId !== null && videoId.length === 11;
};

// Define the quality type based on YouTube's actual filenames/common keys
export type YouTubeThumbnailQuality = 'default' | 'mq' | 'hq' | 'sd' | 'maxres';

export const getYouTubeThumbnail = (videoId: string, quality: YouTubeThumbnailQuality = 'hq'): string => {
  // Map user-friendly quality names to YouTube's actual file names
  const qualityMap: Record<YouTubeThumbnailQuality, string> = {
    default: 'default.jpg',
    mq: 'mqdefault.jpg',      // Medium Quality
    hq: 'hqdefault.jpg',      // High Quality
    sd: 'sddefault.jpg',      // Standard Definition
    maxres: 'maxresdefault.jpg' // Maximum Resolution
  };

  const fileName = qualityMap[quality] || qualityMap.hq; // Fallback to hq if invalid quality provided
  return `https://img.youtube.com/vi/${videoId}/${fileName}`;
};

export const getYouTubeEmbedUrl = (videoId: string, options: {
  autoplay?: boolean;
  start?: number;
  controls?: boolean;
  modestbranding?: boolean;
  rel?: boolean;
} = {}): string => {
  const params = new URLSearchParams();
  
  if (options.autoplay) params.append('autoplay', '1');
  if (options.start) params.append('start', options.start.toString());
  if (options.controls === false) params.append('controls', '0');
  if (options.modestbranding) params.append('modestbranding', '1');
  if (options.rel === false) params.append('rel', '0');
  
  params.append('enablejsapi', '1');
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};
