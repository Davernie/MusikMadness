require('dotenv').config();
const mongoose = require('mongoose');

async function testUserLinkedStreamers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness');
    console.log('✅ Connected to database');
    
    // Import models
    const Streamer = require('./src/models/Streamer').default;
    
    console.log('📺 Testing streamers with user population...\n');
    
    // Test the same query that the API will use
    const streamers = await Streamer.find({ isActive: true })
      .populate('userId', 'username email bio location website genres socials.instagram socials.twitter socials.youtube socials.spotify socials.soundcloud profilePicture')
      .sort({ isFeatured: -1, isLive: -1, sortOrder: 1, name: 1 })
      .lean();
    
    console.log(`Found ${streamers.length} active streamers:\n`);
    
    streamers.forEach(streamer => {
      console.log(`🎬 ${streamer.name} (${streamer.platform})`);
      console.log(`   Channel: ${streamer.channelName}`);
      console.log(`   Status: ${streamer.isLive ? '🔴 LIVE' : '⚫ Offline'}`);
      
      if (streamer.userId) {
        console.log(`   👤 Linked User: ${streamer.userId.username}`);
        if (streamer.userId.bio) {
          console.log(`      Bio: ${streamer.userId.bio.substring(0, 100)}${streamer.userId.bio.length > 100 ? '...' : ''}`);
        }
        if (streamer.userId.location) {
          console.log(`      Location: ${streamer.userId.location}`);
        }
        if (streamer.userId.genres && streamer.userId.genres.length > 0) {
          console.log(`      Genres: ${streamer.userId.genres.join(', ')}`);
        }
        
        // Check socials
        const socials = [];
        if (streamer.userId.socials) {
          Object.entries(streamer.userId.socials).forEach(([platform, handle]) => {
            if (handle) socials.push(`${platform}: ${handle}`);
          });
        }
        if (socials.length > 0) {
          console.log(`      Socials: ${socials.join(', ')}`);
        }
      } else {
        console.log(`   ❌ No linked user`);
      }
      console.log('');
    });
    
    // Test the data structure that will be sent to frontend
    console.log('📊 Sample API Response Structure:');
    if (streamers.length > 0) {
      const sampleStreamer = streamers[0];
      console.log(JSON.stringify({
        success: true,
        streamers: [sampleStreamer],
        count: 1
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testUserLinkedStreamers();
