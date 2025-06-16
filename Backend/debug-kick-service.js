// Import the actual services to test them directly
const axios = require('axios');

// Test the KickService directly
async function testKickServiceDirect() {
  console.log('🔄 Testing KickService directly...\n');
  
  try {
    // Import the TypeScript service (we need to run this through ts-node or compile first)
    // For now, let's simulate the service call manually
    
    const KICK_CLIENT_ID = '01JXX7YSRZ0QWXW8XRD6MY6ZKB';
    const KICK_CLIENT_SECRET = '1762d2c64c4cd7d4a30c79d58d79c5270fb93c56d697a876bdb5738e343c7282';
    
    // Get access token
    console.log('📋 Getting Kick access token...');
    const tokenResponse = await axios.post(
      'https://id.kick.com/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: KICK_CLIENT_ID,
        client_secret: KICK_CLIENT_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;
    console.log('✅ Access token obtained');

    // Check Asmongold status
    console.log('\n🔍 Checking Asmongold status...');
    const channelResponse = await axios.get(
      'https://api.kick.com/public/v1/channels?slug=asmongold',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        }
      }
    );

    const channels = channelResponse.data.data;
    if (channels && channels.length > 0) {
      const channel = channels[0];
      
      const result = {
        isLive: channel.stream?.is_live || false,
        streamTitle: channel.stream_title || `asmongold is live on Kick!`,
        viewerCount: channel.stream?.viewer_count || 0,
        thumbnailUrl: channel.stream?.thumbnail
      };
      
      console.log('📋 KickService result:');
      console.log(`  🔴 Is live: ${result.isLive}`);
      console.log(`  📺 Stream title: ${result.streamTitle}`);
      console.log(`  👥 Viewers: ${result.viewerCount}`);
      console.log(`  🖼️ Thumbnail: ${result.thumbnailUrl || 'None'}`);
      
      if (result.isLive) {
        console.log('\n🎉 SUCCESS: Asmongold is detected as LIVE via official Kick API!');
        
        // Now let's manually update the database
        console.log('\n🔄 Manually updating database...');
        try {
          const updateResponse = await axios.put('http://localhost:5000/api/streamers/live-status', {
            channelName: 'asmongold',
            isLive: result.isLive,
            streamTitle: result.streamTitle,
            viewerCount: result.viewerCount,
            thumbnailUrl: result.thumbnailUrl
          });
          console.log('✅ Database updated successfully');
        } catch (dbError) {
          // The endpoint might require authentication, let's try a different approach
          console.log('⚠️ Direct update failed, authentication required');
          console.log('🔧 You may need to trigger a manual status check from your backend');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testKickServiceDirect();
