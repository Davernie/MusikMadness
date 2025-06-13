require('dotenv').config();
const mongoose = require('mongoose');

// Define User schema inline
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  bio: String,
  location: String,
  website: String,
  genres: [String],
  socials: {
    soundcloud: String,
    instagram: String,
    twitter: String,
    spotify: String,
    youtube: String
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', UserSchema);

async function checkYouTubeData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('Connected to database');
    
    // Find users with YouTube data
    const usersWithYouTube = await User.find({ 'socials.youtube': { $exists: true, $ne: '' } }).limit(5);
    console.log('Users with YouTube data:', usersWithYouTube.map(u => ({ 
      username: u.username, 
      youtube: u.socials?.youtube,
      allSocials: u.socials 
    })));
    
    // Find a specific user (if you know the username or email)
    const testUser = await User.findOne({ email: 'ernesto.ortiz0012@gmail.com' });
    if (testUser) {
      console.log('Test user socials:', testUser.socials);
    } else {
      console.log('Test user not found');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkYouTubeData();
