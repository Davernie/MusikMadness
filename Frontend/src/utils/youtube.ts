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

export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
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
