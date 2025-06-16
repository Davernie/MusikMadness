import axios from 'axios';

// Official Kick API interfaces based on the documentation
interface KickApiChannel {
  broadcaster_user_id: number;
  slug: string;
  channel_description: string;
  stream_title: string;
  category?: {
    id: number;
    name: string;
    thumbnail: string;
  };
  stream?: {
    is_live: boolean;
    viewer_count: number;
    thumbnail: string;
    start_time: string;
  };
}

interface KickApiLivestream {
  broadcaster_user_id: number;
  channel_id: number;
  slug: string;
  stream_title: string;
  viewer_count: number;
  thumbnail: string;
  started_at: string;
  has_mature_content: boolean;
  language: string;
  category?: {
    id: number;
    name: string;
    thumbnail: string;
  };
}

interface KickApiResponse<T> {
  data: T;
  message?: string;
}

class KickService {
  private apiBaseURL = 'https://api.kick.com/public/v1';
  private oauthBaseURL = 'https://id.kick.com';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  private clientId = process.env.KICK_CLIENT_ID;
  private clientSecret = process.env.KICK_CLIENT_SECRET;

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Kick API credentials not configured. Set KICK_CLIENT_ID and KICK_CLIENT_SECRET');
    }

    try {
      console.log('🔄 Getting Kick API access token...');
      
      const response = await axios.post(
        `${this.oauthBaseURL}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const { access_token, expires_in } = response.data;
      this.accessToken = access_token;
      this.tokenExpiry = Date.now() + (expires_in * 1000) - 60000; // Refresh 1 minute early

      console.log('✅ Kick API access token obtained');
      return access_token;
    } catch (error: any) {
      console.error('❌ Failed to get Kick API access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async checkLiveStatus(channelName: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
  }> {
    try {
      console.log(`🔄 Checking Kick status for ${channelName} using official API...`);
      
      // Try official API first
      if (this.clientId && this.clientSecret) {
        try {
          const token = await this.getAccessToken();
          
          // Get channel info by slug
          const channelResponse = await axios.get<KickApiResponse<KickApiChannel[]>>(
            `${this.apiBaseURL}/channels?slug=${channelName}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              timeout: 10000
            }
          );

          const channels = channelResponse.data.data;
          if (channels && channels.length > 0) {
            const channel = channels[0];
            
            if (channel.stream?.is_live) {
              return {
                isLive: true,
                streamTitle: channel.stream_title || `${channelName} is live on Kick!`,
                viewerCount: channel.stream.viewer_count || 0,
                thumbnailUrl: channel.stream.thumbnail
              };
            }

            return { isLive: false };
          }

          // If channel not found in channels endpoint, try livestreams endpoint
          const livestreamResponse = await axios.get<KickApiResponse<KickApiLivestream[]>>(
            `${this.apiBaseURL}/livestreams?limit=100`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              },
              timeout: 10000
            }
          );

          const livestreams = livestreamResponse.data.data;
          const liveStream = livestreams?.find(stream => stream.slug === channelName);
          
          if (liveStream) {
            return {
              isLive: true,
              streamTitle: liveStream.stream_title || `${channelName} is live on Kick!`,
              viewerCount: liveStream.viewer_count || 0,
              thumbnailUrl: liveStream.thumbnail
            };
          }

          return { isLive: false };

        } catch (apiError: any) {
          console.warn(`⚠️ Official Kick API failed for ${channelName}:`, apiError.response?.data || apiError.message);
          // Fall back to unofficial API
        }
      }

      // Fallback to unofficial API (same as before)
      console.log(`🔄 Falling back to unofficial API for ${channelName}...`);
      
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://kick.com/',
        'Origin': 'https://kick.com',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      };      // Try v1 API first
      try {
        interface LegacyKickChannel {
          id: number;
          slug: string;
          is_live: boolean;
          livestream?: {
            session_title: string;
            viewer_count: number;
            thumbnail: {
              url: string;
            };
          };
        }

        const response = await axios.get<LegacyKickChannel>(
          `https://kick.com/api/v1/channels/${channelName}`,
          {
            timeout: 10000,
            headers
          }
        );

        const channel = response.data;
        
        if (channel.is_live) {
          return {
            isLive: true,
            streamTitle: channel.livestream?.session_title || `${channelName} is live on Kick!`,
            viewerCount: channel.livestream?.viewer_count || 0,
            thumbnailUrl: channel.livestream?.thumbnail?.url
          };
        }

        return { isLive: false };
      } catch (v1Error) {
        interface LegacyKickChannel {
          id: number;
          slug: string;
          is_live: boolean;
          livestream?: {
            session_title: string;
            viewer_count: number;
            thumbnail: {
              url: string;
            };
          };
        }

        // Try v2 API
        const response = await axios.get<LegacyKickChannel>(
          `https://kick.com/api/v2/channels/${channelName}`,
          {
            timeout: 10000,
            headers
          }
        );

        const channel = response.data;
        
        if (channel.is_live && channel.livestream) {
          return {
            isLive: true,
            streamTitle: channel.livestream.session_title,
            viewerCount: channel.livestream.viewer_count,
            thumbnailUrl: channel.livestream.thumbnail?.url
          };
        }

        return { isLive: false };
      }

    } catch (error: any) {
      // Check if it's a security block
      if (error.response?.data?.error?.includes('security policy')) {
        console.warn(`⚠️ Kick API blocked for ${channelName} - security policy. Use manual status updates.`);
      } else {
        console.error(`❌ Error checking Kick status for ${channelName}:`, error.message);
      }
      
      // Return offline status when API is blocked
      return { isLive: false };
    }
  }

  async updateStreamerLiveStatus(channelName: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
  }> {
    return this.checkLiveStatus(channelName);
  }

  isConfigured(): boolean {
    // Kick API doesn't require credentials, but may be blocked
    return true;
  }
}

export default new KickService();
