const mongoose = require('mongoose');
require('dotenv').config();

async function checkStreamers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const streamers = await mongoose.connection.db.collection('streamers').find({}).toArray();
    console.log(`Found ${streamers.length} streamers in database:`);
    
    streamers.forEach(s => {
      console.log(`- ${s.name} (${s.platform}) ${s.isLive ? '🔴 LIVE' : '⚫ Offline'}`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch(e) {
    console.error('Error:', e);
    process.exit(1);
  }
}

checkStreamers();
