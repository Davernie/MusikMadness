require('dotenv').config();
const mongoose = require('mongoose');

async function debugUserData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness');
    console.log('✅ Connected to database');
    
    // Import models
    const User = require('./src/models/User').default;
    const Streamer = require('./src/models/Streamer').default;
    
    // Check if the specific user exists
    const userId = '684b1d5fbfb9d6119ba9a211';
    console.log(`🔍 Checking user with ID: ${userId}`);
    
    const user = await User.findById(userId);
    if (user) {
      console.log('✅ User found:', {
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        location: user.location,
        genres: user.genres,
        socials: user.socials,
        hasProfilePicture: !!user.profilePicture
      });
    } else {
      console.log('❌ User not found!');
      
      // Show all users
      console.log('\n📋 All users in database:');
      const allUsers = await User.find({}).select('_id username email');
      allUsers.forEach(u => {
        console.log(`  ${u._id} - ${u.username} (${u.email})`);
      });
    }
    
    // Test the exact query the API uses
    console.log('\n🔍 Testing API query...');
    const streamers = await Streamer.find({ isActive: true })
      .populate('userId', 'username email bio location website genres socials.instagram socials.twitter socials.youtube socials.spotify socials.soundcloud profilePicture')
      .sort({ isFeatured: -1, isLive: -1, sortOrder: 1, name: 1 })
      .lean();
    
    console.log(`\n📺 Found ${streamers.length} streamers:`);
    streamers.forEach(streamer => {
      console.log(`\n${streamer.name} (${streamer.platform}):`);
      console.log(`  userId: ${streamer.userId || 'NONE'}`);
      if (streamer.userId) {
        console.log(`  User populated: ${!!streamer.userId.username ? 'YES' : 'NO'}`);
        if (streamer.userId.username) {
          console.log(`  Username: ${streamer.userId.username}`);
          console.log(`  Bio: ${streamer.userId.bio || 'NONE'}`);
          console.log(`  Location: ${streamer.userId.location || 'NONE'}`);
        } else {
          console.log(`  ❌ User reference exists but no data populated`);
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

debugUserData();
