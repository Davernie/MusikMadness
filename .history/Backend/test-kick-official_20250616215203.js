const axios = require('axios');
require('dotenv').config();

async function testKickOfficialAPI() {
  console.log('🔄 Testing Kick Official API...\n');

  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  console.log(`Using Client ID: ${clientId}`);
  console.log(`Client Secret length: ${clientSecret ? clientSecret.length : 0} characters\n`);

  if (!clientId || !clientSecret) {
    console.log('❌ Kick API credentials not found');
    return;
  }

  try {
    // Step 1: Get access token
    console.log('📋 Step 1: Getting access token...');

    const tokenResponse = await axios.post(
      'https://id.kick.com/oauth/token',
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, token_type, expires_in } = tokenResponse.data;
    console.log('✅ Access token obtained successfully');
    console.log(`Token type: ${token_type}`);
    console.log(`Expires in: ${expires_in} seconds\n`);

    // Step 2: Test channels endpoint for Asmongold
    console.log('📋 Step 2: Testing Asmongold specifically...');
    
    try {
      console.log('🔍 Checking asmongold via channels endpoint...');
      
      const channelResponse = await axios.get(
        'https://api.kick.com/public/v1/channels?slug=asmongold',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json'
          }
        }
      );

      console.log('Raw response:', JSON.stringify(channelResponse.data, null, 2));

      const channels = channelResponse.data.data;
      if (channels && channels.length > 0) {
        const channel = channels[0];
        console.log(`✅ Asmongold channel found!`);
        console.log(`  📺 Channel: ${channel.slug}`);
        console.log(`  📺 Stream title: ${channel.stream_title || 'No title'}`);
        console.log(`  🔴 Is live: ${channel.stream?.is_live || false}`);
        console.log(`  👥 Viewers: ${channel.stream?.viewer_count || 0}`);
        console.log(`  🖼️ Thumbnail: ${channel.stream?.thumbnail || 'None'}`);
        
        if (channel.stream?.is_live) {
          console.log('🎉 ASMONGOLD IS LIVE ON KICK!');
        } else {
          console.log('💤 Asmongold is currently offline');
        }
      } else {
        console.log('❌ Asmongold channel not found in channels endpoint');
      }
    } catch (channelError) {
      console.log('❌ Channels endpoint error:', channelError.response?.data || channelError.message);
    }

    // Step 3: Check livestreams endpoint for any live Kick streams
    console.log('\n📋 Step 3: Checking current live streams...');
    try {
      const livestreamResponse = await axios.get(
        'https://api.kick.com/public/v1/livestreams?limit=10',
        {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json'
          }
        }
      );

      const livestreams = livestreamResponse.data.data;
      console.log(`✅ Found ${livestreams.length} live streams on Kick:`);
      
      const asmongoldLive = livestreams.find(stream => stream.slug === 'asmongold');
      
      if (asmongoldLive) {
        console.log('🎉 ASMONGOLD FOUND IN LIVE STREAMS!');
        console.log(`  📺 Title: ${asmongoldLive.stream_title}`);
        console.log(`  👥 Viewers: ${asmongoldLive.viewer_count}`);
        console.log(`  🎮 Category: ${asmongoldLive.category?.name || 'No category'}`);
      } else {
        console.log('💤 Asmongold not found in current live streams');
      }
      
      // Show all live streams for reference
      livestreams.forEach((stream, index) => {
        console.log(`  ${index + 1}. ${stream.slug} - "${stream.stream_title}"`);
        console.log(`     👥 ${stream.viewer_count} viewers | 🎮 ${stream.category?.name || 'No category'}`);
      });
    } catch (livestreamError) {
      console.log('❌ Error fetching livestreams:', livestreamError.response?.data || livestreamError.message);
    }

  } catch (error) {
    console.log('❌ Kick Official API Error:', error.response?.data || error.message);
  }
}

testKickOfficialAPI();
