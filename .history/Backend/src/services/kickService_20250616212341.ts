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
      
      const response = await axios.get<KickChannel>(
        `${this.baseURL}/channels/${channelName}`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json',
            'Referer': 'https://kick.com/'
          }
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
    } catch (error: any) {
      console.error(`❌ Error checking Kick status for ${channelName}:`, error.message);
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
    // Kick API doesn't require credentials
    return true;
  }
}

export default new KickService();
