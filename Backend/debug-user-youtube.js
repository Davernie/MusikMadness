const mongoose = require('mongoose');
require('dotenv').config();

async function checkUserYouTubeField() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('Connected to database');
    
    // Check users with socials
    const usersWithSocials = await mongoose.connection.db.collection('users').find({
      'socials': { $exists: true }
    }).limit(5).toArray();
    
    console.log(`Found ${usersWithSocials.length} users with socials field`);
    
    usersWithSocials.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Socials:`, JSON.stringify(user.socials, null, 4));
    });
    
    // Check if any user has YouTube specifically
    const usersWithYouTube = await mongoose.connection.db.collection('users').find({
      'socials.youtube': { $exists: true, $ne: '' }
    }).toArray();
    
    console.log(`\nFound ${usersWithYouTube.length} users with YouTube field`);
    
    usersWithYouTube.forEach((user, index) => {
      console.log(`\nYouTube User ${index + 1}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  YouTube: ${user.socials.youtube}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkUserYouTubeField();
