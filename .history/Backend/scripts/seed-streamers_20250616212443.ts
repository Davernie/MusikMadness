import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Streamer from '../src/models/Streamer';

// Load environment variables
dotenv.config();

const initialStreamers = [
  {
    name: 'Shroud',
    platform: 'twitch',
    channelName: 'shroud',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/shroud-profile_image-7bfdf694f0a7a380-300x300.png',
    description: 'FPS gaming streams',
    isLive: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1
  },
  {
    name: 'xQc',
    platform: 'kick',
    channelName: 'xqc',
    avatar: 'https://files.kick.com/images/user/1504/profile_image/conversion/c4d5c71b-74ef-4d33-8e31-a03ae04ce698-medium.webp',
    description: 'Variety gaming and reactions',
    isLive: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: 'Trainwreck',
    platform: 'kick',
    channelName: 'trainwreck',
    avatar: 'https://files.kick.com/images/user/6/profile_image/conversion/placeholder-medium.webp',
    description: 'Gaming and slots',
    isLive: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 3
  },
  {
    name: 'YouTube Music Creator',
    platform: 'youtube',
    channelName: 'example_youtube',
    channelId: 'UC123456789',
    avatar: 'https://via.placeholder.com/150/EF4444/ffffff?text=YT',
    description: 'Live music production and tutorials',
    isLive: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 4
  },
  {
    name: 'Demo Beat Maker',
    platform: 'twitch',
    channelName: 'demo_beats',
    avatar: 'https://via.placeholder.com/150/F59E0B/ffffff?text=BM',
    description: 'Hip-hop beats and rap production',
    isLive: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 5
  }
];



const seedStreamers = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing streamers
    await Streamer.deleteMany({});
    console.log('Cleared existing streamers');

    // Insert initial streamers
    const createdStreamers = await Streamer.insertMany(initialStreamers);
    console.log(`Created ${createdStreamers.length} streamers:`);
    
    createdStreamers.forEach(streamer => {
      console.log(`- ${streamer.name} (${streamer.platform}) ${streamer.isLive ? '🔴 LIVE' : '⚫ Offline'}`);
    });

    console.log('\n✅ Streamer seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding streamers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedStreamers();
