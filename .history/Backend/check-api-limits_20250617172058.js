const path = require('path');
require('ts-node').register({
  project: path.resolve(__dirname, 'tsconfig.json')
});

const ApiLimitsManager = require('./src/services/apiLimitsManager').default;
const { StreamerPriority } = require('./src/services/apiLimitsManager');

async function testApiLimitsManager() {
  console.log('🔍 Testing API Limits Manager for 24/7 Operation\n');

  const manager = new ApiLimitsManager();

  // Test streamer initialization
  console.log('📅 Testing streamer initialization...');
  
  // Simulate different types of streamers
  const testStreamers = [
    { id: 'lofi_girl', platform: 'youtube', priority: StreamerPriority.HIGH },
    { id: 'nasa', platform: 'youtube', priority: StreamerPriority.MEDIUM },
    { id: 'mrbeast', platform: 'youtube', priority: StreamerPriority.LOW },
    
    { id: 'shroud', platform: 'twitch', priority: StreamerPriority.HIGH },
    { id: 'ninja', platform: 'twitch', priority: StreamerPriority.MEDIUM },
    { id: 'pokimane', platform: 'twitch', priority: StreamerPriority.LOW },
    
    { id: 'asmongold', platform: 'kick', priority: StreamerPriority.HIGH },
    { id: 'xqc', platform: 'kick', priority: StreamerPriority.MEDIUM },
  ];

  // Initialize all streamers
  testStreamers.forEach(streamer => {
    manager.initializeStreamer(streamer.id, streamer.platform, streamer.priority);
  });

  console.log('\n📊 Initial Usage Statistics:');
  console.log(JSON.stringify(manager.getUsageStatistics(), null, 2));

  // Calculate check frequencies for different priorities
  console.log('\n📈 Check Frequencies by Platform and Priority:\n');
  
  const intervals = {
    youtube: { min: 20 * 60 * 1000, high: 1, medium: 2, low: 4 },
    twitch: { min: 3 * 60 * 1000, high: 1, medium: 2, low: 3 },
    kick: { min: 15 * 60 * 1000, high: 1, medium: 2, low: 4 }
  };
  
  Object.entries(intervals).forEach(([platform, config]) => {
    console.log(`${platform.toUpperCase()}:`);
    console.log(`  High Priority: Every ${(config.min * config.high) / 60000} minutes`);
    console.log(`  Medium Priority: Every ${(config.min * config.medium) / 60000} minutes`);
    console.log(`  Low Priority: Every ${(config.min * config.low) / 60000} minutes`);
    
    // Calculate daily checks per streamer
    const dailyMs = 24 * 60 * 60 * 1000;
    console.log(`  Daily checks per streamer:`);
    console.log(`    High: ${Math.floor(dailyMs / (config.min * config.high))} checks`);
    console.log(`    Medium: ${Math.floor(dailyMs / (config.min * config.medium))} checks`);
    console.log(`    Low: ${Math.floor(dailyMs / (config.min * config.low))} checks`);
    console.log('');
  });

  console.log('\n💡 Safe 24/7 Operation Summary:');
  console.log('✅ YouTube: 80 total API calls per day max (for all streamers combined)');
  console.log('✅ Twitch: 600 calls per minute max (plenty for real-time checking)');
  console.log('✅ Kick: 60 calls per hour max (requires careful scheduling)');
  
  console.log('\n� Production Recommendations:');
  console.log('1. Limit YouTube streamers to 3-4 high priority channels');
  console.log('2. Use 20+ minute intervals for YouTube to stay under quota');
  console.log('3. Twitch can handle many streamers with 3-5 minute intervals');
  console.log('4. Kick should be limited to 2-3 streamers max with 15+ minute intervals');  console.log('5. Implement priority system: Featured streamers checked more frequently');
  console.log('6. Cache results and use exponential backoff on errors');
}

async function checkAPILimits() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 API LIMITS CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎮 Twitch: 800 requests/minute (no daily limit)');
  console.log('🦵 Kick: ~60-100 requests/hour (very restrictive)');
  console.log('📺 YouTube: 10,000 units/day (currently exceeded)');
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('• Twitch: ✅ Should work fine with current usage');
  console.log('• Kick: ⚠️ Reduce frequency, expect blocks');
  console.log('• YouTube: ❌ Wait for quota reset or implement caching');
  
  console.log('\n🧪 Testing individual API endpoints...\n');
  
  console.log('🎮 TWITCH API:');
  await checkTwitchAPI();
  
  console.log('\n🦵 KICK API:');
  await checkKickAPI();
  
  console.log('\n📺 YOUTUBE API:');
  await checkYouTubeAPI();
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
