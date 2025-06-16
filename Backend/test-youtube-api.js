const axios = require('axios');
require('dotenv').config();

async function testYouTubeAPI() {
  console.log('🔄 Testing YouTube Data API v3...\n');

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey || apiKey === 'YOUR_YOUTUBE_API_KEY') {
    console.log('❌ YouTube API key not configured');
    console.log('Please follow these steps to set up YouTube API:');
    console.log('');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing one');
    console.log('3. Enable "YouTube Data API v3"');
    console.log('4. Go to "Credentials" and create an API key');
    console.log('5. Add YOUTUBE_API_KEY=your_api_key to your .env file');
    console.log('');
    console.log('Note: YouTube live detection is complex and may require OAuth for some features.');
    return;
  }

  console.log(`Using API Key: ${apiKey.substring(0, 8)}...`);

  // Test channels to check
  const testChannels = [
    { name: 'LoFi Girl', channelId: 'UCSJ4gkVC6NrvII8umztf0Ow', username: 'ChilledCow' },
    { name: 'Mr Beast Gaming', channelId: 'UCIPPMRA040LQr5QPyJEbmXA', username: 'MrBeast6000' },
    { name: 'NASA', channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ', username: 'NASA' }
  ];

  for (const channel of testChannels) {
    console.log(`🔍 Testing ${channel.name}...`);
    
    try {
      // Step 1: Get channel info
      console.log(`  📋 Getting channel info for ${channel.channelId}...`);
      const channelResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/channels',
        {
          params: {
            key: apiKey,
            id: channel.channelId,
            part: 'snippet,statistics'
          }
        }
      );

      if (channelResponse.data.items && channelResponse.data.items.length > 0) {
        const channelData = channelResponse.data.items[0];
        console.log(`  ✅ Channel found: ${channelData.snippet.title}`);
        console.log(`  📊 Subscribers: ${parseInt(channelData.statistics.subscriberCount).toLocaleString()}`);
        console.log(`  📺 Videos: ${parseInt(channelData.statistics.videoCount).toLocaleString()}`);
      }

      // Step 2: Search for live streams
      console.log(`  🔍 Searching for live streams...`);
      const liveSearchResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            key: apiKey,
            channelId: channel.channelId,
            eventType: 'live',
            type: 'video',
            part: 'snippet',
            maxResults: 1
          }
        }
      );

      if (liveSearchResponse.data.items && liveSearchResponse.data.items.length > 0) {
        const liveStream = liveSearchResponse.data.items[0];
        console.log(`  🔴 LIVE STREAM FOUND!`);
        console.log(`  📺 Title: ${liveStream.snippet.title}`);
        console.log(`  🖼️ Thumbnail: ${liveStream.snippet.thumbnails?.medium?.url || 'None'}`);
        
        // Get viewer count
        try {
          const videoDetailsResponse = await axios.get(
            'https://www.googleapis.com/youtube/v3/videos',
            {
              params: {
                key: apiKey,
                id: liveStream.id.videoId,
                part: 'liveStreamingDetails,statistics'
              }
            }
          );

          if (videoDetailsResponse.data.items && videoDetailsResponse.data.items.length > 0) {
            const videoData = videoDetailsResponse.data.items[0];
            const viewers = videoData.liveStreamingDetails?.concurrentViewers;
            if (viewers) {
              console.log(`  👥 Viewers: ${parseInt(viewers).toLocaleString()}`);
            }
          }
        } catch (detailsError) {
          console.log(`  ⚠️ Could not get viewer count`);
        }
      } else {
        console.log(`  ⚫ No live streams found`);
      }

      // Step 3: Get recent videos to check for any live content
      console.log(`  📹 Checking recent videos...`);
      const recentVideosResponse = await axios.get(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            key: apiKey,
            channelId: channel.channelId,
            type: 'video',
            part: 'snippet',
            order: 'date',
            maxResults: 3
          }
        }
      );

      if (recentVideosResponse.data.items && recentVideosResponse.data.items.length > 0) {
        console.log(`  📹 Recent videos:`);
        recentVideosResponse.data.items.forEach((video, index) => {
          const isLive = video.snippet.liveBroadcastContent === 'live';
          const status = isLive ? '🔴 LIVE' : '📹 Video';
          console.log(`    ${index + 1}. ${status} - ${video.snippet.title.substring(0, 50)}...`);
        });
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error.response?.data?.error?.message || error.message}`);
      
      if (error.response?.status === 403) {
        console.log(`  🔒 API key might not have proper permissions or quota exceeded`);
      } else if (error.response?.status === 400) {
        console.log(`  ⚠️ Bad request - check API parameters`);
      }
    }
    
    console.log('');
  }

  console.log('📋 YouTube API Test Summary:');
  console.log('- YouTube live detection is complex and may not always work reliably');
  console.log('- Some channels may not show as live even when streaming');
  console.log('- The API has quotas - be mindful of usage limits');
  console.log('- For better live detection, consider using channel RSS feeds as backup');
}

async function testYouTubeService() {
  console.log('\n🔄 Testing YouTubeService integration...\n');

  try {
    // Import the actual service (would need to be compiled TypeScript)
    console.log('📝 Note: To test the actual YouTubeService, run this from a TypeScript environment');
    console.log('Example usage:');
    console.log('  const result = await youtubeService.checkLiveStatus("UCSJ4gkVC6NrvII8umztf0Ow");');
    console.log('  console.log(result.isLive);');
    
  } catch (error) {
    console.log('❌ YouTubeService test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 YouTube API Test Suite\n');
  console.log('This script tests the YouTube Data API v3 for live stream detection\n');

  await testYouTubeAPI();
  await testYouTubeService();

  console.log('\n📋 Setup Instructions:');
  console.log('1. Get YouTube API key from Google Cloud Console');
  console.log('2. Add YOUTUBE_API_KEY to your .env file');
  console.log('3. Enable YouTube Data API v3 in your Google Cloud project');
  console.log('4. Update your streamers database with real YouTube channel IDs');
  console.log('\nYouTube live detection notes:');
  console.log('- Not all channels support live streaming');
  console.log('- Live detection may have delays');
  console.log('- API quotas apply - use efficiently');
}

main().catch(console.error);
