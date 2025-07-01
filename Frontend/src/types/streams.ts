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
  userId?: string; // Reference to the actual user in the database
  user?: UserProfile; // Populated user data
  bio?: string;
  location?: string;
}

// User profile data for streamers
export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  genres?: string[];
  socials?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
    twitch?: string;
    kick?: string;
  };
  profilePicture?: {
    data: Buffer;
    contentType: string;
  };
  profilePictureUrl?: string; // Generated URL for display
}

// Backend streamer model interface
export interface Streamer {
  _id: string;
  name: string;
  platform: 'twitch' | 'youtube' | 'kick';
  channelName: string;
  channelId?: string;
  avatar: string;
  description?: string;
  userId?: string; // Reference to user
  user?: UserProfile; // Populated user data
  
  // Live status
  isLive: boolean;
  streamTitle?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
  gameCategory?: string;
  lastLiveAt?: string;
  lastStatusCheck?: string;
  
  // Management
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CuratedStreamer {
  userId: string; // Reference to actual user in database
  platform: 'twitch' | 'youtube' | 'kick';
  isLive: boolean; // manually set for now
  streamTitle?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
}

// For users that we want to feature as streamers
export interface StreamerUser {
  _id: string;
  username: string;
  profilePictureUrl?: string;
  bio?: string;
  location?: string;
  socials?: {
    soundcloud?: string;
    instagram?: string;
    twitter?: string;
    spotify?: string;
    youtube?: string;
    twitch?: string;
    kick?: string;
  };
  streaming?: {
    isStreamer: boolean;
    isLive: boolean;
    streamTitle: string;
    streamDescription: string;
    preferredPlatform: 'twitch' | 'youtube' | 'kick';
    viewerCount: number;
    thumbnailUrl: string;
    streamStartedAt?: string;
    lastStreamedAt?: string;
    streamingSchedule: string;
    streamCategories: string[];
  };
}

export interface StreamingStats {
  totalStreamers: number;
  liveStreamers: number;
  totalViewers: number;
  platformDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface UpdateStreamingSettingsData {
  isStreamer?: boolean;
  streamTitle?: string;
  streamDescription?: string;
  preferredPlatform?: 'twitch' | 'youtube' | 'kick';
  thumbnailUrl?: string;
  streamingSchedule?: string;
  streamCategories?: string[];
}

export interface UpdateLiveStatusData {
  isLive: boolean;
  streamTitle?: string;
  viewerCount?: number;
}

// Props for StreamCard component
export interface StreamCardProps {
  streamer: Streamer;
  onWatchHere: (streamer: Streamer) => void;
}