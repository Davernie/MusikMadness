const mongoose = require('mongoose');
const Streamer = require('./dist/models/Streamer').default;
require('dotenv').config();

console.log('Testing livestream status updates...');

async function testLiveUpdates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all streamers
    const streamers = await Streamer.find({}).sort({ platform: 1, sortOrder: 1 });
    
    console.log(`\n📺 Current Livestream Status:`);
    console.log('=====================================');
    
    for (const streamer of streamers) {
      const liveIcon = streamer.isLive ? '🔴' : '⭕';
      const viewerText = streamer.isLive ? `${streamer.viewerCount} viewers` : 'Offline';
      const platformIcon = {
        twitch: '💜',
        youtube: '🔴', 
        kick: '🟢'
      }[streamer.platform];
      
      console.log(`${platformIcon} ${liveIcon} ${streamer.name} (${streamer.platform})`);
      console.log(`   Channel: ${streamer.channelName}`);
      console.log(`   Status: ${viewerText}`);
      if (streamer.isLive) {
        console.log(`   Title: "${streamer.streamTitle}"`);
        console.log(`   Category: ${streamer.gameCategory}`);
      }
      if (streamer.lastLiveAt && !streamer.isLive) {
        const timeSince = Math.floor((Date.now() - streamer.lastLiveAt.getTime()) / (1000 * 60));
        console.log(`   Last live: ${timeSince} minutes ago`);
      }
      console.log(`   Featured: ${streamer.isFeatured ? 'Yes' : 'No'}`);
      console.log('');
    }
    
    // Summary stats
    const totalStreamers = streamers.length;
    const liveStreamers = streamers.filter(s => s.isLive).length;
    const totalViewers = streamers.reduce((sum, s) => sum + (s.viewerCount || 0), 0);
    const featuredStreamers = streamers.filter(s => s.isFeatured).length;
    
    console.log(`📊 Summary Statistics:`);
    console.log(`   Total Streamers: ${totalStreamers}`);
    console.log(`   Currently Live: ${liveStreamers}`);
    console.log(`   Total Viewers: ${totalViewers.toLocaleString()}`);
    console.log(`   Featured Streamers: ${featuredStreamers}`);
    
    // Platform breakdown
    const platformBreakdown = streamers.reduce((acc, s) => {
      if (!acc[s.platform]) acc[s.platform] = { total: 0, live: 0, viewers: 0 };
      acc[s.platform].total++;
      if (s.isLive) {
        acc[s.platform].live++;
        acc[s.platform].viewers += s.viewerCount || 0;
      }
      return acc;
    }, {});
    
    console.log(`\n🎯 Platform Breakdown:`);
    Object.entries(platformBreakdown).forEach(([platform, stats]) => {
      const icon = { twitch: '💜', youtube: '🔴', kick: '🟢' }[platform];
      console.log(`   ${icon} ${platform.toUpperCase()}: ${stats.live}/${stats.total} live (${stats.viewers.toLocaleString()} viewers)`);
    });
    
  } catch (error) {
    console.error('Error testing livestream status:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Test completed - Database connection closed');
  }
}

// Function to simulate live status changes
async function simulateLiveChanges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Simulating live status changes...');
    
    const streamers = await Streamer.find({});
    let changesCount = 0;
    
    for (const streamer of streamers) {
      // 30% chance to change status
      if (Math.random() < 0.3) {
        const wasLive = streamer.isLive;
        streamer.isLive = !streamer.isLive;
        
        if (streamer.isLive) {
          // Going live
          streamer.viewerCount = Math.floor(Math.random() * 3000) + 50;
          streamer.lastLiveAt = new Date();
          console.log(`🔴 ${streamer.name} went LIVE with ${streamer.viewerCount} viewers`);
        } else {
          // Going offline
          streamer.viewerCount = 0;
          console.log(`⭕ ${streamer.name} went OFFLINE`);
        }
        
        streamer.lastStatusCheck = new Date();
        await streamer.save();
        changesCount++;
      }
    }
    
    console.log(`\n✅ Simulation complete - ${changesCount} streamers changed status`);
    
  } catch (error) {
    console.error('Error simulating changes:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'simulate') {
    simulateLiveChanges();
  } else {
    testLiveUpdates();
  }
}

module.exports = { testLiveUpdates, simulateLiveChanges };
