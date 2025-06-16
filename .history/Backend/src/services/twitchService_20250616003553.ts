import axios from 'axios';

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStreamData {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchStreamsResponse {
  data: TwitchStreamData[];
}

interface TwitchUserData {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

interface TwitchUsersResponse {
  data: TwitchUserData[];
}

class TwitchService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.clientId = process.env.TWITCH_CLIENT_ID || '';
    this.clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ Twitch API credentials not configured. Live status checking will be disabled.');
    }
  }

  private async getAccessToken(): Promise<string> {
    // Check if current token is still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 300000) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<TwitchTokenResponse>(
        'https://id.twitch.tv/oauth2/token',
        new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000);
      
      console.log('✅ Twitch API token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Twitch API token:', error);
      throw new Error('Failed to authenticate with Twitch API');
    }
  }

  private async makeApiRequest<T>(url: string): Promise<T> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Twitch API credentials not configured');
    }

    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get<T>(url, {
        headers: {
          'Client-ID': this.clientId,
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('❌ Twitch API request failed:', error);
      throw error;
    }
  }

  async getUserInfo(username: string): Promise<TwitchUserData | null> {
    try {
      const response = await this.makeApiRequest<TwitchUsersResponse>(
        `https://api.twitch.tv/helix/users?login=${username}`
      );
      
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error(`❌ Failed to get user info for ${username}:`, error);
      return null;
    }
  }

  async getStreamStatus(username: string): Promise<{
    isLive: boolean;
    streamData?: TwitchStreamData;
  }> {
    try {
      const response = await this.makeApiRequest<TwitchStreamsResponse>(
        `https://api.twitch.tv/helix/streams?user_login=${username}`
      );
      
      const streamData = response.data.length > 0 ? response.data[0] : null;
      
      return {
        isLive: !!streamData,
        streamData: streamData || undefined
      };
    } catch (error) {
      console.error(`❌ Failed to get stream status for ${username}:`, error);
      return { isLive: false };
    }
  }

  async updateStreamerLiveStatus(username: string): Promise<{
    isLive: boolean;
    streamTitle?: string;
    viewerCount?: number;
    thumbnailUrl?: string;
    gameCategory?: string;
  }> {
    const { isLive, streamData } = await this.getStreamStatus(username);
    
    if (isLive && streamData) {
      return {
        isLive: true,
        streamTitle: streamData.title,
        viewerCount: streamData.viewer_count,
        thumbnailUrl: streamData.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
        gameCategory: streamData.game_name
      };
    }
    
    return { isLive: false };
  }

  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

export default new TwitchService();
