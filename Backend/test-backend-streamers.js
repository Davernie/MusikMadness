const axios = require('axios');

async function testBackendStreamers() {
  try {
    console.log('🔄 Testing backend streamers endpoint...');
    
    // Test getting all streamers
    const response = await axios.get('http://localhost:5000/api/streamers');
    console.log('✅ Streamers endpoint response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Find Asmongold
    const streamers = response.data.data || response.data;
    const asmongold = streamers.find(s => s.channelName === 'asmongold');
    
    if (asmongold) {
      console.log('\n📋 Asmongold status in database:');
      console.log(`  🔴 Is live: ${asmongold.isLive}`);
      console.log(`  📺 Stream title: ${asmongold.streamTitle || 'No title'}`);
      console.log(`  👥 Viewers: ${asmongold.viewerCount || 0}`);
      console.log(`  ⏰ Last updated: ${asmongold.lastUpdated}`);
      
      if (!asmongold.isLive) {
        console.log('\n🔄 Asmongold shows as offline in database but is live on Kick!');
        console.log('The live status checking service might not be running or updating.');
      }
    } else {
      console.log('\n❌ Asmongold not found in streamers database');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend server is not running on http://localhost:5000');
      console.log('Please start your backend with: npm start');
    } else {
      console.log('❌ Error testing backend:', error.message);
    }
  }
}

async function testLiveStatusUpdate() {
  try {
    console.log('\n🔄 Testing live status update endpoint...');
    
    const response = await axios.put('http://localhost:5000/api/streamers/live-status', {
      channelName: 'asmongold',
      isLive: true,
      streamTitle: '[DROPS ON] BIG DAY HUGE DRAMA WW3+MORE NEWS/GAMES MULTISTREAMING BIG NEWS+GAMES+REACTS',
      viewerCount: 13490
    });
    
    console.log('✅ Live status update response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error updating live status:', error.response?.data || error.message);
  }
}

async function main() {
  await testBackendStreamers();
  await testLiveStatusUpdate();
  
  // Test again to see if it updated
  console.log('\n🔄 Testing streamers endpoint again after update...');
  await testBackendStreamers();
}

main();
