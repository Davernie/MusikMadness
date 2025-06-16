import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Streamer from '../src/models/Streamer';

// Load environment variables
dotenv.config();

const initialStreamers = [
  {
    name: 'PirateSoftware',
    platform: 'twitch',
    channelName: 'piratesoftware',
    avatar: 'https://static-cdn.jtvnw.net/jtv_user_pictures/piratesoftware-profile_image-300x300.png',
    description: 'Game development and programming streams',
    isLive: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 1
  },
  {
    name: 'Example Twitch Streamer',
    platform: 'twitch',
    channelName: 'example_twitch',
    avatar: 'https://via.placeholder.com/150/7C3AED/ffffff?text=TW',
    description: 'Amazing music producer streaming live beats creation!',
    isLive: false,
    isActive: true,
    isFeatured: true,
    sortOrder: 2
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
    sortOrder: 3
  },
  {
    name: 'Kick Music Producer',
    platform: 'kick',
    channelName: 'example_kick',
    avatar: 'https://via.placeholder.com/150/10B981/ffffff?text=KK',
    description: 'Electronic music and DJ sets',
    isLive: false,
    isActive: true,
    isFeatured: false,
    sortOrder: 3
  },
  {
    name: 'Demo Beat Maker',
    platform: 'twitch',
    channelName: 'demo_beats',
    avatar: 'https://via.placeholder.com/150/F59E0B/ffffff?text=BM',
    description: 'Hip-hop beats and rap production',
    isLive: true, // Example live streamer
    streamTitle: 'Making fire beats! Come vibe 🔥',
    viewerCount: 234,
    thumbnailUrl: 'https://via.placeholder.com/640x360/1F2937/ffffff?text=LIVE',
    isActive: true,
    isFeatured: false,
    sortOrder: 4
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
