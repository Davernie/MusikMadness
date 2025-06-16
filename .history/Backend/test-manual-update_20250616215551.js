const axios = require('axios');

async function testDirectKickStatusUpdate() {
  try {
    console.log('🔄 Testing direct Kick status update for Asmongold...');
    
    // Test the manual status update endpoint for Asmongold
    const updateResponse = await axios.put('http://localhost:5000/api/streamers/update-status/kick/asmongold');
    
    console.log('✅ Status update response:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    
    // Get streamers again to see if it updated
    console.log('\n🔄 Checking streamers after manual update...');
    const streamersResponse = await axios.get('http://localhost:5000/api/streamers');
    const streamers = streamersResponse.data.streamers;
    const asmongold = streamers.find(s => s.channelName === 'asmongold');
    
    if (asmongold) {
      console.log('\n📋 Asmongold status after update:');
      console.log(`  🔴 Is live: ${asmongold.isLive}`);
      console.log(`  📺 Stream title: ${asmongold.streamTitle || 'No title'}`);
      console.log(`  👥 Viewers: ${asmongold.viewerCount || 0}`);
      console.log(`  ⏰ Last updated: ${asmongold.updatedAt}`);
    }
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testDirectKickStatusUpdate();
