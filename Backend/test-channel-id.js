const axios = require('axios');
require('dotenv').config();

async function testYouTubeChannelId() {
  console.log('🔄 Testing YouTube with Channel ID...\n');

  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = 'UCSJ4gkVC6NrvII8umztf0Ow'; // LoFi Girl

  try {
    console.log(`🔍 Checking live status for channel ID: ${channelId}...`);
    
    // Search for live streams on this channel using channel ID
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/search',
      {
        params: {
          key: apiKey,
          channelId: channelId,
          eventType: 'live',
          type: 'video',
          part: 'snippet',
          maxResults: 1
        },
        timeout: 10000
      }
    );

    console.log(`📊 API Response items count: ${response.data.items?.length || 0}`);

    if (response.data.items && response.data.items.length > 0) {
      const liveStream = response.data.items[0];
      
      console.log(`📺 Found stream: ${liveStream.snippet.title}`);
      console.log(`🔴 Live status: ${liveStream.snippet.liveBroadcastContent}`);
      
      if (liveStream.snippet.liveBroadcastContent === 'live') {
        console.log('✅ LoFi Girl IS LIVE via Channel ID!');
        return { isLive: true, title: liveStream.snippet.title };
      }
    }

    console.log('⚫ LoFi Girl appears offline via Channel ID');
    return { isLive: false };

  } catch (error) {
    console.error(`❌ Error checking with Channel ID:`, error.message);
    return { isLive: false };
  }
}

testYouTubeChannelId().then(result => {
  console.log('\n📋 Final Result:', result);
});
