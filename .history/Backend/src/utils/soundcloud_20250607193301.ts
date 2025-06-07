/**
 * SoundCloud URL handling utilities
 * No API required - works with basic URL parsing and embed functionality
 */

/**
 * Extract SoundCloud track info from URL
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
      trackId: `${username}_${permalink}`, // Create a simple ID from URL parts
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
 * Extract basic track information from SoundCloud URL (no API required)
 */
export const fetchSoundCloudTrackData = async (trackUrl: string): Promise<{
  id: string;
  title: string;
  permalink_url: string;
  user: {
    username: string;
  };
} | null> => {
  try {
    const info = extractSoundCloudInfo(trackUrl);
    
    if (!info.username || !info.permalink) {
      return null;
    }

    // Return basic info extracted from URL structure
    return {
      id: info.trackId || `${info.username}_${info.permalink}`,
      title: info.permalink.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert to title case
      permalink_url: trackUrl,
      user: {
        username: info.username
      }
    };
  } catch (error) {
    console.error('Error parsing SoundCloud track URL:', error);
    return null;
  }
};

/**
 * Check if SoundCloud track URL appears valid (basic validation)
 */
export const checkSoundCloudTrackAccessibility = async (trackUrl: string): Promise<boolean> => {
  // Basic URL validation without API calls
  return isValidSoundCloudUrl(trackUrl);
};

/**
 * Get SoundCloud track ID from URL (no API required)
 */
export const getSoundCloudTrackId = async (trackUrl: string): Promise<string | null> => {
  const trackData = await fetchSoundCloudTrackData(trackUrl);
  return trackData ? trackData.id : null;
};


