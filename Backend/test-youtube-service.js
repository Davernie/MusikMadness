const path = require('path');
require('ts-node').register({
  project: path.resolve(__dirname, 'tsconfig.json')
});

const youtubeService = require('./src/services/youtubeService').default;

async function debugYouTubeService() {
  console.log('🔍 Debugging YouTube service integration...\n');

  // Test the exact channel ID from our database
  const testChannels = [
    { name: 'LoFi Girl', channelId: 'UCSJ4gkVC6NrvII8umztf0Ow' },
    { name: 'NASA', channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ' }
  ];

  console.log(`🔧 YouTube service configured: ${youtubeService.isConfigured()}`);
  console.log('');

  for (const channel of testChannels) {
    console.log(`🔍 Testing ${channel.name} (${channel.channelId})...`);
    
    try {
      // Test the actual method that the streamer service calls
      const result = await youtubeService.updateStreamerLiveStatus(channel.channelId);
      
      console.log(`📋 Result for ${channel.name}:`);
      console.log(`  isLive: ${result.isLive}`);
      console.log(`  streamTitle: ${result.streamTitle || 'N/A'}`);
      console.log(`  viewerCount: ${result.viewerCount || 'N/A'}`);
      console.log(`  thumbnailUrl: ${result.thumbnailUrl || 'N/A'}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Error testing ${channel.name}:`, error.message);
    }
  }
}

debugYouTubeService().catch(console.error);
