// Quick script to add real YouTube streamers
const mongoose = require('mongoose');
require('dotenv').config();

const Streamer = require('./dist/models/Streamer').default;

async function updateYouTubeStreamers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove fake YouTube streamer
    await Streamer.deleteMany({ 
      platform: 'youtube', 
      channelId: 'UC123456789' 
    });

    // Add real YouTube streamers
    const youtubeStreamers = [
      {
        name: 'LoFi Girl',
        platform: 'youtube',
        channelName: 'ChilledCow',
        channelId: 'UCSJ4gkVC6NrvII8umztf0Ow',
        avatar: 'https://yt3.ggpht.com/ytc/AIdro_mBCE-RJaJzVBmqRrKBbI6tYkS6Q5zxhDCTJ9_qQniqCw=s176-c-k-c0x00ffffff-no-rj',
        description: 'Relaxing lo-fi music streams',
        isLive: false,
        isActive: true,
        isFeatured: true,
        sortOrder: 10
      },
      {
        name: 'NASA',
        platform: 'youtube',
        channelName: 'NASA',
        channelId: 'UCLA_DiR1FfKNvjuUpBHmylQ',
        avatar: 'https://yt3.ggpht.com/ytc/AIdro_n8vAhKmUpLHR_YNM9-6gHWmZlLyGjMnqnINYi7djT5=s176-c-k-c0x00ffffff-no-rj',
        description: 'Space exploration and ISS live streams',
        isLive: false,
        isActive: true,
        isFeatured: true,
        sortOrder: 11
      }
    ];

    const created = await Streamer.insertMany(youtubeStreamers);
    console.log(`✅ Added ${created.length} real YouTube streamers:`);
    created.forEach(s => console.log(`- ${s.name} (${s.channelId})`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateYouTubeStreamers();
