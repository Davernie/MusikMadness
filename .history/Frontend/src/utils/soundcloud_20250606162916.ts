/**
 * SoundCloud utility functions for the frontend
 */

export const extractSoundCloudInfo = (url: string): { username: string | null; permalink: string | null } => {
  // Remove any trailing slashes and query parameters for consistency
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');
  
  // Pattern for SoundCloud URLs: https://soundcloud.com/username/track-name
  const pattern = /^https?:\/\/(?:www\.)?soundcloud\.com\/([^\/]+)\/([^\/]+)$/;
  const match = cleanUrl.match(pattern);
  
  if (match) {
    const [, username, permalink] = match;
    return { username, permalink };
  }
  
  return { username: null, permalink: null };
};

export const isValidSoundCloudUrl = (url: string): boolean => {
  const info = extractSoundCloudInfo(url);
  return info.username !== null && info.permalink !== null;
};

export const getSoundCloudEmbedUrl = (trackUrl: string, options: {
  autoplay?: boolean;
  showArtwork?: boolean;
  showComments?: boolean;
  showPlaycount?: boolean;
  showUser?: boolean;
  sharing?: boolean;
  download?: boolean;
  buying?: boolean;
  color?: string;
} = {}): string => {
  const params = new URLSearchParams();
  params.append('url', trackUrl);
  params.append('auto_play', options.autoplay?.toString() || 'false');
  params.append('show_artwork', options.showArtwork?.toString() || 'true');
  params.append('show_comments', options.showComments?.toString() || 'false');
  params.append('show_playcount', options.showPlaycount?.toString() || 'false');
  params.append('show_user', options.showUser?.toString() || 'true');
  params.append('sharing', options.sharing?.toString() || 'false');
  params.append('download', options.download?.toString() || 'false');
  params.append('buying', options.buying?.toString() || 'false');
  
  if (options.color) {
    params.append('color', options.color);
  }
  
  return `https://w.soundcloud.com/player/?${params.toString()}`;
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

export const getSoundCloudThumbnail = (artworkUrl: string | null, size: 'small' | 'large' | 'original' = 'large'): string | null => {
  if (!artworkUrl) return null;
  
  // SoundCloud artwork URLs can be modified to get different sizes
  const sizeMap = {
    small: 't67x67',      // 67x67
    large: 't300x300',    // 300x300  
    original: 'original'   // Original size
  };
  
  return artworkUrl.replace('large', sizeMap[size]);
};

export const getSoundCloudApiUrl = (trackUrl: string): string => {
  return `https://api.soundcloud.com/resolve?url=${encodeURIComponent(trackUrl)}`;
};
