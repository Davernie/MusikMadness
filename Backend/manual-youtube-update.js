// Manual YouTube status update script - temporary solution for quota issues
const mongoose = require('mongoose');
require('dotenv').config();

// Known live YouTube channels (manually updated)
const liveYouTubeChannels = {
  'UCSJ4gkVC6NrvII8umztf0Ow': { // LoFi Girl
    isLive: true,
    streamTitle: 'synthwave radio 🌌 beats to chill/game to',
    viewerCount: 3000,
    thumbnailUrl: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault_live.jpg'
  },
  'UCLA_DiR1FfKNvjuUpBHmylQ': { // NASA
    isLive: true,
    streamTitle: 'Live Video from the International Space Station (Official NASA Stream)',
    viewerCount: 100,
    thumbnailUrl: 'https://i.ytimg.com/vi/DIgkvm2nmHc/hqdefault_live.jpg'
  }
};

async function updateYouTubeStreamersManually() {
  try {
    console.log('🔄 Manually updating YouTube streamers (quota workaround)...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Streamer = require('./dist/models/Streamer').default;

    // Find all YouTube streamers
    const youtubeStreamers = await Streamer.find({ platform: 'youtube' });
    console.log(`📺 Found ${youtubeStreamers.length} YouTube streamers`);

    for (const streamer of youtubeStreamers) {
      const channelId = streamer.channelId;
      const liveInfo = liveYouTubeChannels[channelId];
      
      if (liveInfo) {
        await Streamer.findByIdAndUpdate(streamer._id, {
          isLive: liveInfo.isLive,
          streamTitle: liveInfo.streamTitle,
          viewerCount: liveInfo.viewerCount,
          thumbnailUrl: liveInfo.thumbnailUrl,
          lastLiveAt: new Date(),
          lastStatusCheck: new Date()
        });
        
        console.log(`🔴 ${streamer.name}: Updated to LIVE`);
        console.log(`   📺 "${liveInfo.streamTitle}"`);
        console.log(`   👥 ${liveInfo.viewerCount} viewers`);
      } else {
        await Streamer.findByIdAndUpdate(streamer._id, {
          isLive: false,
          lastStatusCheck: new Date()
        });
        
        console.log(`⚫ ${streamer.name}: Set to offline (no manual data)`);
      }
      console.log('');
    }
    
    console.log('✅ Manual YouTube update completed!');
    console.log('\n💡 This is a temporary workaround for YouTube API quota limits.');
    console.log('📋 To fix permanently:');
    console.log('1. Wait for quota to reset (midnight Pacific Time)');
    console.log('2. Reduce YouTube API calls frequency');
    console.log('3. Use RSS feeds as backup for some channels');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateYouTubeStreamersManually();
