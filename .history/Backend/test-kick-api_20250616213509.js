const axios = require('axios');

async function testAsmongold() {
  try {
    console.log('🔄 Testing Kick API for Asmongold...');
    
    // Try different endpoints and headers
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Referer': 'https://kick.com/',
      'Origin': 'https://kick.com',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };
    
    // Try v1 API first
    try {
      console.log('Testing v1 API for asmongold...');
      const response = await axios.get('https://kick.com/api/v1/channels/asmongold', {
        timeout: 15000,
        headers
      });
      
      console.log('✅ Got v1 API response for asmongold');
      const channel = response.data;
      console.log(`Channel: ${channel.slug || channel.username}`);
      console.log(`Is Live: ${channel.is_live}`);
      
      if (channel.is_live) {
        console.log('🔴 Asmongold IS LIVE ON KICK (v1)!');
        if (channel.livestream) {
          console.log(`Title: ${channel.livestream.session_title}`);
          console.log(`Viewers: ${channel.livestream.viewer_count}`);
        }
      } else {
        console.log('⚫ Asmongold is offline on Kick (v1)');
      }
      return;
    } catch (v1Error) {
      console.log('v1 API failed for asmongold, trying v2...');
    }
    
    // Try v2 API
    try {
      const response = await axios.get('https://kick.com/api/v2/channels/asmongold', {
        timeout: 15000,
        headers
      });
      
      const channel = response.data;
      console.log('✅ Got v2 API response for asmongold');
      console.log(`Channel: ${channel.slug}`);
      console.log(`Is Live: ${channel.is_live}`);
      
      if (channel.is_live && channel.livestream) {
        console.log('🔴 Asmongold IS LIVE ON KICK (v2)!');
        console.log(`Title: ${channel.livestream.session_title}`);
        console.log(`Viewers: ${channel.livestream.viewer_count}`);
      } else {
        console.log('⚫ Asmongold is offline on Kick (v2)');
      }
    } catch (v2Error) {
      console.log('❌ Both API endpoints failed');
      throw v2Error;
    }
    
  } catch (error) {
    console.error('❌ Error testing Kick API for asmongold:', error.response?.data || error.message);
    console.log('\n🔄 Trying alternative approach with basic channel check...');
    
    // Try a simpler approach - just check if we can access the channel page
    try {
      const response = await axios.get('https://kick.com/asmongold', {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = response.data;
      const isLive = html.includes('"is_live":true') || html.includes('class="live-badge"') || html.includes('LIVE');
      
      console.log(`✅ Page check: Asmongold is ${isLive ? 'LIVE' : 'offline'} (HTML scraping)`);
      
    } catch (htmlError) {
      console.error('❌ HTML scraping also failed:', htmlError.message);
    }
  }
}

testAsmongold();
