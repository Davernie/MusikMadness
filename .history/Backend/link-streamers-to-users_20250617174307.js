require('dotenv').config();
const mongoose = require('mongoose');

async function linkExampleStreamers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness');
    console.log('✅ Connected to database');
    
    // Import models
    const User = require('./src/models/User').default;
    const Streamer = require('./src/models/Streamer').default;
    
    // Get all users and streamers
    const users = await User.find({}).select('_id username email bio location genres');
    const streamers = await Streamer.find({ userId: { $exists: false } }); // Only unlinked streamers
    
    console.log(`📋 Found ${users.length} users and ${streamers.length} unlinked streamers`);
    
    // Auto-link first few streamers to users if available
    if (users.length > 0 && streamers.length > 0) {
      const linksToMake = Math.min(users.length, streamers.length, 3); // Link up to 3
      
      for (let i = 0; i < linksToMake; i++) {
        const user = users[i];
        const streamer = streamers[i];
        
        console.log(`🔗 Linking ${streamer.name} (${streamer.platform}) to ${user.username}`);
        
        await Streamer.findByIdAndUpdate(streamer._id, { userId: user._id });
        
        console.log(`✅ Successfully linked!`);
      }
      
      console.log(`\n🎉 Linked ${linksToMake} streamers to users successfully!`);
    } else {
      console.log('❌ No users or streamers available for linking');
    }
    
    // Show final status
    console.log('\n📊 Final Status:');
    const linkedStreamers = await Streamer.find({ userId: { $exists: true } })
      .populate('userId', 'username email bio location');
    
    linkedStreamers.forEach(streamer => {
      console.log(`✅ ${streamer.name} → ${streamer.userId.username}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

linkExampleStreamers();
