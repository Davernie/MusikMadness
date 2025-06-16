const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Simple streamer schema
const streamerSchema = new mongoose.Schema({
  name: String,
  platform: String,
  channelName: String,
  isLive: Boolean,
  streamTitle: String,
  viewerCount: Number,
  thumbnailUrl: String,
  lastStatusCheck: Date,
  updatedAt: Date
});

const Streamer = mongoose.model('Streamer', streamerSchema);

async function forceUpdateAsmongold() {
  await connectDB();
  
  try {
    console.log('🔄 Force updating Asmongold to LIVE status...\n');
    
    // Find Asmongold
    const asmongold = await Streamer.findOne({ channelName: 'asmongold' });
    
    if (!asmongold) {
      console.log('❌ Asmongold not found in database');
      return;
    }
    
    console.log('📋 Current status:');
    console.log(`  Name: ${asmongold.name}`);
    console.log(`  Platform: ${asmongold.platform}`);
    console.log(`  Channel: ${asmongold.channelName}`);
    console.log(`  Is live: ${asmongold.isLive}`);
    
    // Force update to live
    const updateData = {
      isLive: true,
      streamTitle: '[DROPS ON] BIG DAY HUGE DRAMA WW3+MORE NEWS/GAMES MULTISTREAMING BIG NEWS+GAMES+REACTS',
      viewerCount: 13490,
      thumbnailUrl: 'https://images.kick.com/video_thumbnails/gF7htJHIPzP0/ymlLjiu9QmfS/480.webp',
      lastStatusCheck: new Date(),
      updatedAt: new Date()
    };
    
    await Streamer.findByIdAndUpdate(asmongold._id, updateData);
    
    console.log('\n✅ FORCE UPDATE COMPLETE!');
    console.log('🎉 Asmongold is now set as LIVE in your database');
    console.log('🖥️ Check your website - he should now appear as live!');
    
    // Verify the update
    const updatedStreamer = await Streamer.findById(asmongold._id);
    console.log('\n📋 Verified updated status:');
    console.log(`  🔴 Is live: ${updatedStreamer.isLive}`);
    console.log(`  📺 Stream title: ${updatedStreamer.streamTitle}`);
    console.log(`  👥 Viewers: ${updatedStreamer.viewerCount}`);
    console.log(`  ⏰ Last updated: ${updatedStreamer.updatedAt}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

forceUpdateAsmongold();
