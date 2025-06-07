const mongoose = require('mongoose');

async function quickCheck() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/musikmadness');
    console.log('✓ Connected');
    
    // Use mongoose.connection.db to access the database directly
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check submissions collection
    const submissionsCount = await db.collection('submissions').countDocuments();
    console.log('Total submissions:', submissionsCount);
    
    if (submissionsCount > 0) {
      const submissions = await db.collection('submissions').find({}).limit(5).toArray();
      console.log('Sample submissions:');
      submissions.forEach((sub, i) => {
        console.log(`${i + 1}. ${sub.songTitle} - Type: ${sub.audioType || 'unknown'} - Source: ${sub.streamingSource || 'none'}`);
        if (sub.soundcloudUrl) {
          console.log(`   SoundCloud URL: ${sub.soundcloudUrl}`);
        }
        if (sub.youtubeVideoId) {
          console.log(`   YouTube ID: ${sub.youtubeVideoId}`);
        }
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

quickCheck();
