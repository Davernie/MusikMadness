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

// New database-driven streamer types
export interface StreamerData {
  _id: string;
  name: string;
  platform: 'twitch' | 'youtube' | 'kick';
  channelName: string;
  channelId?: string;
  avatar: string;
  description?: string;
  isLive: boolean;
  streamTitle?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
  lastLiveAt?: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StreamModalProps {
  streamer: StreamerData | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface StreamCardProps {
  streamer: StreamerData;
  onWatchHere: (streamer: StreamerData) => void;
}

export type PlatformType = 'twitch' | 'youtube' | 'kick' | 'all';

export interface StreamersApiResponse {
  success: boolean;
  streamers: StreamerData[];
  count: number;
}

export interface StreamersResponse {
  success: boolean;
  streamers: StreamData[];
}