import axios from 'axios';

interface KickChannel {
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

class KickService {
  private baseURL = 'https://kick.com/api/v2';

  async checkLiveStatus(channelName: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
  }> {
    try {
      console.log(`🔄 Checking Kick status for ${channelName}...`);
      
      // Try multiple approaches
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
      };

      // Try v1 API first
      try {
        const response = await axios.get<KickChannel>(
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
        // Try v2 API
        const response = await axios.get<KickChannel>(
          `${this.baseURL}/channels/${channelName}`,
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
