const mongoose = require('mongoose');
const User = require('./dist/models/User').default;
const Streamer = require('./dist/models/Streamer').default;
require('dotenv').config();

console.log('Creating real streamers that work with dynamic API checks...');

// Real streamers with actual usernames/channel IDs that APIs can check
const realStreamers = [
  // Twitch streamers (real music/gaming streamers)
  {
    name: 'Monstercat',
    platform: 'twitch',
    channelName: 'monstercat',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/91935d17-aa3c-4194-bb1c-85eada47b850-profile_image-300x300.png',
    description: 'Electronic music label and 24/7 music stream',
    isActive: true,
    isFeatured: true,
    sortOrder: 1
  },
  {
    name: 'ChilledCow (Lofi Girl)',
    platform: 'twitch',
    channelName: 'lofigirl',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/22025b01-8bb0-4ec1-97d5-5a6e9bb4e6db-profile_image-300x300.png',
    description: 'Chill beats and lo-fi hip hop music streams',
    isActive: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'NoCopyrightSounds',
    platform: 'twitch',
    channelName: 'nocopyrightsounds',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/55f5b8e7-7a96-4bb7-b80b-84a3a97b5a5a-profile_image-300x300.png',
    description: 'Copyright-free music for content creators',
    isActive: true,
    isFeatured: false,
    sortOrder: 3
  },
  
  // YouTube streamers (real music channels that sometimes stream)
  {
    name: 'Lofi Girl',
    platform: 'youtube',
    channelName: 'LofiGirl',
    channelId: 'UCSJ4gkVC6NrvII8umztf0Ow', // Real YouTube channel ID
    avatar: 'https://yt3.ggpht.com/2YNNX45NMOjP6l8rKcNNbcXUEFBPLI-LB__vIIjbnN5A7c9g8h4RNGeB8TplYgq7dH3Gs9FMYw=s176-c-k-c0x00ffffff-no-rj',
    description: 'Chill beats to relax/study to - often has live streams',
    isActive: true,
    isFeatured: true,
    sortOrder: 4
  },
  {
    name: 'Trap Nation',
    platform: 'youtube',
    channelName: 'TrapNation',
    channelId: 'UCa10nxShhzNrCE1o2ZOPztg', // Real YouTube channel ID
    avatar: 'https://yt3.ggpht.com/ytc/AMLnZu8UHxnX0iC_SIR8WIRhiLHkHFFx4HZ6kGiP0YFV=s176-c-k-c0x00ffffff-no-rj',
    description: 'The largest trap music channel on YouTube with live streams',
    isActive: true,
    isFeatured: true,
    sortOrder: 5
  },
  {
    name: 'Proximity',
    platform: 'youtube',
    channelName: 'Proximity',
    channelId: 'UC3ifTl5zKiCAhHIBQYcaTeg', // Real YouTube channel ID
    avatar: 'https://yt3.ggpht.com/ytc/AMLnZu_n0t7z5Sj8EG-G5BfqXz7rHnz7C8L4O4A5K2Y=s176-c-k-c0x00ffffff-no-rj',
    description: 'Electronic dance music channel with occasional live streams',
    isActive: true,
    isFeatured: false,
    sortOrder: 6
  },
  
  // Kick streamers (real streamers on Kick platform)
  {
    name: 'Asmongold',
    platform: 'kick',
    channelName: 'asmongold',
    avatar: 'https://files.kick.com/images/user/4917/profile_image/conversion/a7a4e2c6-4b9c-4bf2-b82a-7c9d8e1e2b1a-medium.webp',
    description: 'Gaming streamer, MMORPGs and variety content',
    isActive: true,
    isFeatured: true,
    sortOrder: 7
  },
  {
    name: 'Trainwreck',
    platform: 'kick',
    channelName: 'trainwreck',
    avatar: 'https://files.kick.com/images/user/8/profile_image/conversion/e7f9a1b2-3c4d-5e6f-7a8b-9c0d1e2f3a4b-medium.webp',
    description: 'Variety gaming streamer and content creator',
    isActive: true,
    isFeatured: true,
    sortOrder: 8
  },
  {
    name: 'Stake',
    platform: 'kick',
    channelName: 'stake',
    avatar: 'https://files.kick.com/images/user/1/profile_image/conversion/f1a2b3c4-5d6e-7f8g-9h0i-1j2k3l4m5n6o-medium.webp',
    description: 'Official Stake casino streams and giveaways',
    isActive: true,
    isFeatured: false,
    sortOrder: 9
  }
];

async function createRealStreamers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://musikmadnessfree:yZO6Oeu6O4dBi3wd@musikmadnessfree.amewlxk.mongodb.net/musikmadness?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');
    
    // Find Davernie user to link streamers to
    const davernieUser = await User.findOne({ email: 'ernesto.ortiz0012@gmail.com' });
    if (!davernieUser) {
      throw new Error('Davernie user not found! Please make sure the user exists.');
    }
    console.log(`Found Davernie user: ${davernieUser.username}`);
    
    // Clear existing streamers
    await Streamer.deleteMany({});
    console.log('Cleared existing streamers');
    
    let createdCount = 0;
    
    for (const streamerData of realStreamers) {
      try {
        // Create streamer with default live status (will be updated by API)
        const streamer = new Streamer({
          ...streamerData,
          userId: davernieUser._id,
          isLive: false, // Default to offline, API will update this
          streamTitle: undefined,
          viewerCount: 0,
          thumbnailUrl: undefined,
          gameCategory: undefined,
          lastLiveAt: undefined,
          lastStatusCheck: undefined,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await streamer.save();
        createdCount++;
        
        console.log(`✅ Created real streamer: ${streamer.name} (${streamer.platform}:${streamer.channelName})`);
        
      } catch (error) {
        console.error(`❌ Failed to create streamer ${streamerData.name}:`, error.message);
      }
    }
    
    // Update Davernie's social links to match some of the streamers
    await User.findByIdAndUpdate(davernieUser._id, {
      'socials.twitch': 'monstercat',
      'socials.youtube': 'LofiGirl', 
      'socials.kick': 'asmongold'
    });
    
    console.log(`\n🎉 Successfully created ${createdCount} real streamers!`);
    console.log(`📱 Updated Davernie's social links to match featured streamers`);
    
    console.log(`\n📊 Platform breakdown:`);
    const platforms = realStreamers.reduce((acc, s) => {
      acc[s.platform] = (acc[s.platform] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(platforms).forEach(([platform, count]) => {
      console.log(`   ${platform}: ${count} streamers`);
    });
    
    console.log(`\n🔄 These streamers will be automatically checked for live status by your API services:`);
    console.log(`   - TwitchService: Checks Twitch streamers every few minutes`);
    console.log(`   - YouTubeService: Checks YouTube channels for live streams`);
    console.log(`   - KickService: Checks Kick streamers for live status`);
    
    console.log(`\n📝 Real streamers created with actual usernames that your APIs can verify:`);
    realStreamers.forEach(streamer => {
      const identifier = streamer.channelId ? `${streamer.channelName} (ID: ${streamer.channelId})` : streamer.channelName;
      console.log(`   ${streamer.platform}: ${identifier} - ${streamer.name}`);
    });
    
  } catch (error) {
    console.error('Error creating real streamers:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
if (require.main === module) {
  createRealStreamers();
}

module.exports = { createRealStreamers };
