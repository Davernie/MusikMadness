const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';

async function fixTournamentParticipants() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔧 Fixing tournament participants and submissions...');
    
    const db = client.db('test');
    
    // Find the latest tournament
    const tournament = await db.collection('tournaments').findOne({}, { sort: { _id: -1 } });
    
    if (!tournament) {
      console.log('❌ No tournament found');
      return;
    }
    
    console.log('🏆 Tournament ID:', tournament._id.toString());
    
    // Find all test users
    const testUsers = await db.collection('users').find({ 
      username: { $regex: /^testuser/ } 
    }).toArray();
    
    console.log('👥 Found', testUsers.length, 'test users');
    
    // Create submissions for each test user
    const submissions = [];
    const userIds = testUsers.map(user => user._id);
    
    // Custom tracks
    const YOUTUBE_URL = 'https://www.youtube.com/watch?v=UjpbQ1OWMPE';
    const SOUNDCLOUD_URL = 'https://soundcloud.com/yungkaai/blue';
    
    // Extract YouTube video ID
    const youtubeVideoId = YOUTUBE_URL.match(/[?&]v=([^&]+)/)?.[1] || 'UjpbQ1OWMPE';
    
    // Extract SoundCloud info
    const soundcloudInfo = SOUNDCLOUD_URL.match(/soundcloud\.com\/([^\/]+)\/([^\/]+)/);
    const soundcloudUsername = soundcloudInfo?.[1] || 'yungkaai';
    const soundcloudTrack = soundcloudInfo?.[2] || 'blue';
    
    // Create submissions for each user
    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i];
      const isYouTube = i % 3 === 0; // Every 3rd user gets YouTube, others get SoundCloud
      
      let submission;
      
      if (isYouTube) {
        submission = {
          tournament: tournament._id,
          user: user._id,
          songTitle: `Epic Music Track ${i + 1}`,
          streamingSource: "youtube",
          youtubeUrl: YOUTUBE_URL,
          youtubeVideoId: youtubeVideoId,
          youtubeThumbnail: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
          youtubeDuration: 240 + (i * 10), // Vary duration slightly
          description: `Epic YouTube track for ${user.username}!`,
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        };
      } else {
        submission = {
          tournament: tournament._id,
          user: user._id,
          songTitle: `Blue Vibes ${i + 1}`,
          streamingSource: "soundcloud",
          soundcloudUrl: SOUNDCLOUD_URL,
          soundcloudTrackId: `${soundcloudUsername}_${soundcloudTrack}_${i}`,
          soundcloudUsername: soundcloudUsername,
          soundcloudDuration: 180 + (i * 5), // Vary duration slightly
          description: `Amazing SoundCloud track from ${user.username}!`,
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          __v: 0
        };
      }
      
      submissions.push(submission);
    }
    
    // Insert all submissions
    console.log('📝 Creating', submissions.length, 'submissions...');
    const submissionResult = await db.collection('submissions').insertMany(submissions);
    const submissionIds = Object.values(submissionResult.insertedIds);
    
    console.log('✅ Created', submissionIds.length, 'submissions');
    
    // Update the tournament with participants and submissions
    console.log('🔄 Updating tournament with participants and submissions...');
    
    await db.collection('tournaments').updateOne(
      { _id: tournament._id },
      {
        $set: {
          participants: userIds,
          submissions: submissionIds,
          maxParticipants: 64, // Set proper maxParticipants
          status: 'registration', // Set status
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ Tournament updated successfully!');
    
    // Verify the update
    const updatedTournament = await db.collection('tournaments').findOne({ _id: tournament._id });
    
    console.log('\n🎉 TOURNAMENT FIX COMPLETE! 🎉');
    console.log('============================================');
    console.log(`🏆 Tournament ID: ${tournament._id}`);
    console.log(`👑 Tournament Name: ${updatedTournament.name}`);
    console.log(`📊 Max Participants: ${updatedTournament.maxParticipants}`);
    console.log(`👥 Current Participants: ${updatedTournament.participants?.length || 0}`);
    console.log(`📻 Submissions: ${updatedTournament.submissions?.length || 0}`);
    console.log(`📱 Access at: http://localhost:5173/tournaments/${tournament._id}`);
    console.log('============================================');
    
  } catch (error) {
    console.error('❌ Error fixing tournament:', error);
    throw error;
  } finally {
    await client.close();
  }
}

fixTournamentParticipants();
