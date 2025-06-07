import axios from 'axios';

/**
 * Extract YouTube video ID from various YouTube URL formats
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

/**
 * Validate YouTube URL format
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  const videoId = extractYouTubeVideoId(url);
  return videoId !== null && videoId.length === 11; // YouTube video IDs are always 11 characters
};

/**
 * Get YouTube video thumbnail URL
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string => {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
};

/**
 * Fetch YouTube video metadata using YouTube Data API v3
 * Requires YOUTUBE_API_KEY environment variable
 */
export const fetchYouTubeVideoData = async (videoId: string): Promise<{
  title: string;
  duration: number; // in seconds
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  description: string;
} | null> => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube API key not configured. Using basic metadata.');
    return {
      title: 'YouTube Video',
      duration: 0,
      thumbnail: getYouTubeThumbnail(videoId),
      channelTitle: 'Unknown',
      publishedAt: new Date().toISOString(),
      description: ''
    };
  }

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        key: apiKey,
        id: videoId,
        part: 'snippet,contentDetails',
        fields: 'items(snippet(title,channelTitle,publishedAt,description,thumbnails),contentDetails(duration))'
      }
    });

    const video = response.data.items?.[0];
    if (!video) {
      throw new Error('Video not found');
    }

    // Convert ISO 8601 duration to seconds
    const duration = parseISO8601Duration(video.contentDetails.duration);
      return {
      title: video.snippet.title,
      duration,
      thumbnail: getYouTubeThumbnail(videoId, 'high'), // Use our reliable thumbnail URL instead of API's
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      description: video.snippet.description || ''
    };
  } catch (error) {
    console.error('Error fetching YouTube video data:', error);
    return null;
  }
};

/**
 * Parse ISO 8601 duration format (PT4M13S) to seconds
 */
const parseISO8601Duration = (duration: string): number => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
};

/**
 * Check if YouTube video is publicly accessible
 */
export const checkYouTubeVideoAccessibility = async (videoId: string): Promise<boolean> => {
  try {
    // Simple check by trying to fetch the thumbnail
    const response = await axios.head(getYouTubeThumbnail(videoId), { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Get YouTube embed URL
 */
export const getYouTubeEmbedUrl = (videoId: string, autoplay: boolean = false, start?: number): string => {
  const params = new URLSearchParams();
  if (autoplay) params.append('autoplay', '1');
  if (start) params.append('start', start.toString());
  params.append('enablejsapi', '1');
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};
