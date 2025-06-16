import { API_BASE_URL } from '../config/api';
import { StreamerUser, StreamingStats, UpdateStreamingSettingsData, UpdateLiveStatusData } from '../types/streams';

const BASE_URL = `${API_BASE_URL}/streamers`;

export interface StreamersResponse {
  streamers: StreamerUser[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

class StreamingService {
  // Get authentication token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Get all streamers
  async getStreamers(page = 1, limit = 20, liveOnly = false): Promise<StreamersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(liveOnly && { liveOnly: 'true' })
    });
    
    const response = await fetch(`${BASE_URL}/streamers?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch streamers: ${response.statusText}`);
    }

    return response.json();
  }

  // Get live streamers only
  async getLiveStreamers(page = 1, limit = 20): Promise<StreamersResponse> {
    return this.getStreamers(page, limit, true);
  }

  // Get streaming statistics
  async getStreamingStats(): Promise<StreamingStats> {
    const response = await fetch(`${BASE_URL}/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch streaming stats: ${response.statusText}`);
    }

    return response.json();
  }

  // Update streaming settings (requires authentication)
  async updateStreamingSettings(data: UpdateStreamingSettingsData): Promise<{ message: string; user: StreamerUser }> {
    const response = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update streaming settings: ${response.statusText}`);
    }

    return response.json();
  }

  // Update live status (go live/offline)
  async updateLiveStatus(data: UpdateLiveStatusData): Promise<{ message: string; isLive: boolean; streamStartedAt?: string; lastStreamedAt?: string }> {
    const response = await fetch(`${BASE_URL}/live-status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update live status: ${response.statusText}`);
    }

    return response.json();
  }

  // Update viewer count
  async updateViewerCount(viewerCount: number): Promise<{ message: string; viewerCount: number; isLive: boolean }> {
    const response = await fetch(`${BASE_URL}/viewer-count`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ viewerCount })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update viewer count: ${response.statusText}`);
    }

    return response.json();
  }

  // Go live
  async goLive(streamTitle?: string, viewerCount?: number): Promise<{ message: string; isLive: boolean; streamStartedAt?: string }> {
    return this.updateLiveStatus({
      isLive: true,
      streamTitle,
      viewerCount
    });
  }

  // Go offline
  async goOffline(): Promise<{ message: string; isLive: boolean; lastStreamedAt?: string }> {
    return this.updateLiveStatus({
      isLive: false
    });
  }

  // Enable/disable streamer status
  async toggleStreamerStatus(isStreamer: boolean): Promise<{ message: string; user: StreamerUser }> {
    return this.updateStreamingSettings({ isStreamer });
  }

  // Set preferred platform
  async setPreferredPlatform(platform: 'twitch' | 'youtube' | 'kick'): Promise<{ message: string; user: StreamerUser }> {
    return this.updateStreamingSettings({ preferredPlatform: platform });
  }
}

export default new StreamingService(); 