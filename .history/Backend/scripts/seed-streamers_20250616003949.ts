import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Streamer from '../src/models/Streamer';

// Load environment variables
dotenv.config();



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
