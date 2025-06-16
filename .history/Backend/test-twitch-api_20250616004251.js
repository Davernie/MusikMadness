const axios = require('axios');

async function testTwitchAPI() {
  const clientId = 'YOUR_CLIENT_ID_HERE';
  const clientSecret = 'YOUR_CLIENT_SECRET_HERE';
  
  try {
    // Get access token
    console.log('🔄 Getting Twitch API token...');
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', 
      new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );
    
    const token = tokenResponse.data.access_token;
    console.log('✅ Got token successfully');
    
    // Check PirateSoftware's live status
    console.log('🔄 Checking PirateSoftware live status...');
    const streamResponse = await axios.get(
      'https://api.twitch.tv/helix/streams?user_login=piratesoftware',
      {
        headers: {
          'Client-ID': clientId,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const streams = streamResponse.data.data;
    if (streams.length > 0) {
      const stream = streams[0];
      console.log('🔴 PirateSoftware IS LIVE!');
      console.log(`Title: ${stream.title}`);
      console.log(`Viewers: ${stream.viewer_count}`);
      console.log(`Game: ${stream.game_name}`);
    } else {
      console.log('⚫ PirateSoftware is offline');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

console.log('Before running this test:');
console.log('1. Replace YOUR_CLIENT_ID_HERE with your actual Twitch Client ID');
console.log('2. Replace YOUR_CLIENT_SECRET_HERE with your actual Twitch Client Secret');
console.log('3. Then run: node test-twitch-api.js\n');

// Uncomment the line below after adding your credentials
// testTwitchAPI();
