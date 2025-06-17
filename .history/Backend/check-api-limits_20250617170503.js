const axios = require('axios');
require('dotenv').config();

async function checkAPILimits() {
  console.log('🔍 Checking API limits and status for all platforms...\n');

  // Check Twitch API
  console.log('🎮 TWITCH API STATUS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await checkTwitchAPI();

  console.log('\n🦵 KICK API STATUS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await checkKickAPI();

  console.log('\n📺 YOUTUBE API STATUS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  await checkYouTubeAPI();

  console.log('\n📊 API LIMITS SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎮 Twitch: 800 requests/minute (no daily limit)');
  console.log('🦵 Kick: ~60-100 requests/hour (very restrictive)');
  console.log('📺 YouTube: 10,000 units/day (currently exceeded)');
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('• Twitch: ✅ Should work fine with current usage');
  console.log('• Kick: ⚠️ Reduce frequency, expect blocks');
  console.log('• YouTube: ❌ Wait for quota reset or implement caching');
}

async function checkTwitchAPI() {
  try {
    // Get access token first
    const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Access token obtained successfully');

    // Test API call
    const apiResponse = await axios.get('https://api.twitch.tv/helix/streams?user_login=shroud', {
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('✅ API call successful');
    console.log(`📊 Rate limit remaining: ${apiResponse.headers['ratelimit-remaining'] || 'Unknown'}`);
    console.log(`🔄 Rate limit reset: ${new Date(apiResponse.headers['ratelimit-reset'] * 1000).toLocaleTimeString() || 'Unknown'}`);
    console.log(`📋 Response status: ${apiResponse.status}`);

  } catch (error) {
    console.log('❌ Twitch API error:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('   🔧 Issue: Invalid credentials');
    } else if (error.response?.status === 429) {
      console.log('   🔧 Issue: Rate limit exceeded');
    }
  }
}

async function checkKickAPI() {
  try {
    // Get access token
    const tokenResponse = await axios.post('https://kick.com/api/v2/auth/login', {
      grant_type: 'client_credentials',
      client_id: process.env.KICK_CLIENT_ID,
      client_secret: process.env.KICK_CLIENT_SECRET
    });

    console.log('✅ Access token obtained successfully');

    // Test API call
    const apiResponse = await axios.get('https://kick.com/api/v2/channels/asmongold', {
      headers: {
        'Authorization': `Bearer ${tokenResponse.data.access_token}`,
        'User-Agent': 'MusikMadness/1.0'
      },
      timeout: 10000
    });

    console.log('✅ API call successful');
    console.log(`📋 Response status: ${apiResponse.status}`);
    console.log(`📊 Channel data received for: ${apiResponse.data.username}`);

  } catch (error) {
    console.log('❌ Kick API error:');
    console.log(`   Status: ${error.response?.status || 'Network Error'}`);
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    
    if (error.response?.status === 403) {
      console.log('   🔧 Issue: Forbidden - IP might be blocked');
    } else if (error.response?.status === 429) {
      console.log('   🔧 Issue: Rate limit exceeded');
    } else if (error.code === 'ECONNABORTED') {
      console.log('   🔧 Issue: Request timeout - server overloaded');
    }
  }
}

async function checkYouTubeAPI() {
  try {
    const apiResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        key: process.env.YOUTUBE_API_KEY,
        id: 'UCSJ4gkVC6NrvII8umztf0Ow',
        part: 'snippet'
      },
      timeout: 10000
    });

    console.log('✅ API call successful');
    console.log(`📋 Response status: ${apiResponse.status}`);
    console.log(`📺 Channel found: ${apiResponse.data.items[0]?.snippet?.title}`);

  } catch (error) {
    console.log('❌ YouTube API error:');
    console.log(`   Status: ${error.response?.status}`);
    console.log(`   Message: ${error.response?.data?.error?.message || error.message}`);
    
    if (error.response?.status === 403) {
      const errorMsg = error.response?.data?.error?.message || '';
      if (errorMsg.includes('quota')) {
        console.log('   🔧 Issue: Daily quota exceeded (10,000 units/day)');
        console.log('   ⏰ Quota resets: Midnight Pacific Time');
      } else {
        console.log('   🔧 Issue: API key restrictions or permissions');
      }
    } else if (error.response?.status === 400) {
      console.log('   🔧 Issue: Bad request - check API key');
    }
  }
}

checkAPILimits().catch(console.error);
