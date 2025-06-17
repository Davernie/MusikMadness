require('dotenv').config();
const mongoose = require('mongoose');

async function addSampleUserProfiles() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness');
    console.log('✅ Connected to database');
    
    // Import User model
    const User = require('./src/models/User').default;
    
    // Sample profile data for users
    const sampleProfiles = [
      {
        bio: "Electronic music producer and live streamer. Creating beats that move souls! 🎵",
        location: "Los Angeles, CA",
        website: "https://example.com",
        genres: ["Electronic", "House", "Techno"],
        socials: {
          instagram: "example_producer",
          twitter: "examplebeats",
          soundcloud: "exampleproducer",
          spotify: "example-artist"
        }
      },
      {
        bio: "Hip-hop artist and beatmaker. Streaming my creative process daily! 🔥",
        location: "Atlanta, GA",
        genres: ["Hip-Hop", "Rap", "R&B"],
        socials: {
          instagram: "hiphop_creator",
          twitter: "beatmaker2024",
          soundcloud: "hiphopflows"
        }
      },
      {
        bio: "Indie rock musician sharing my journey. Music is life! 🎸",
        location: "Portland, OR",
        website: "https://myband.com",
        genres: ["Indie Rock", "Alternative", "Folk"],
        socials: {
          instagram: "indie_vibes",
          twitter: "rock_musician",
          youtube: "indierockchannel"
        }
      },
      {
        bio: "Classical pianist and composer. Bringing classical music to the digital age 🎹",
        location: "New York, NY",
        genres: ["Classical", "Piano", "Orchestral"],
        socials: {
          youtube: "classicalpianomusic",
          twitter: "pianist_composer",
          spotify: "classical-modern"
        }
      }
    ];
    
    // Get existing users
    const users = await User.find({}).limit(sampleProfiles.length);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log(`📋 Updating profiles for ${users.length} users...`);
    
    // Update each user with sample profile data
    for (let i = 0; i < Math.min(users.length, sampleProfiles.length); i++) {
      const user = users[i];
      const profileData = sampleProfiles[i];
      
      console.log(`🔄 Updating profile for ${user.username}...`);
      
      await User.findByIdAndUpdate(user._id, {
        $set: {
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          genres: profileData.genres,
          'socials.instagram': profileData.socials.instagram,
          'socials.twitter': profileData.socials.twitter,
          'socials.soundcloud': profileData.socials.soundcloud,
          'socials.spotify': profileData.socials.spotify,
          'socials.youtube': profileData.socials.youtube
        }
      });
      
      console.log(`✅ Updated ${user.username} with sample profile data`);
    }
    
    // Show updated users
    console.log('\n🎉 Updated User Profiles:');
    const updatedUsers = await User.find({}).limit(sampleProfiles.length).select('username bio location genres socials');
    
    updatedUsers.forEach(user => {
      console.log(`\n👤 ${user.username}:`);
      if (user.bio) console.log(`   Bio: ${user.bio}`);
      if (user.location) console.log(`   Location: ${user.location}`);
      if (user.genres && user.genres.length > 0) console.log(`   Genres: ${user.genres.join(', ')}`);
      if (user.socials) {
        const activeSocials = Object.entries(user.socials).filter(([_, value]) => value);
        if (activeSocials.length > 0) {
          console.log(`   Socials: ${activeSocials.map(([platform, handle]) => `${platform}: ${handle}`).join(', ')}`);
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

addSampleUserProfiles();
