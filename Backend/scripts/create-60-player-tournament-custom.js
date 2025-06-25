const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Update these with your actual MongoDB connection details
const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';
const dbName = process.env.DB_NAME || 'test';

// Your specific submissions
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=UjpbQ1OWMPE';
const SOUNDCLOUD_URL = 'https://soundcloud.com/yungkaai/blue';

const generateCustomTournament = async (tournamentMaxSlots = 64, actualParticipants = 60) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🎵 Connected to MongoDB for Custom Tournament Setup');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const tournamentsCollection = db.collection('tournaments');
    const submissionsCollection = db.collection('submissions');
    
    // Clean up existing test data
    console.log('🧹 Cleaning up existing test data...');
    await usersCollection.deleteMany({
      username: { $regex: /^testuser\d+$/ }
    });
    await tournamentsCollection.deleteMany({
      name: { $regex: /Custom \d+-Player/ }
    });
    await submissionsCollection.deleteMany({
      songTitle: { $regex: /^Test Track \d+$|Epic Music Track|Blue/ }
    });
    console.log('✅ Cleanup complete');
    
    // Generate test users
    const users = [];
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    console.log(`🎮 Generating ${actualParticipants} test users for ${tournamentMaxSlots}-slot tournament...`);
    
    for (let i = 1; i <= actualParticipants; i++) {
      const paddedNumber = i.toString().padStart(3, '0');
      
      const user = {
        username: `testuser${paddedNumber}`,
        email: `testuser${i}@example.com`,
        password: hashedPassword,
        bio: `Test user ${i} - Ready to compete with fire tracks! 🔥`,
        location: `Music City ${i}`,
        website: i % 5 === 0 ? `https://testuser${i}.music` : "",
        genres: ['Hip Hop', 'Electronic', 'Pop'][i % 3] ? [['Hip Hop', 'Electronic', 'Pop'][i % 3]] : [],
        socials: {
          soundcloud: i % 4 === 0 ? `testuser${i}` : "",
          instagram: i % 3 === 0 ? `testuser${i}` : "",
          twitter: i % 6 === 0 ? `@testuser${i}` : "",
          spotify: i % 7 === 0 ? `testuser${i}` : "",
          youtube: i % 5 === 0 ? `testuser${i}` : ""
        },
        stats: {
          tournamentsEntered: Math.floor(Math.random() * 15),
          tournamentsWon: Math.floor(Math.random() * 5),
          tournamentsCreated: i <= 5 ? Math.floor(Math.random() * 3) : 0,
          followers: Math.floor(Math.random() * 2000)
        },
        isCreator: i <= 10,
        isEmailVerified: true,
        followers: [],
        following: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
      };
      
      users.push(user);
    }
    
    // Insert users
    console.log('👥 Inserting users into database...');
    const userResult = await usersCollection.insertMany(users);
    const userIds = Object.values(userResult.insertedIds);
    console.log(`✅ Successfully created ${userIds.length} test users`);
    
    // Use existing creator account
    const creatorId = new ObjectId('684b1d5fbfb9d6119ba9a211');
    const creator = await usersCollection.findOne({ _id: creatorId });
    
    if (!creator) {
      console.error('❌ Creator account not found!');
      throw new Error('Creator account with ID 684b1d5fbfb9d6119ba9a211 not found');
    }
    
    console.log(`✅ Using creator: ${creator.email || creator.username}`);
    
    // Ensure creator has proper permissions
    if (!creator.isCreator) {
      await usersCollection.updateOne(
        { _id: creatorId },
        { 
          $set: { 
            isCreator: true,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Updated creator permissions');
    }
    
    // Create the tournament
    console.log(`🏆 Creating ${tournamentMaxSlots}-slot tournament with ${actualParticipants} actual participants...`);
    
    const tournamentData = {
      name: `${tournamentMaxSlots}-Slot Music Battle`,
      game: "Electronic", // Changed to Electronic for testing
      type: "artist",
      startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      maxPlayers: tournamentMaxSlots,
      description: `🎵 Epic ${actualParticipants}-player ELECTRONIC music tournament featuring custom YouTube and SoundCloud submissions! Battle it out with the hottest beats and prove you're the ultimate electronic music champion! 🏆\n\nThis tournament focuses specifically on ELECTRONIC music - showcasing the best in EDM, House, Techno, Dubstep and more!`,
      creator: creatorId,
      language: "English"
    };
    
    const tournamentResult = await tournamentsCollection.insertOne(tournamentData);
    const tournamentId = tournamentResult.insertedId;
    console.log(`✅ Created tournament with ID: ${tournamentId}`);
    
    // Create submissions with your specific URLs
    console.log('🎤 Creating submissions with your custom tracks...');
    
    const submissions = [];
    
    // Extract YouTube video ID from the URL
    const youtubeVideoId = YOUTUBE_URL.match(/[?&]v=([^&]+)/)?.[1] || 'UjpbQ1OWMPE';
    
    // First submission - YouTube (properly formatted)
    const youtubeSubmission = {
      tournament: tournamentId,
      user: userIds[0], // First test user gets the YouTube track
      songTitle: "Epic Music Track",
      streamingSource: "youtube",
      youtubeUrl: YOUTUBE_URL,
      youtubeVideoId: youtubeVideoId,
      youtubeThumbnail: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
      youtubeDuration: 240, // 4 minutes default
      description: "Epic YouTube track for the tournament!",
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    };
    
    // Extract SoundCloud info
    const soundcloudInfo = SOUNDCLOUD_URL.match(/soundcloud\.com\/([^\/]+)\/([^\/]+)/);
    const soundcloudUsername = soundcloudInfo?.[1] || 'yungkaai';
    const soundcloudTrack = soundcloudInfo?.[2] || 'blue';
    
    // Second submission - SoundCloud (properly formatted)
    const soundcloudSubmission = {
      tournament: tournamentId,
      user: userIds[1], // Second test user gets the SoundCloud track
      songTitle: "Blue",
      streamingSource: "soundcloud",
      soundcloudUrl: SOUNDCLOUD_URL,
      soundcloudTrackId: `${soundcloudUsername}_${soundcloudTrack}`,
      soundcloudUsername: soundcloudUsername,
      soundcloudDuration: 180, // 3 minutes default
      description: "Amazing SoundCloud track from YungKaai!",
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
    };
    
    submissions.push(youtubeSubmission, soundcloudSubmission);
    
    // Generate additional fake submissions for remaining participants
    const fakeYouTubeUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/watch?v=9bZkp7q19f0',
      'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
      'https://www.youtube.com/watch?v=6_b7RDuLwcI'
    ];
    
    const fakeSoundCloudUrls = [
      'https://soundcloud.com/testartist1/amazing-beat',
      'https://soundcloud.com/testartist2/fire-track',
      'https://soundcloud.com/testartist3/underground-vibe',
      'https://soundcloud.com/testartist4/epic-sound',
      'https://soundcloud.com/testartist5/demo-track'
    ];
    
    // Add submissions for remaining participants
    for (let i = 2; i < actualParticipants; i++) {
      const isYouTube = Math.random() > 0.5;
      const trackNumber = i + 1;
      
      let submission;
      
      if (isYouTube) {
        const ytUrl = fakeYouTubeUrls[i % fakeYouTubeUrls.length];
        const ytVideoId = ytUrl.match(/[?&]v=([^&]+)/)?.[1] || 'dQw4w9WgXcQ';
        
        submission = {
          tournament: tournamentId,
          user: userIds[i],
          songTitle: `Test Track ${trackNumber}`,
          streamingSource: "youtube",
          youtubeUrl: ytUrl,
          youtubeVideoId: ytVideoId,
          youtubeThumbnail: `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg`,
          youtubeDuration: Math.floor(Math.random() * 300) + 60, // Random duration 1-6 minutes
          description: `Test YouTube submission ${trackNumber} for the tournament`,
          submittedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        };
      } else {
        const scUrl = fakeSoundCloudUrls[i % fakeSoundCloudUrls.length];
        const scInfo = scUrl.match(/soundcloud\.com\/([^\/]+)\/([^\/]+)/);
        const scUsername = scInfo?.[1] || `testartist${(i % 5) + 1}`;
        const scTrack = scInfo?.[2] || `track${trackNumber}`;
        
        submission = {
          tournament: tournamentId,
          user: userIds[i],
          songTitle: `Test Track ${trackNumber}`,
          streamingSource: "soundcloud",
          soundcloudUrl: scUrl,
          soundcloudTrackId: `${scUsername}_${scTrack}`,
          soundcloudUsername: scUsername,
          soundcloudDuration: Math.floor(Math.random() * 300) + 60, // Random duration 1-6 minutes
          description: `Test SoundCloud submission ${trackNumber} for the tournament`,
          submittedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        };
      }
      
      submissions.push(submission);
    }
    
    // Insert all submissions
    const submissionResult = await submissionsCollection.insertMany(submissions);
    console.log(`✅ Created ${submissions.length} submissions`);
    
    // Update user stats
    await usersCollection.updateOne(
      { _id: creatorId },
      { 
        $inc: { 'stats.tournamentsCreated': 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    await usersCollection.updateMany(
      { _id: { $in: userIds } },
      { 
        $inc: { 'stats.tournamentsEntered': 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    console.log('✅ Updated user statistics');
    
    // Final summary
    console.log('\n🎉 TOURNAMENT SETUP COMPLETE! 🎉');
    console.log('============================================');
    console.log(`🏆 Tournament ID: ${tournamentId}`);
    console.log(`👑 Tournament Name: ${tournamentMaxSlots}-Slot Music Battle`);
    console.log(`📊 Tournament Capacity: ${tournamentMaxSlots} total slots`);
    console.log(`👥 Current Participants: ${actualParticipants} users joined`);
    console.log(`📈 Available Spots: ${tournamentMaxSlots - actualParticipants} spots remaining`);
    console.log(`📻 Submissions: ${submissions.length} tracks`);
    console.log(`🎬 YouTube Track: ${YOUTUBE_URL}`);
    console.log(`🎧 SoundCloud Track: ${SOUNDCLOUD_URL}`);
    console.log(`👤 Creator: ${creator.email || creator.username} (${creatorId})`);
    console.log(`🔐 Test User Credentials: testuser001-${actualParticipants.toString().padStart(3, '0')}, password: password123`);
    console.log(`🔑 Creator Credentials: ernesto.ortiz0012@gmail.com, password: Tennis.ie1`);
    console.log(`📱 Access at: http://localhost:5173/tournaments/${tournamentId}`);
    console.log('============================================');
    
    return {
      tournamentId: tournamentId,
      userIds: userIds,
      creatorId: creatorId,
      submissionCount: submissions.length,
      maxSlots: tournamentMaxSlots,
      participants: actualParticipants,
      availableSpots: tournamentMaxSlots - actualParticipants
    };
    
  } catch (error) {
    console.error('❌ Error setting up custom tournament:', error);
    throw error;
  } finally {
    await client.close();
    console.log('📴 Disconnected from MongoDB');
  }
};

// Cleanup function
const cleanupCustomData = async () => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🧹 Connected to MongoDB for cleanup');
    
    const db = client.db(dbName);
    
    // Delete test users
    const userResult = await db.collection('users').deleteMany({
      username: { $regex: /^testuser\d+$/ }
    });
    
    // Delete test tournaments
    const tournamentResult = await db.collection('tournaments').deleteMany({
      name: { $regex: /Custom \d+-Player/ }
    });
    
    // Delete test submissions
    const submissionResult = await db.collection('submissions').deleteMany({
      songTitle: { $regex: /^Test Track \d+$|Epic Music Track|Blue/ }
    });
    
    console.log(`✅ Cleaned up:`);
    console.log(`   - ${userResult.deletedCount} test users`);
    console.log(`   - ${tournamentResult.deletedCount} test tournaments`);
    console.log(`   - ${submissionResult.deletedCount} test submissions`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('📴 Disconnected from MongoDB');
  }
};

// Main execution
const main = async () => {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (command === 'cleanup') {
      await cleanupCustomData();
    } else if (command === 'help' || command === '-h' || command === '--help') {
      console.log('\n🎵 MusikMadness Tournament Creator');
      console.log('====================================');
      console.log('Create custom tournaments with flexible user and participant counts');
      console.log('');
      console.log('📖 Usage:');
      console.log('  node create-60-player-tournament-custom.js [maxSlots] [participants]');
      console.log('  node create-60-player-tournament-custom.js cleanup');
      console.log('');
      console.log('📝 Examples:');
      console.log('  node create-60-player-tournament-custom.js 55 32    # 55 slots, 32 participants (23 spots available)');
      console.log('  node create-60-player-tournament-custom.js 100 16   # 100 slots, 16 participants (84 spots available)');
      console.log('  node create-60-player-tournament-custom.js 64 64    # 64 slots, 64 participants (full tournament)');
      console.log('  node create-60-player-tournament-custom.js cleanup  # Clean up test data');
      console.log('');
      console.log('⚡ Constraints:');
      console.log('  • Max slots: 4-200');
      console.log('  • Actual participants: 2, 4, 8, 16, 32, or 64 (powers of 2 for proper brackets)');
      console.log('  • Participants must not exceed max slots');
      console.log('');
      console.log('🎯 Features:');
      console.log('  • Your custom YouTube and SoundCloud tracks included');
      console.log('  • Proper submission metadata for playback');
      console.log('  • Test users with credentials: testuser001-XXX, password: password123');
      console.log('  • Creator login: ernesto.ortiz0012@gmail.com, password: Tennis.ie1');
      console.log('====================================\n');
      return;
    } else {
      const tournamentMaxSlots = parseInt(args[0]) || 64;
      const actualParticipants = parseInt(args[1]) || Math.min(32, tournamentMaxSlots);
      
      // Validation
      if (tournamentMaxSlots < 4 || tournamentMaxSlots > 200) {
        console.error('❌ Tournament max slots must be between 4 and 200');
        process.exit(1);
      }
      
      if (actualParticipants < 2 || actualParticipants > 64) {
        console.error('❌ Actual participants must be between 2 and 64 players');
        process.exit(1);
      }
      
      if (actualParticipants > tournamentMaxSlots) {
        console.error('❌ Actual participants cannot exceed tournament max slots');
        process.exit(1);
      }
      
      // Ensure bracket-friendly participant count
      const validSizes = [2, 4, 8, 16, 32, 64];
      if (!validSizes.includes(actualParticipants)) {
        console.error(`❌ Actual participants must be one of: ${validSizes.join(', ')} for proper bracket generation`);
        process.exit(1);
      }
      
      console.log(`🎯 Creating tournament: ${tournamentMaxSlots} total slots with ${actualParticipants} participants (${tournamentMaxSlots - actualParticipants} spots available)`);
      await generateCustomTournament(tournamentMaxSlots, actualParticipants);
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  generateCustomTournament,
  cleanupCustomData
};

// Usage examples:
// node create-60-player-tournament-custom.js cleanup                    // Clean up test data
// node create-60-player-tournament-custom.js 64 32                      // 32 participants from 64 total users  
// node create-60-player-tournament-custom.js 100 16                     // 16 participants from 100 total users
// node create-60-player-tournament-custom.js 50 32                      // 32 participants from 50 total users
// node create-60-player-tournament-custom.js 80                         // 60 participants from 80 total users (default participants) 