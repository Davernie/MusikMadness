import axios from 'axios';

// Caching for YouTube results to reduce API calls
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry>();

// Cache TTL constants
const CACHE_TTL = {
  LIVE_STATUS: 5 * 60 * 1000, // 5 minutes for live status
  CHANNEL_INFO: 30 * 60 * 1000, // 30 minutes for channel info
  QUOTA_EXCEEDED: 60 * 60 * 1000, // 1 hour when quota exceeded
};

// Quota management
let quotaExceeded = false;
let quotaResetTime = 0;

// Helper function to check if cached data is valid
function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.timestamp + cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
}

// Helper function to set cached data
function setCachedData(key: string, data: any, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

// YouTube API interfaces
interface YouTubeChannelResponse {
  items: {
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
  }[];
}

interface YouTubeLiveStreamResponse {
  items: {
    id: {
      videoId: string;
    };
    snippet: {
      title: string;
      description: string;
      channelTitle: string;
      liveBroadcastContent: 'live' | 'upcoming' | 'none';
      thumbnails: {
        default?: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
    liveStreamingDetails?: {
      actualStartTime?: string;
      concurrentViewers?: string;
    };
  }[];
}

interface YouTubeVideoDetailsResponse {
  items: {
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
    };
    liveStreamingDetails?: {
      actualStartTime?: string;
      concurrentViewers?: string;
    };
    statistics: {
      viewCount: string;
    };
  }[];
}

class YouTubeService {
  private apiKey = process.env.YOUTUBE_API_KEY;
  private baseURL = 'https://www.googleapis.com/youtube/v3';

  async checkLiveStatus(channelIdentifier: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
    videoId?: string;
  }> {
    try {
      console.log(`🔄 Checking YouTube status for ${channelIdentifier}...`);

      if (!this.apiKey) {
        console.warn('⚠️ YouTube API key not configured');
        return { isLive: false };
      }

      // First, determine if channelIdentifier is a channel ID or username
      let channelId = channelIdentifier;
        // If it looks like a username (doesn't start with UC), get the channel ID
      if (!channelIdentifier.startsWith('UC')) {
        const resolvedChannelId = await this.getChannelIdFromUsername(channelIdentifier);
        if (!resolvedChannelId) {
          console.log(`❌ Could not find YouTube channel for: ${channelIdentifier}`);
          return { isLive: false };
        }
        channelId = resolvedChannelId;
      }

      // Check cache first
      const cachedStatus = getCachedData(`liveStatus_${channelId}`);
      if (cachedStatus) {
        console.log('✅ Live status retrieved from cache');
        return cachedStatus;
      }

      // Method 1: Search for live streams on this channel
      const liveStreamData = await this.searchLiveStreams(channelId);
      if (liveStreamData.isLive) {
        setCachedData(`liveStatus_${channelId}`, liveStreamData, CACHE_TTL.LIVE_STATUS);
        return liveStreamData;
      }

      // Method 2: Check channel's live broadcasts
      const liveBroadcastData = await this.checkChannelLiveBroadcasts(channelId);
      if (liveBroadcastData.isLive) {
        setCachedData(`liveStatus_${channelId}`, liveBroadcastData, CACHE_TTL.LIVE_STATUS);
        return liveBroadcastData;
      }

      return { isLive: false };

    } catch (error: any) {
      console.error(`❌ Error checking YouTube status for ${channelIdentifier}:`, error.message);
      return { isLive: false };
    }
  }

  private async getChannelIdFromUsername(username: string): Promise<string | null> {
    try {
      // Try searching by username/handle
      const response = await axios.get<YouTubeChannelResponse>(
        `${this.baseURL}/channels`,
        {
          params: {
            key: this.apiKey,
            forUsername: username,
            part: 'id,snippet'
          },
          timeout: 10000
        }
      );

      if (response.data.items && response.data.items.length > 0) {
        return response.data.items[0].id;
      }

      // If not found by username, try searching
      const searchResponse = await axios.get(
        `${this.baseURL}/search`,
        {
          params: {
            key: this.apiKey,
            q: username,
            type: 'channel',
            part: 'snippet',
            maxResults: 1
          },
          timeout: 10000
        }
      );

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        return searchResponse.data.items[0].snippet.channelId || searchResponse.data.items[0].id.channelId;
      }

      return null;
    } catch (error) {
      console.error(`Error getting channel ID for ${username}:`, error);
      return null;
    }
  }

  private async searchLiveStreams(channelId: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
    videoId?: string;
  }> {
    try {
      const response = await axios.get<YouTubeLiveStreamResponse>(
        `${this.baseURL}/search`,
        {
          params: {
            key: this.apiKey,
            channelId: channelId,
            eventType: 'live',
            type: 'video',
            part: 'snippet',
            maxResults: 1
          },
          timeout: 10000
        }
      );

      if (response.data.items && response.data.items.length > 0) {
        const liveStream = response.data.items[0];
        
        if (liveStream.snippet.liveBroadcastContent === 'live') {
          // Get detailed info including viewer count
          const videoDetails = await this.getVideoDetails(liveStream.id.videoId);
          
          return {
            isLive: true,
            streamTitle: liveStream.snippet.title,
            viewerCount: videoDetails.viewerCount,
            thumbnailUrl: liveStream.snippet.thumbnails?.high?.url || 
                         liveStream.snippet.thumbnails?.medium?.url ||
                         liveStream.snippet.thumbnails?.default?.url,
            videoId: liveStream.id.videoId
          };
        }
      }

      return { isLive: false };
    } catch (error) {
      console.error('Error searching live streams:', error);
      return { isLive: false };
    }
  }

  private async checkChannelLiveBroadcasts(channelId: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
    videoId?: string;
  }> {
    try {
      // This method requires OAuth, but we can try activities endpoint as fallback
      const response = await axios.get(
        `${this.baseURL}/activities`,
        {
          params: {
            key: this.apiKey,
            channelId: channelId,
            part: 'snippet,contentDetails',
            maxResults: 5
          },
          timeout: 10000
        }
      );

      // This is a basic check - YouTube's live detection is complex
      // and may require OAuth for full access
      return { isLive: false };
    } catch (error) {
      // Expected to fail without OAuth in many cases
      return { isLive: false };
    }
  }

  private async getVideoDetails(videoId: string): Promise<{
    viewerCount?: number;
  }> {
    try {
      const response = await axios.get<YouTubeVideoDetailsResponse>(
        `${this.baseURL}/videos`,
        {
          params: {
            key: this.apiKey,
            id: videoId,
            part: 'liveStreamingDetails,statistics'
          },
          timeout: 10000
        }
      );

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0];
        const concurrentViewers = video.liveStreamingDetails?.concurrentViewers;
        
        return {
          viewerCount: concurrentViewers ? parseInt(concurrentViewers) : undefined
        };
      }

      return {};
    } catch (error) {
      console.error('Error getting video details:', error);
      return {};
    }
  }

  async updateStreamerLiveStatus(channelIdentifier: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
    videoId?: string;
  }> {
    return this.checkLiveStatus(channelIdentifier);
  }

  isConfigured(): boolean {
    return !!(this.apiKey);
  }

  // Helper method to get channel info
  async getChannelInfo(channelIdentifier: string): Promise<{
    channelId?: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
  } | null> {
    try {
      if (!this.apiKey) {
        return null;
      }

      let channelId = channelIdentifier;
        if (!channelIdentifier.startsWith('UC')) {
        const resolvedChannelId = await this.getChannelIdFromUsername(channelIdentifier);
        if (!resolvedChannelId) {
          return null;
        }
        channelId = resolvedChannelId;
      }

      // Check cache first
      const cachedInfo = getCachedData(`channelInfo_${channelId}`);
      if (cachedInfo) {
        console.log('✅ Channel info retrieved from cache');
        return cachedInfo;
      }

      const response = await axios.get<YouTubeChannelResponse>(
        `${this.baseURL}/channels`,
        {
          params: {
            key: this.apiKey,
            id: channelId,
            part: 'snippet'
          },
          timeout: 10000
        }
      );

      if (response.data.items && response.data.items.length > 0) {
        const channel = response.data.items[0];
        const channelInfo = {
          channelId: channel.id,
          title: channel.snippet.title,
          description: channel.snippet.description,
          thumbnailUrl: channel.snippet.thumbnails?.high?.url ||
                       channel.snippet.thumbnails?.medium?.url ||
                       channel.snippet.thumbnails?.default?.url
        };

        // Cache the channel info
        setCachedData(`channelInfo_${channelId}`, channelInfo, CACHE_TTL.CHANNEL_INFO);

        return channelInfo;
      }

      return null;
    } catch (error) {
      console.error('Error getting channel info:', error);
      return null;
    }
  }
}

export default new YouTubeService();
