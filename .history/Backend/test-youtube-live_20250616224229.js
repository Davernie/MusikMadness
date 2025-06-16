const axios = require('axios');
require('dotenv').config();

async function testSpecificYouTubeChannel() {
  console.log('🔄 Testing specific YouTube channel live status...\n');

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') {
    console.log('❌ YouTube API key not configured');
    return;
  }

  // Test LoFi Girl - known to stream frequently
  const channelId = 'UCSJ4gkVC6NrvII8umztf0Ow';
  const channelName = 'LoFi Girl';

  try {
    console.log(`🔍 Checking live status for ${channelName}...`);
    
    // Search for live streams on this channel
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

    if (response.data.items && response.data.items.length > 0) {
      const liveStream = response.data.items[0];
      
      if (liveStream.snippet.liveBroadcastContent === 'live') {
        console.log(`🔴 ${channelName} IS LIVE!`);
        console.log(`📺 Title: ${liveStream.snippet.title}`);
        console.log(`🖼️ Thumbnail: ${liveStream.snippet.thumbnails?.medium?.url}`);
        console.log(`🆔 Video ID: ${liveStream.id.videoId}`);
        
        // Get viewer count
        try {
          const videoResponse = await axios.get(
            'https://www.googleapis.com/youtube/v3/videos',
            {
              params: {
                key: apiKey,
                id: liveStream.id.videoId,
                part: 'liveStreamingDetails,statistics'
              }
            }
          );
          
          if (videoResponse.data.items && videoResponse.data.items.length > 0) {
            const video = videoResponse.data.items[0];
            const viewers = video.liveStreamingDetails?.concurrentViewers;
            if (viewers) {
              console.log(`👥 Viewers: ${parseInt(viewers).toLocaleString()}`);
            }
          }
        } catch (error) {
          console.log('⚠️ Could not get viewer count');
        }
        
        return {
          isLive: true,
          streamTitle: liveStream.snippet.title,
          thumbnailUrl: liveStream.snippet.thumbnails?.medium?.url,
          videoId: liveStream.id.videoId
        };
      }
    }

    console.log(`⚫ ${channelName} is currently offline`);
    return { isLive: false };

  } catch (error) {
    console.error(`❌ Error checking ${channelName}:`, error.message);
    return { isLive: false };
  }
}

// Run the test
testSpecificYouTubeChannel().then(result => {
  console.log('\n📋 Test Result:', result);
  console.log('\n✅ YouTube API integration test completed!');
  console.log('📝 Note: YouTube live detection can be inconsistent due to API limitations.');
});
