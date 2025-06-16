const axios = require('axios');

async function testKickAPI() {
  try {
    console.log('🔄 Testing Kick API...');
    
    const response = await axios.get('https://kick.com/api/v2/channels/xqc', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://kick.com/'
      }
    });
    
    const channel = response.data;
    console.log('✅ Got Kick API response');
    console.log(`Channel: ${channel.slug}`);
    console.log(`Is Live: ${channel.is_live}`);
    
    if (channel.is_live && channel.livestream) {
      console.log('🔴 xQc IS LIVE ON KICK!');
      console.log(`Title: ${channel.livestream.session_title}`);
      console.log(`Viewers: ${channel.livestream.viewer_count}`);
    } else {
      console.log('⚫ xQc is offline on Kick');
    }
    
  } catch (error) {
    console.error('❌ Error testing Kick API:', error.response?.data || error.message);
  }
}

testKickAPI();
