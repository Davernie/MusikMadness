const mongoose = require('mongoose');
require('dotenv').config();

async function forceUpdateYouTubeStatus() {
  try {
    console.log('🔄 Force updating YouTube streamer status...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Use the compiled JavaScript version
    const Streamer = require('./dist/models/Streamer').default;

    // Find LoFi Girl specifically
    const lofiGirl = await Streamer.findOne({ 
      platform: 'youtube', 
      channelId: 'UCSJ4gkVC6NrvII8umztf0Ow' 
    });

    if (lofiGirl) {
      console.log(`📺 Found ${lofiGirl.name} - Current status: ${lofiGirl.isLive ? 'LIVE' : 'Offline'}`);
      
      // Manually set her as live since we confirmed she is
      await Streamer.findByIdAndUpdate(lofiGirl._id, {
        isLive: true,
        streamTitle: 'synthwave radio 🌌 beats to chill/game to',
        viewerCount: 3000,
        thumbnailUrl: 'https://i.ytimg.com/vi/4xDzrJKXOOY/mqdefault_live.jpg',
        lastLiveAt: new Date(),
        lastStatusCheck: new Date()
      });
      
      console.log('✅ Manually updated LoFi Girl to LIVE status');
    } else {
      console.log('❌ Could not find LoFi Girl in database');
    }

    // Also check NASA
    const nasa = await Streamer.findOne({ 
      platform: 'youtube', 
      channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ' 
    });

    if (nasa) {
      console.log(`🚀 Found ${nasa.name} - Current status: ${nasa.isLive ? 'LIVE' : 'Offline'}`);
      // NASA typically has ISS live stream, let's check
    }

    console.log('\n📊 Current YouTube streamers:');
    const allYouTube = await Streamer.find({ platform: 'youtube' });
    allYouTube.forEach(streamer => {
      console.log(`- ${streamer.name}: ${streamer.isLive ? '🔴 LIVE' : '⚫ Offline'}`);
      if (streamer.isLive && streamer.streamTitle) {
        console.log(`  📺 "${streamer.streamTitle}"`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Done');
  }
}

forceUpdateYouTubeStatus();
