export interface StreamData {
  id: string;
  name: string;
  platform: 'twitch' | 'youtube' | 'kick';
  channelName: string;
  channelId?: string; // for YouTube
  avatar: string;
  isLive: boolean;
  streamTitle: string;
  viewerCount?: number;
  thumbnailUrl?: string;
  userId: string; // Reference to actual user in database
  bio?: string;
  location?: string;
}

export interface CuratedStreamer {
  id: string;
  name: string;
  platform: 'twitch' | 'youtube' | 'kick';
  channelName: string;
  channelId?: string; // for YouTube
  avatar: string;
  isLive: boolean; // manually set for now
  streamTitle: string;
  viewerCount?: number;
  thumbnailUrl?: string;
  userId: string; // Reference to actual user in database
  bio?: string;
  location?: string;
}

export interface StreamersResponse {
  success: boolean;
  streamers: StreamData[];
} 