const path = require('path');
require('ts-node').register({
  project: path.resolve(__dirname, 'tsconfig.json')
});

const mongoose = require('mongoose');
require('dotenv').config();

async function testYouTubeStatusUpdate() {
  try {
    console.log('🔄 Testing YouTube status update...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import services after MongoDB connection
    const Streamer = require('./src/models/Streamer').default;
    const streamerStatusService = require('./src/services/streamerStatusService').default;

    // Find YouTube streamers
    const youtubeStreamers = await Streamer.find({ platform: 'youtube' });
    console.log(`📺 Found ${youtubeStreamers.length} YouTube streamers in database`);

    for (const streamer of youtubeStreamers) {
      console.log(`\n🔍 Testing ${streamer.name}:`);
      console.log(`  Channel Name: ${streamer.channelName}`);
      console.log(`  Channel ID: ${streamer.channelId}`);
      console.log(`  Current Status: ${streamer.isLive ? 'LIVE' : 'Offline'}`);
      
      console.log(`  🔄 Updating status...`);
      await streamerStatusService.updateStreamerStatus(streamer);
      
      // Get updated data
      const updated = await Streamer.findById(streamer._id);
      console.log(`  📊 New Status: ${updated.isLive ? '🔴 LIVE' : '⚫ Offline'}`);
      if (updated.isLive) {
        console.log(`  📺 Title: ${updated.streamTitle}`);
        console.log(`  👥 Viewers: ${updated.viewerCount}`);
      }
    }
    
    console.log('\n✅ YouTube status update test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testYouTubeStatusUpdate();
