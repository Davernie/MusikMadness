import Streamer from '../models/Streamer';
import twitchService from './twitchService';
import kickService from './kickService';
import youtubeService from './youtubeService';

// YouTube quota management
let youtubeQuotaExceeded = false;
let youtubeLastChecked = 0;
const YOUTUBE_CHECK_INTERVAL = 10 * 60 * 1000; // Check YouTube only every 10 minutes
const YOUTUBE_QUOTA_RESET_INTERVAL = 24 * 60 * 60 * 1000; // Reset flag after 24 hours

class StreamerStatusService {
  
  async updateAllStreamersStatus(): Promise<void> {
    try {
      console.log('🔄 Starting streamer status update...');
      
      // Get all active streamers
      const streamers = await Streamer.find({ isActive: true });
      console.log(`📊 Found ${streamers.length} active streamers to check`);
      
      const updatePromises = streamers.map(streamer => this.updateStreamerStatus(streamer));
      const results = await Promise.allSettled(updatePromises);
      
      let successCount = 0;
      let errorCount = 0;
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Failed to update ${streamers[index].name}:`, result.reason);
        }
      });
      
      console.log(`✅ Streamer status update completed: ${successCount} successful, ${errorCount} failed`);
    } catch (error) {
      console.error('❌ Error during streamer status update:', error);
    }
  }
  async updateStreamerStatus(streamer: any): Promise<void> {
    try {
      let updateData: any = {};
      
      if (streamer.platform === 'twitch') {
        if (!twitchService.isConfigured()) {
          console.warn(`⚠️ Skipping ${streamer.name} - Twitch API not configured`);
          return;
        }
        
        const statusData = await twitchService.updateStreamerLiveStatus(streamer.channelName);
        
        updateData = {
          isLive: statusData.isLive,
          lastStatusCheck: new Date()
        };
        
        if (statusData.isLive) {
          updateData.streamTitle = statusData.streamTitle;
          updateData.viewerCount = statusData.viewerCount;
          updateData.thumbnailUrl = statusData.thumbnailUrl;
          updateData.gameCategory = statusData.gameCategory;
          updateData.lastLiveAt = new Date();
        } else {
          // Clear live stream data when offline
          updateData.streamTitle = undefined;
          updateData.viewerCount = undefined;
          updateData.thumbnailUrl = undefined;
          updateData.gameCategory = undefined;
        }
        
        console.log(`${statusData.isLive ? '🔴' : '⚫'} TWITCH   ${streamer.channelName}: ${statusData.isLive ? 'LIVE' : 'Offline'}${statusData.streamTitle ? ` - "${statusData.streamTitle}"` : ''}${statusData.viewerCount ? ` (${statusData.viewerCount} viewers)` : ''}`);
          } else if (streamer.platform === 'kick') {
        const statusData = await kickService.updateStreamerLiveStatus(streamer.channelName);
        
        updateData = {
          isLive: statusData.isLive,
          lastStatusCheck: new Date()
        };
        
        if (statusData.isLive) {
          updateData.streamTitle = statusData.streamTitle;
          updateData.viewerCount = statusData.viewerCount;
          updateData.thumbnailUrl = statusData.thumbnailUrl;
          updateData.lastLiveAt = new Date();
        } else {
          // Don't clear live stream data for Kick since API might be blocked
          // Only clear if we have a definitive offline status
        }
          console.log(`${statusData.isLive ? '🔴' : '⚫'} KICK     ${streamer.channelName}: ${statusData.isLive ? 'LIVE' : 'API Check (may be blocked)'}${statusData.streamTitle ? ` - "${statusData.streamTitle}"` : ''}${statusData.viewerCount ? ` (${statusData.viewerCount} viewers)` : ''}`);
          } else if (streamer.platform === 'youtube') {
        if (!youtubeService.isConfigured()) {
          console.warn(`⚠️ Skipping ${streamer.name} - YouTube API not configured`);
          updateData = { lastStatusCheck: new Date() };
        } else {
          // Use channelId for YouTube, fallback to channelName if channelId not available
          const channelIdentifier = streamer.channelId || streamer.channelName;
          const statusData = await youtubeService.updateStreamerLiveStatus(channelIdentifier);
          
          updateData = {
            isLive: statusData.isLive,
            lastStatusCheck: new Date()
          };
          
          if (statusData.isLive) {
            updateData.streamTitle = statusData.streamTitle;
            updateData.viewerCount = statusData.viewerCount;
            updateData.thumbnailUrl = statusData.thumbnailUrl;
            updateData.lastLiveAt = new Date();
          } else {
            // Clear live stream data when offline
            updateData.streamTitle = undefined;
            updateData.viewerCount = undefined;
            updateData.thumbnailUrl = undefined;
          }
            console.log(`${statusData.isLive ? '🔴' : '⚫'} YOUTUBE  ${streamer.name}: ${statusData.isLive ? 'LIVE' : 'Offline'}${statusData.streamTitle ? ` - "${statusData.streamTitle}"` : ''}${statusData.viewerCount ? ` (${statusData.viewerCount} viewers)` : ''}`);
        }
      } else {
        // For non-supported platforms, just update the last check time
        updateData = {
          lastStatusCheck: new Date()
        };
        console.log(`ℹ️ ${streamer.platform.toUpperCase().padEnd(7)} ${streamer.channelName}: Status check not supported yet`);
      }
      
      await Streamer.findByIdAndUpdate(streamer._id, updateData);
    } catch (error) {
      console.error(`❌ Error updating ${streamer.name}:`, error);
      throw error;
    }
  }

  async updateSingleStreamer(streamerId: string): Promise<void> {
    try {
      const streamer = await Streamer.findById(streamerId);
      if (!streamer) {
        throw new Error('Streamer not found');
      }
      
      await this.updateStreamerStatus(streamer);
      console.log(`✅ Updated status for ${streamer.name}`);
    } catch (error) {
      console.error(`❌ Error updating streamer ${streamerId}:`, error);
      throw error;
    }
  }  // Start periodic updates (every 2 minutes)
  startPeriodicUpdates(): void {
    console.log('🚀 Starting periodic streamer status updates (every 2 minutes)');
    console.log('📡 Supported platforms: Twitch, Kick, YouTube');
    
    // Initial update
    this.updateAllStreamersStatus();
    
    // Set up interval (2 minutes = 120,000 ms)
    setInterval(() => {
      this.updateAllStreamersStatus();
    }, 120000);
  }
}

export default new StreamerStatusService();
