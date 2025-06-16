import Streamer from '../models/Streamer';
import twitchService from './twitchService';

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
        } else {
          // Clear live stream data when offline
          updateData.streamTitle = undefined;
          updateData.viewerCount = undefined;
          updateData.thumbnailUrl = undefined;
          updateData.gameCategory = undefined;
        }
        
        console.log(`${statusData.isLive ? '🔴' : '⚫'} ${streamer.name}: ${statusData.isLive ? 'LIVE' : 'Offline'}${statusData.streamTitle ? ` - "${statusData.streamTitle}"` : ''}`);
      } else {
        // For non-Twitch platforms, just update the last check time
        updateData = {
          lastStatusCheck: new Date()
        };
        console.log(`ℹ️ ${streamer.name} (${streamer.platform}): Status check not supported yet`);
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
  }

  // Start periodic updates (every 2 minutes)
  startPeriodicUpdates(): void {
    if (!twitchService.isConfigured()) {
      console.warn('⚠️ Twitch API not configured. Periodic updates disabled.');
      return;
    }
    
    console.log('🚀 Starting periodic streamer status updates (every 2 minutes)');
    
    // Initial update
    this.updateAllStreamersStatus();
    
    // Set up interval (2 minutes = 120,000 ms)
    setInterval(() => {
      this.updateAllStreamersStatus();
    }, 120000);
  }
}

export default new StreamerStatusService();
