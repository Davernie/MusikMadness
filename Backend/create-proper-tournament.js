const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';

async function createProperTournament() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🎯 Creating a proper tournament with correct structure...');
    
    const db = client.db('test');
    
    // Clean up the broken tournament first
    console.log('🧹 Cleaning up broken tournament...');
    await db.collection('tournaments').deleteMany({
      name: { $regex: /64-Slot|Custom|Test/ }
    });
    await db.collection('submissions').deleteMany({
      songTitle: { $regex: /Epic Music Track|Blue Vibes/ }
    });
    await db.collection('users').deleteMany({
      username: { $regex: /^testuser/ }
    });
    console.log('✅ Cleanup complete');
    
    // Create test users first
    console.log('👥 Creating 32 test users...');
    const users = [];
    const hashedPassword = '$2a$10$abcd1234567890abcd1234567890abcd1234567890abcd123456'; // bcrypt hash for 'password123'
    
    for (let i = 1; i <= 32; i++) {
      const paddedNumber = i.toString().padStart(3, '0');
      
      const user = {
        username: `testuser${paddedNumber}`,
        email: `testuser${i}@example.com`,
        password: hashedPassword,
        bio: `Test user ${i} - Ready to compete with fire tracks! 🔥`,
        location: `Music City ${i}`,
        website: i % 5 === 0 ? `https://testuser${i}.music` : "",
        genres: i % 3 === 0 ? ['Electronic'] : i % 3 === 1 ? ['Hip Hop'] : ['Pop'],
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
          tournamentsCreated: 0,
          followers: Math.floor(Math.random() * 2000)
        },
        isCreator: true, // Allow all test users to create tournaments
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
    const userResult = await db.collection('users').insertMany(users);
    const userIds = Object.values(userResult.insertedIds);
    console.log(`✅ Created ${userIds.length} test users`);
    
    // Get the creator (your account)
    const creatorId = new ObjectId('684b1d5fbfb9d6119ba9a211');
    const creator = await db.collection('users').findOne({ _id: creatorId });
    
    if (!creator) {
      console.error('❌ Creator account not found!');
      throw new Error('Creator account with ID 684b1d5fbfb9d6119ba9a211 not found');
    }
    
    console.log(`✅ Using creator: ${creator.email || creator.username}`);
    
    // Create the tournament with proper structure
    console.log('🏆 Creating tournament with proper structure...');
    
    const tournamentData = {
      name: "32-Player Electronic Music Championship",
      game: "Electronic", // Music genre
      type: "artist",
      startDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      maxPlayers: 64, // Maximum tournament capacity
      description: "🎵 Epic 32-player ELECTRONIC music tournament! Battle it out with the hottest electronic beats and prove you're the ultimate EDM champion! 🏆\\n\\nFeatures custom YouTube and SoundCloud submissions showcasing the best in House, Techno, Dubstep, Trance and more!",
      creator: creatorId,
      participants: userIds, // All 32 test users are participants
      status: "Open", // Correct status with capital O
      rules: [
        "Submit your best electronic music track",
        "Only YouTube and SoundCloud links accepted",
        "Track must be your original work or remix",
        "No explicit content allowed",
        "Voting is anonymous and fair"
      ],
      language: "English",
      bracketSize: 64, // Tournament bracket size
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const tournamentResult = await db.collection('tournaments').insertOne(tournamentData);
    const tournamentId = tournamentResult.insertedId;
    console.log(`✅ Created tournament with ID: ${tournamentId}`);
    
    // Create submissions
    console.log('📝 Creating submissions...');
    const submissions = [];
    
    const YOUTUBE_URL = 'https://www.youtube.com/watch?v=UjpbQ1OWMPE';
    const SOUNDCLOUD_URL = 'https://soundcloud.com/yungkaai/blue';
    
    const youtubeVideoId = YOUTUBE_URL.match(/[?&]v=([^&]+)/)?.[1] || 'UjpbQ1OWMPE';
    const soundcloudInfo = SOUNDCLOUD_URL.match(/soundcloud\.com\/([^\/]+)\/([^\/]+)/);
    const soundcloudUsername = soundcloudInfo?.[1] || 'yungkaai';
    const soundcloudTrack = soundcloudInfo?.[2] || 'blue';
    
    // Create submissions for each user
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const isYouTube = i % 3 === 0; // Every 3rd user gets YouTube
      
      let submission;
      
      if (isYouTube) {
        submission = {
          tournament: tournamentId,
          user: userId,
          songTitle: `Electronic Anthem ${i + 1}`,
          streamingSource: "youtube",
          youtubeUrl: YOUTUBE_URL,
          youtubeVideoId: youtubeVideoId,
          youtubeThumbnail: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
          youtubeDuration: 240 + (i * 10),
          description: `Epic electronic track from testuser${(i + 1).toString().padStart(3, '0')}!`,
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        };
      } else {
        submission = {
          tournament: tournamentId,
          user: userId,
          songTitle: `Blue Electronic ${i + 1}`,
          streamingSource: "soundcloud",
          soundcloudUrl: SOUNDCLOUD_URL,
          soundcloudTrackId: `${soundcloudUsername}_${soundcloudTrack}_${i}`,
          soundcloudUsername: soundcloudUsername,
          soundcloudDuration: 180 + (i * 5),
          description: `Amazing electronic SoundCloud track from testuser${(i + 1).toString().padStart(3, '0')}!`,
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        };
      }
      
      submissions.push(submission);
    }
    
    // Insert submissions
    const submissionResult = await db.collection('submissions').insertMany(submissions);
    const submissionIds = Object.values(submissionResult.insertedIds);
    console.log(`✅ Created ${submissionIds.length} submissions`);
    
    // Update tournament with submission IDs
    await db.collection('tournaments').updateOne(
      { _id: tournamentId },
      { 
        $set: { 
          submissions: submissionIds,
          updatedAt: new Date()
        }
      }
    );
    
    // Update user stats
    await db.collection('users').updateOne(
      { _id: creatorId },
      { 
        $inc: { 'stats.tournamentsCreated': 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    await db.collection('users').updateMany(
      { _id: { $in: userIds } },
      { 
        $inc: { 'stats.tournamentsEntered': 1 },
        $set: { updatedAt: new Date() }
      }
    );
    
    console.log('✅ Updated user statistics');
    
    // Verify the tournament
    const finalTournament = await db.collection('tournaments').findOne({ _id: tournamentId });
    
    console.log('\\n🎉 PROPER TOURNAMENT CREATED! 🎉');
    console.log('============================================');
    console.log(`🏆 Tournament ID: ${tournamentId}`);
    console.log(`👑 Tournament Name: ${finalTournament.name}`);
    console.log(`📊 Max Players: ${finalTournament.maxPlayers}`);
    console.log(`👥 Current Participants: ${finalTournament.participants?.length || 0}`);
    console.log(`📻 Submissions: ${finalTournament.submissions?.length || 0}`);
    console.log(`📈 Available Spots: ${finalTournament.maxPlayers - (finalTournament.participants?.length || 0)}`);
    console.log(`🔥 Status: ${finalTournament.status} (CORRECT!)`);
    console.log(`🎵 Genre: ${finalTournament.game}`);
    console.log(`👤 Creator: ${creator.email || creator.username}`);
    console.log(`🔐 Test User Credentials: testuser001-032, password: password123`);
    console.log(`📱 Access at: http://localhost:5173/tournaments/${tournamentId}`);
    console.log('============================================');
    
  } catch (error) {
    console.error('❌ Error creating proper tournament:', error);
    throw error;
  } finally {
    await client.close();
  }
}

createProperTournament();
