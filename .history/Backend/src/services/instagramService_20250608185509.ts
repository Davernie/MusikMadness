import axios from 'axios';

export interface InstagramProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

export interface InstagramTokens {
  access_token: string;
  user_id: string;
}

export class InstagramService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID || '';
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET || '';
    this.redirectUri = process.env.INSTAGRAM_REDIRECT_URI || `${process.env.FRONTEND_URL}/settings?tab=profile`;
  }

  /**
   * Generate Instagram OAuth URL for user authorization
   */
  getAuthUrl(): string {
    const scope = 'user_profile,user_media';
    const state = Math.random().toString(36).substring(7); // Generate random state for security
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scope,
      response_type: 'code',
      state: state
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<InstagramTokens> {
    try {
      const response = await axios.post('https://api.instagram.com/oauth/access_token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code: code
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error exchanging Instagram code for token:', error);
      throw new Error('Failed to authenticate with Instagram');
    }
  }

  /**
   * Get long-lived access token from short-lived token
   */
  async getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      const response = await axios.get('https://graph.instagram.com/access_token', {
        params: {
          grant_type: 'ig_exchange_token',
          client_secret: this.clientSecret,
          access_token: shortLivedToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting long-lived Instagram token:', error);
      throw new Error('Failed to get long-lived Instagram token');
    }
  }

  /**
   * Get Instagram user profile
   */
  async getUserProfile(accessToken: string): Promise<InstagramProfile> {
    try {
      const response = await axios.get('https://graph.instagram.com/me', {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Instagram profile:', error);
      throw new Error('Failed to fetch Instagram profile');
    }
  }

  /**
   * Refresh Instagram access token
   */
  async refreshToken(accessToken: string): Promise<{ access_token: string; expires_in: number }> {
    try {
      const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing Instagram token:', error);
      throw new Error('Failed to refresh Instagram token');
    }
  }

  /**
   * Validate if Instagram token is still valid
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const instagramService = new InstagramService();
