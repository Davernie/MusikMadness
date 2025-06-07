import axios from 'axios';
import { handleSoundCloudRateLimit } from './soundcloudRateLimit';

/**
 * Extract SoundCloud track ID and user from various SoundCloud URL formats
 */
export const extractSoundCloudInfo = (url: string): { trackId: string | null; username: string | null; permalink: string | null } => {
  // Remove any trailing slashes and query parameters for consistency
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');
  
  // Pattern for SoundCloud URLs: https://soundcloud.com/username/track-name
  const pattern = /^https?:\/\/(?:www\.)?soundcloud\.com\/([^\/]+)\/([^\/]+)$/;
  const match = cleanUrl.match(pattern);
  
  if (match) {
    const [, username, permalink] = match;
    return {
      trackId: null, // Will be resolved via API
      username,
      permalink
    };
  }
  
  return { trackId: null, username: null, permalink: null };
};

/**
 * Validate SoundCloud URL format
 */
export const isValidSoundCloudUrl = (url: string): boolean => {
  const info = extractSoundCloudInfo(url);
  return info.username !== null && info.permalink !== null;
};

/**
 * Get SoundCloud embed URL
 */
export const getSoundCloudEmbedUrl = (trackUrl: string, autoplay: boolean = false, showArtwork: boolean = true): string => {
  const params = new URLSearchParams();
  params.append('url', trackUrl);
  params.append('auto_play', autoplay.toString());
  params.append('show_artwork', showArtwork.toString());
  params.append('show_comments', 'false');
  params.append('show_playcount', 'false');
  params.append('show_user', 'true');
  params.append('sharing', 'false');
  params.append('download', 'false');
  params.append('buying', 'false');
  
  return `https://w.soundcloud.com/player/?${params.toString()}`;
};

/**
 * Fetch SoundCloud track metadata using SoundCloud API v2
 * Requires SOUNDCLOUD_CLIENT_ID environment variable
 */
export const fetchSoundCloudTrackData = async (trackUrl: string): Promise<{
  id: number;
  title: string;
  duration: number; // in milliseconds
  permalink_url: string;
  artwork_url: string | null;
  user: {
    username: string;
    permalink_url: string;
  };
  description: string | null;
  created_at: string;
  genre: string | null;
  tag_list: string;
} | null> => {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  
  if (!clientId) {
    console.warn('SoundCloud Client ID not configured. Cannot fetch metadata.');
    return null;
  }

  try {
    // Use SoundCloud's resolve endpoint to get track data
    const response = await axios.get('https://api.soundcloud.com/resolve', {
      params: {
        url: trackUrl,
        client_id: clientId
      }
    });

    const track = response.data;
    
    if (!track || track.kind !== 'track') {
      throw new Error('Invalid track or track not found');
    }

    return {
      id: track.id,
      title: track.title,
      duration: track.duration, // SoundCloud returns duration in milliseconds
      permalink_url: track.permalink_url,
      artwork_url: track.artwork_url,
      user: {
        username: track.user.username,
        permalink_url: track.user.permalink_url
      },
      description: track.description,
      created_at: track.created_at,
      genre: track.genre,
      tag_list: track.tag_list
    };  } catch (error) {
    // Handle rate limiting specifically
    const rateLimitInfo = handleSoundCloudRateLimit(error);
    if (rateLimitInfo.isRateLimited) {
      console.warn('🚨 SoundCloud rate limit detected in fetchSoundCloudTrackData:', rateLimitInfo.message);
    }
    
    console.error('Error fetching SoundCloud track data:', error);
    return null;
  }
};

/**
 * Get high-quality artwork URL from SoundCloud
 */
export const getSoundCloudArtwork = (artworkUrl: string | null, size: 'small' | 'large' | 'original' = 'large'): string | null => {
  if (!artworkUrl) return null;
  
  // SoundCloud artwork URLs can be modified to get different sizes
  // Replace 'large' with desired size in the URL
  const sizeMap = {
    small: 't67x67',      // 67x67
    large: 't300x300',    // 300x300  
    original: 'original'   // Original size
  };
  
  return artworkUrl.replace('large', sizeMap[size]);
};

/**
 * Check if SoundCloud track is publicly accessible
 */
export const checkSoundCloudTrackAccessibility = async (trackUrl: string): Promise<boolean> => {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  
  if (!clientId) {
    console.warn('SoundCloud Client ID not configured. Cannot check accessibility.');
    return false;
  }

  try {
    const response = await axios.get('https://api.soundcloud.com/resolve', {
      params: {
        url: trackUrl,
        client_id: clientId
      },
      timeout: 5000
    });

    const track = response.data;
    return track && track.kind === 'track' && track.sharing === 'public';  } catch (error) {
    // Handle rate limiting specifically
    const rateLimitInfo = handleSoundCloudRateLimit(error);
    if (rateLimitInfo.isRateLimited) {
      console.warn('🚨 SoundCloud rate limit detected in checkSoundCloudTrackAccessibility:', rateLimitInfo.message);
    }
    
    console.error('Error checking SoundCloud track accessibility:', error);
    return false;
  }
};

/**
 * Convert SoundCloud duration from milliseconds to seconds
 */
export const soundCloudDurationToSeconds = (durationMs: number): number => {
  return Math.floor(durationMs / 1000);
};

/**
 * Get SoundCloud track ID from URL using the API
 */
export const getSoundCloudTrackId = async (trackUrl: string): Promise<number | null> => {
  const trackData = await fetchSoundCloudTrackData(trackUrl);
  return trackData ? trackData.id : null;
};
