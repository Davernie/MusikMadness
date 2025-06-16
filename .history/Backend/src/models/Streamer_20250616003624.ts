import mongoose, { Document, Schema } from 'mongoose';

export interface IStreamer extends Document {
  name: string;
  platform: 'twitch' | 'youtube' | 'kick';
  channelName: string;
  channelId?: string; // for YouTube
  avatar: string;
  description?: string;
    // Live status (updated by API or manually)
  isLive: boolean;
  streamTitle?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
  gameCategory?: string; // current game/category being streamed
  lastLiveAt?: Date;
  lastStatusCheck?: Date; // when we last checked the live status
  
  // Management
  isActive: boolean; // enable/disable without deleting
  isFeatured: boolean; // highlight certain streamers
  sortOrder: number; // custom ordering
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const StreamerSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['twitch', 'youtube', 'kick']
  },
  channelName: {
    type: String,
    required: true,
    trim: true
  },
  channelId: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isLive: {
    type: Boolean,
    default: false
  },
  streamTitle: {
    type: String,
    trim: true
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  thumbnailUrl: {
    type: String
  },
  lastLiveAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
StreamerSchema.index({ isActive: 1, sortOrder: 1 });
StreamerSchema.index({ isLive: 1, isActive: 1 });
StreamerSchema.index({ platform: 1, isActive: 1 });

export default mongoose.model<IStreamer>('Streamer', StreamerSchema);
