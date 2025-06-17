import Streamer from '../models/Streamer';
import twitchService from './twitchService';
import kickService from './kickService';
import youtubeService from './youtubeService';
import ApiLimitsManager, { StreamerPriority } from './apiLimitsManager';

class StreamerStatusService {
  private apiLimitsManager: ApiLimitsManager;

  constructor() {
    this.apiLimitsManager = new ApiLimitsManager();
    
    // Set up event listeners for quota management
    this.apiLimitsManager.on('quotaExceeded', (data) => {
      console.warn(`⚠️ ${data.platform.toUpperCase()} API quota exceeded (${data.type})`);
    });
    
    this.apiLimitsManager.on('highUsage', (data) => {
      console.warn(`⚠️ ${data.platform.toUpperCase()} API usage at ${data.percent.toFixed(1)}%`);
    });
  }

  async initializeStreamersSchedule(): Promise<void> {
    try {
      const streamers = await Streamer.find({ isActive: true });
      console.log(`📅 Initializing API limits schedule for ${streamers.length} streamers...`);
      
      for (const streamer of streamers) {
        // Determine priority based on follower count, view count, or featured status
        let priority = StreamerPriority.MEDIUM;
        
        if (streamer.isFeatured || (streamer.viewerCount && streamer.viewerCount > 10000)) {
          priority = StreamerPriority.HIGH;
        } else if (streamer.viewerCount && streamer.viewerCount < 1000) {
          priority = StreamerPriority.LOW;
        }
        
        this.apiLimitsManager.initializeStreamer(
          streamer._id.toString(),
          streamer.platform as 'youtube' | 'twitch' | 'kick',
          priority
        );
      }
      
      console.log('✅ Streamers schedule initialized with API limits');
    } catch (error) {
      console.error('❌ Error initializing streamers schedule:', error);
    }
  }
    async updateAllStreamersStatus(): Promise<void> {
    try {
      console.log('🔄 Starting API-limits-aware streamer status update...');
      
      // Get streamers that should be checked based on API limits and schedules
      const streamersToCheck = this.apiLimitsManager.getStreamersToCheck();
      
      if (streamersToCheck.length === 0) {
        console.log('📊 No streamers ready for checking based on API limits');
        return;
      }
      
      console.log(`📊 Checking ${streamersToCheck.length} streamers within API limits`);
      
      // Get full streamer documents
      const streamerIds = streamersToCheck.map(s => s.streamerId);
      const streamers = await Streamer.find({ _id: { $in: streamerIds }, isActive: true });
      
      let successCount = 0;
      let errorCount = 0;
      let skippedCount = 0;
      
      for (const streamer of streamers) {
        const checkInfo = streamersToCheck.find(s => s.streamerId === streamer._id.toString());
        if (!checkInfo) continue;
        
        try {
          const success = await this.updateStreamerStatusWithLimits(streamer, checkInfo);
          if (success) {
            successCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to update ${streamer.name}:`, error);
          this.apiLimitsManager.recordStreamerCheck(streamer._id.toString(), false);
        }
      }
      
      console.log(`✅ Streamer status update completed: ${successCount} successful, ${errorCount} failed, ${skippedCount} skipped`);
      
      // Log API usage statistics
      const stats = this.apiLimitsManager.getUsageStatistics();
      console.log(`📊 API Usage - YouTube: ${stats.youtube.utilizationPercent.toFixed(1)}%, Twitch: ${stats.twitch.utilizationPercent.toFixed(1)}%, Kick: ${stats.kick.utilizationPercent.toFixed(1)}%`);
      
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
