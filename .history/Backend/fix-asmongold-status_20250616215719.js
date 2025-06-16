const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Simple streamer schema (just for this test)
const streamerSchema = new mongoose.Schema({
  name: String,
  platform: String,
  channelName: String,
  isLive: Boolean,
  streamTitle: String,
  viewerCount: Number,
  thumbnailUrl: String,
  lastStatusCheck: Date,
  updatedAt: Date
});

const Streamer = mongoose.model('Streamer', streamerSchema);

// Kick service logic (copied from your service)
async function checkKickStatus(channelName) {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.log('⚠️ Kick API credentials not configured, trying fallback...');
    return { isLive: false };
  }

  try {
    console.log(`🔄 Checking Kick status for ${channelName} using official API...`);
    
    // Get access token
    const tokenResponse = await axios.post(
      'https://id.kick.com/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;
    
    // Get channel info by slug
    const channelResponse = await axios.get(
      `https://api.kick.com/public/v1/channels?slug=${channelName}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    const channels = channelResponse.data.data;
    if (channels && channels.length > 0) {
      const channel = channels[0];
      
      if (channel.stream?.is_live) {
        return {
          isLive: true,
          streamTitle: channel.stream_title || `${channelName} is live on Kick!`,
          viewerCount: channel.stream.viewer_count || 0,
          thumbnailUrl: channel.stream.thumbnail
        };
      }
    }

    return { isLive: false };

  } catch (error) {
    console.error(`❌ Error checking Kick status for ${channelName}:`, error.message);
    return { isLive: false };
  }
}

async function testAndUpdateAsmongold() {
  await connectDB();
  
  try {
    console.log('🔍 Testing Kick status for Asmongold...\n');
    
    // Test the Kick API
    const statusData = await checkKickStatus('asmongold');
    console.log('📋 Kick API result:');
    console.log(`  🔴 Is live: ${statusData.isLive}`);
    console.log(`  📺 Stream title: ${statusData.streamTitle || 'N/A'}`);
    console.log(`  👥 Viewers: ${statusData.viewerCount || 0}`);
    console.log(`  🖼️ Thumbnail: ${statusData.thumbnailUrl || 'None'}`);
    
    // Find Asmongold in database
    const asmongold = await Streamer.findOne({ channelName: 'asmongold' });
    
    if (!asmongold) {
      console.log('❌ Asmongold not found in database');
      return;
    }
    
    console.log('\n📋 Current database status:');
    console.log(`  🔴 Is live: ${asmongold.isLive}`);
    console.log(`  📺 Stream title: ${asmongold.streamTitle || 'N/A'}`);
    console.log(`  👥 Viewers: ${asmongold.viewerCount || 0}`);
    console.log(`  ⏰ Last check: ${asmongold.lastStatusCheck}`);
    
    // Update if different
    if (asmongold.isLive !== statusData.isLive || 
        (statusData.isLive && asmongold.streamTitle !== statusData.streamTitle)) {
      
      console.log('\n🔄 Updating database...');
      
      const updateData = {
        isLive: statusData.isLive,
        lastStatusCheck: new Date(),
        updatedAt: new Date()
      };
      
      if (statusData.isLive) {
        updateData.streamTitle = statusData.streamTitle;
        updateData.viewerCount = statusData.viewerCount;
        updateData.thumbnailUrl = statusData.thumbnailUrl;
      }
      
      await Streamer.findByIdAndUpdate(asmongold._id, updateData);
      
      console.log('✅ Database updated successfully!');
      console.log(`🎉 Asmongold is now showing as ${statusData.isLive ? 'LIVE' : 'OFFLINE'} in your database`);
      
    } else {
      console.log('\n✅ Database is already up to date');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAndUpdateAsmongold();
