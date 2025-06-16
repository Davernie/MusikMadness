const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testShroud() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    console.log('❌ Twitch credentials not found in .env file');
    return;
  }
  
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
    
    // Check Shroud's live status
    console.log('🔄 Checking Shroud live status...');
    const streamResponse = await axios.get(
      'https://api.twitch.tv/helix/streams?user_login=shroud',
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
      console.log('🔴 Shroud IS LIVE!');
      console.log(`Title: ${stream.title}`);
      console.log(`Viewers: ${stream.viewer_count}`);
      console.log(`Game: ${stream.game_name}`);
    } else {
      console.log('⚫ Shroud is offline');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testShroud();
