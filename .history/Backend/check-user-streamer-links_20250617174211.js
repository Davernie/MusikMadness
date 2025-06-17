require('dotenv').config();
const mongoose = require('mongoose');

async function linkStreamersToUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness');
    console.log('✅ Connected to database');
    
    // Import models
    const User = require('./src/models/User').default;
    const Streamer = require('./src/models/Streamer').default;
    
    console.log('\n📋 Current Users:');
    const users = await User.find({}).select('_id username email bio location genres socials');
    users.forEach(user => {
      console.log(`  ${user._id} - ${user.username} (${user.email})`);
      if (user.bio) console.log(`    Bio: ${user.bio}`);
      if (user.location) console.log(`    Location: ${user.location}`);
      if (user.genres && user.genres.length > 0) console.log(`    Genres: ${user.genres.join(', ')}`);
    });
    
    console.log('\n📺 Current Streamers:');
    const streamers = await Streamer.find({}).select('_id name platform channelName userId');
    streamers.forEach(streamer => {
      console.log(`  ${streamer._id} - ${streamer.name} (${streamer.platform}/${streamer.channelName})`);
      if (streamer.userId) {
        console.log(`    ✅ Already linked to user: ${streamer.userId}`);
      } else {
        console.log(`    ❌ Not linked to any user`);
      }
    });
    
    // Example linking (you can modify these)
    if (users.length > 0 && streamers.length > 0) {
      console.log('\n🔗 Example linking process:');
      console.log('You can link streamers to users using the API endpoint:');
      console.log('PUT /api/streamers/{streamerId}/link-user');
      console.log('Body: { "userId": "USER_ID_HERE" }');
      console.log('\nExample commands:');
      
      streamers.slice(0, Math.min(3, users.length)).forEach((streamer, index) => {
        if (!streamer.userId && users[index]) {
          console.log(`curl -X PUT "http://localhost:5001/api/streamers/${streamer._id}/link-user" \\`);
          console.log(`  -H "Content-Type: application/json" \\`);
          console.log(`  -H "Authorization: Bearer YOUR_TOKEN" \\`);
          console.log(`  -d '{"userId": "${users[index]._id}"}'`);
          console.log('');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

linkStreamersToUsers();
