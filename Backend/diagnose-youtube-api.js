const axios = require('axios');
require('dotenv').config();

async function diagnoseYouTubeAPI() {
  console.log('🔍 Diagnosing YouTube API Issues...\n');

  const apiKey = process.env.YOUTUBE_API_KEY;
  console.log(`API Key: ${apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET'}`);

  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') {
    console.log('❌ YouTube API key not properly configured');
    return;
  }

  // Test 1: Basic API key validation
  try {
    console.log('📋 Test 1: Basic API key validation...');
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: {
          key: apiKey,
          id: 'UCSJ4gkVC6NrvII8umztf0Ow', // LoFi Girl
          part: 'snippet'
        },
        timeout: 10000
      }
    );

    if (response.status === 200) {
      console.log('✅ API key is valid and working');
      console.log(`📺 Channel found: ${response.data.items[0]?.snippet?.title}`);
    }
  } catch (error) {
    console.log('❌ API key validation failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.error?.message}`);
    
    if (error.response?.status === 403) {
      console.log('\n🔧 Possible solutions:');
      console.log('1. Check if YouTube Data API v3 is enabled in Google Cloud Console');
      console.log('2. Verify API key restrictions (IP/HTTP referrer)');
      console.log('3. Check quota usage - you might have exceeded daily limits');
      console.log('4. Make sure the API key has permission for YouTube Data API v3');
    }
    return;
  }

  // Test 2: Live stream detection
  try {
    console.log('\n📋 Test 2: Live stream detection...');
    const liveResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          key: apiKey,
          channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
          eventType: 'live',
          type: 'video',
          part: 'snippet',
          maxResults: 1
        },
        timeout: 10000
      }
    );

    console.log(`📊 Live search results: ${liveResponse.data.items?.length || 0}`);
    
    if (liveResponse.data.items && liveResponse.data.items.length > 0) {
      const stream = liveResponse.data.items[0];
      console.log(`🔴 Live stream found: ${stream.snippet.title}`);
      console.log(`📹 Status: ${stream.snippet.liveBroadcastContent}`);
    } else {
      console.log('⚫ No live streams found (this might be normal)');
    }

  } catch (error) {
    console.log('❌ Live stream detection failed:');
    console.log(`Status: ${error.response?.status}`);
    console.log(`Error: ${error.response?.data?.error?.message}`);
  }

  // Test 3: Check quota usage info
  console.log('\n📊 Quota Information:');
  console.log('- Daily quota: 10,000 units');
  console.log('- Live search: ~100 units per request');
  console.log('- Channel info: ~1 unit per request');
  console.log('- Video details: ~1 unit per request');
  console.log('\n💡 If hitting quota limits, consider:');
  console.log('- Reducing check frequency');
  console.log('- Caching results longer');
  console.log('- Using fewer YouTube streamers');
}

diagnoseYouTubeAPI().catch(console.error);
