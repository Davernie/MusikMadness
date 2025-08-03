const mongoose = require('mongoose');
const User = require('./dist/models/User').default;
const Streamer = require('./dist/models/Streamer').default;
require('dotenv').config();

console.log('Starting livestream data population script...');

// Real streamers data for each platform
const realStreamers = {
  twitch: [
    {
      name: 'Monstercat',
      channelName: 'monstercat',
      avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/monstercat-profile_image-4d0c7d9bef3b8a2f-300x300.png',
      description: '24/7 music stream featuring electronic music, dubstep, and more',
      gameCategory: 'Music',
      isLive: true,
      streamTitle: '24/7 Electronic Music Stream',
      viewerCount: 2456,
      isFeatured: true,
      sortOrder: 1
    },
    {
      name: 'ChilledCow',
      channelName: 'chilledcow',
      avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/chilledcow-profile_image-b6f4d8e7c9a2b3f1-300x300.png',
      description: 'Lo-fi hip hop beats to relax/study to',
      gameCategory: 'Music',
      isLive: true,
      streamTitle: 'lofi hip hop radio - beats to relax/study to',
      viewerCount: 1823,
      isFeatured: true,
      sortOrder: 2
    },
    {
      name: 'NoCopyrightSounds',
      channelName: 'nocopyrightsounds',
      avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/nocopyrightsounds-profile_image-d7f8e9c5a1b4f2c3-300x300.png',
      description: 'Copyright free music for content creators',
      gameCategory: 'Music',
      isLive: false,
      streamTitle: 'NCS Music Stream - Copyright Free Electronic',
      viewerCount: 0,
      lastLiveAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      isFeatured: false,
      sortOrder: 3
    }
  ],
  youtube: [
    {
      name: 'Lofi Girl',
      channelName: 'LofiGirl',
      channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
      avatar: 'https://yt3.googleusercontent.com/2SRZD6dXA5K_XQaQO-f0tTrpKpfSzOKc_5A9-4JbzSwP9KnMTWg8NpjlHBxj-yKx3tVlRGM=s176-c-k-c0x00ffffff-no-rj',
      description: 'Providing beats to study/relax to 24/7',
      gameCategory: 'Music',
      isLive: true,
      streamTitle: 'lofi hip hop radio 📚 - beats to relax/study to',
      viewerCount: 28756,
      isFeatured: true,
      sortOrder: 1
    },
    {
      name: 'Trap Nation',
      channelName: 'TrapNation',
      channelId: 'UCa10nxShhzNrCE1o2ZOPztg',
      avatar: 'https://yt3.googleusercontent.com/Zl5vnyBH7g3EjNOg-k2Q6M_ZzHzLPbFr2-4XdNKBL_Q_UwA9QgWtKcCPc2s3ZqAh7g4=s176-c-k-c0x00ffffff-no-rj',
      description: 'The largest Trap music channel in the world',
      gameCategory: 'Music',
      isLive: false,
      streamTitle: 'Trap Music Mix 2024',
      viewerCount: 0,
      lastLiveAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isFeatured: true,
      sortOrder: 2
    },
    {
      name: 'Proximity',
      channelName: 'Proximity',
      channelId: 'UC3ifTl5zKiCAhHIBQYcaTeg',
      avatar: 'https://yt3.googleusercontent.com/ytc/AMLnZu-8HLgU3_C5k_5t8i7UqM6xHnJZBj2g2N4s7Q=s176-c-k-c0x00ffffff-no-rj',
      description: 'Your music is our passion.',
      gameCategory: 'Music',
      isLive: true,
      streamTitle: 'Best of Electronic Music 2024 Live Stream',
      viewerCount: 4521,
      isFeatured: false,
      sortOrder: 3
    }
  ],
  kick: [
    {
      name: 'MusicLive24',
      channelName: 'musiclive24',
      avatar: 'https://files.kick.com/images/user/12345/profile_image/conversion/musiclive24-medium.webp',
      description: '24/7 live music streaming on Kick',
      gameCategory: 'Music & Performing Arts',
      isLive: true,
      streamTitle: 'Electronic Music Marathon - 24/7',
      viewerCount: 892,
      isFeatured: true,
      sortOrder: 1
    },
    {
      name: 'BeatDropLive',
      channelName: 'beatdroplive',
      avatar: 'https://files.kick.com/images/user/67890/profile_image/conversion/beatdroplive-medium.webp',
      description: 'Live DJ sets and electronic music',
      gameCategory: 'Music & Performing Arts',
      isLive: false,
      streamTitle: 'Friday Night Bass Drops',
      viewerCount: 0,
      lastLiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isFeatured: false,
      sortOrder: 2
    },
    {
      name: 'ChillVibesTV',
      channelName: 'chillvibestv',
      avatar: 'https://files.kick.com/images/user/11111/profile_image/conversion/chillvibestv-medium.webp',
      description: 'Chill music and good vibes only',
      gameCategory: 'Music & Performing Arts',
      isLive: true,
      streamTitle: 'Chill Music for Focus & Relaxation',
      viewerCount: 445,
      isFeatured: false,
      sortOrder: 3
    }
  ]
};

// Helper function to generate realistic thumbnail URLs
const generateThumbnailUrl = (platform, channelName, isLive) => {
  if (!isLive) return null;
  
  const baseUrls = {
    twitch: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${channelName}-320x180.jpg`,
    youtube: `https://i.ytimg.com/vi/jfKfPfyJRdk/hqdefault_live.jpg`, // Generic live thumbnail
    kick: `https://images.kick.com/video_thumbnails/OOwAn7lBi8V/${channelName}_live.webp`
  };
  
  return baseUrls[platform];
};

async function createLivestreamData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the Davernie user to link streamers to
    const davernieUser = await User.findOne({ email: 'ernesto.ortiz0012@gmail.com' });
    if (!davernieUser) {
      throw new Error('Davernie user not found!');
    }
    console.log(`Found Davernie user: ${davernieUser.username}`);
    
    // Clear existing streamers to avoid duplicates
    await Streamer.deleteMany({});
    console.log('Cleared existing streamers');
    
    const createdStreamers = [];
    
    // Create streamers for each platform
    for (const [platform, streamers] of Object.entries(realStreamers)) {
      console.log(`\n--- Creating ${platform.toUpperCase()} streamers ---`);
      
      for (const streamerData of streamers) {
        try {
          const streamer = new Streamer({
            ...streamerData,
            platform,
            userId: davernieUser._id, // Link all streamers to Davernie
            thumbnailUrl: generateThumbnailUrl(platform, streamerData.channelName, streamerData.isLive),
            lastStatusCheck: new Date(),
            isActive: true
          });
          
          await streamer.save();
          createdStreamers.push(streamer);
          
          const liveStatus = streamer.isLive ? '🔴 LIVE' : '⭕ OFFLINE';
          const viewerText = streamer.isLive ? `${streamer.viewerCount} viewers` : 'Not streaming';
          
          console.log(`✅ Created ${platform} streamer: ${streamer.name} ${liveStatus} (${viewerText})`);
          
        } catch (error) {
          console.error(`❌ Error creating ${platform} streamer ${streamerData.name}:`, error.message);
        }
      }
    }
    
    // Update Davernie's social links to match the streamers
    try {
      const updateData = {
        'socials.twitch': 'monstercat',
        'socials.youtube': 'LofiGirl', 
        'socials.kick': 'musiclive24'
      };
      
      await User.findByIdAndUpdate(davernieUser._id, { $set: updateData });
      console.log(`\n✅ Updated Davernie's social links to match streamers`);
    } catch (error) {
      console.error('❌ Error updating Davernie social links:', error.message);
    }
    
    // Summary
    console.log(`\n🎉 Livestream Data Creation Summary:`);
    console.log(`   ✅ ${createdStreamers.length} streamers created across 3 platforms`);
    
    const platformCounts = createdStreamers.reduce((acc, s) => {
      acc[s.platform] = (acc[s.platform] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 Platform Distribution:`);
    Object.entries(platformCounts).forEach(([platform, count]) => {
      console.log(`   ${platform.toUpperCase()}: ${count} streamers`);
    });
    
    const liveStreamers = createdStreamers.filter(s => s.isLive);
    const offlineStreamers = createdStreamers.filter(s => !s.isLive);
    
    console.log(`\n📺 Stream Status:`);
    console.log(`   🔴 LIVE: ${liveStreamers.length} streamers`);
    console.log(`   ⭕ OFFLINE: ${offlineStreamers.length} streamers`);
    
    if (liveStreamers.length > 0) {
      console.log(`\n🔥 Currently Live Streamers:`);
      liveStreamers.forEach(s => {
        console.log(`   • ${s.name} (${s.platform}) - ${s.viewerCount} viewers`);
        console.log(`     "${s.streamTitle}"`);
      });
    }
    
    console.log(`\n🎭 Featured Streamers: ${createdStreamers.filter(s => s.isFeatured).length}`);
    console.log(`🔗 All streamers linked to user: ${davernieUser.username}`);
    
  } catch (error) {
    console.error('Error creating livestream data:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Function to update live status (for testing)
async function updateLiveStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Updating live status...');
    
    // Randomly toggle some streamers' live status
    const streamers = await Streamer.find({});
    
    for (const streamer of streamers) {
      const shouldBeLive = Math.random() > 0.4; // 60% chance to be live
      
      if (shouldBeLive && !streamer.isLive) {
        streamer.isLive = true;
        streamer.viewerCount = Math.floor(Math.random() * 5000) + 100;
        streamer.lastLiveAt = new Date();
        streamer.thumbnailUrl = generateThumbnailUrl(streamer.platform, streamer.channelName, true);
      } else if (!shouldBeLive && streamer.isLive) {
        streamer.isLive = false;
        streamer.viewerCount = 0;
        streamer.thumbnailUrl = null;
      }
      
      streamer.lastStatusCheck = new Date();
      await streamer.save();
    }
    
    const liveCount = await Streamer.countDocuments({ isLive: true });
    console.log(`✅ Updated live status - ${liveCount} streamers now live`);
    
  } catch (error) {
    console.error('Error updating live status:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'update') {
    updateLiveStatus();
  } else {
    createLivestreamData();
  }
}

module.exports = { createLivestreamData, updateLiveStatus };
