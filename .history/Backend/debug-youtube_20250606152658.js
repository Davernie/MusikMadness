const mongoose = require('mongoose');
require('dotenv').config();

console.log('🔍 Starting YouTube Debug Check...');
console.log('MongoDB URI available:', !!process.env.MONGODB_URI);

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness', {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    return false;
  }
};

const main = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.log('Cannot connect to database. Please check your MongoDB connection.');
    process.exit(1);
  }
  
  await checkYouTubeData();
  await mongoose.disconnect();
  console.log('🏁 Analysis complete, disconnected from database.');
};

const submissionSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  songTitle: String,
  songFilePath: String,
  r2Key: String,
  r2Url: String,
  originalFileName: String,
  mimetype: String,
  description: String,
  submittedAt: Date,
  streamingSource: String,
  youtubeUrl: String,
  youtubeVideoId: String,
  youtubeThumbnail: String,
  youtubeDuration: Number
}, { timestamps: true });

const tournamentSchema = new mongoose.Schema({
  name: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  generatedBracket: [mongoose.Schema.Types.Mixed],
  status: String
}, { timestamps: true });

const Submission = mongoose.model('Submission', submissionSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);

async function checkYouTubeData() {
  try {
    console.log('\n🎯 === YOUTUBE DATA VERIFICATION ===\n');
    
    // Get YouTube submissions
    const youtubeSubmissions = await Submission.find({ streamingSource: 'youtube' });
    
    console.log(`📊 Found ${youtubeSubmissions.length} YouTube submissions\n`);
    
    if (youtubeSubmissions.length === 0) {
      console.log('❌ No YouTube submissions found in database!');
      mongoose.disconnect();
      return;
    }
    
    // Analyze each YouTube submission
    for (let i = 0; i < youtubeSubmissions.length; i++) {
      const submission = youtubeSubmissions[i];
      console.log(`🎬 YouTube Submission ${i + 1}:`);
      console.log(`   ID: ${submission._id}`);
      console.log(`   Song Title: ${submission.songTitle}`);
      console.log(`   YouTube URL: ${submission.youtubeUrl}`);
      console.log(`   YouTube Video ID: ${submission.youtubeVideoId}`);
      console.log(`   YouTube Thumbnail: ${submission.youtubeThumbnail}`);
      console.log(`   YouTube Duration: ${submission.youtubeDuration}`);
      console.log(`   Tournament ID: ${submission.tournament}`);
      console.log(`   User ID: ${submission.user}`);
      console.log(`   Submitted At: ${submission.submittedAt}`);
      
      // Test if video ID is valid
      if (submission.youtubeVideoId) {
        const videoId = submission.youtubeVideoId;
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        console.log(`   🔗 Embed URL: ${embedUrl}`);
        console.log(`   🔗 Watch URL: ${watchUrl}`);
        
        // Test if video ID format is correct (should be 11 characters)
        if (videoId.length === 11) {
          console.log(`   ✅ Video ID format is valid (11 characters)`);
        } else {
          console.log(`   ❌ Video ID format is INVALID (${videoId.length} characters, should be 11)`);
        }
      } else {
        console.log(`   ❌ No YouTube Video ID stored!`);
      }
      
      console.log(''); // Empty line for spacing
    }
    
    // Check tournaments that contain YouTube submissions
    console.log('🏆 === TOURNAMENT ANALYSIS ===\n');
    
    const tournamentsWithYouTube = await Tournament.find({
      participants: { $in: youtubeSubmissions.map(s => s.user) }
    }).populate('participants', 'username');
    
    for (const tournament of tournamentsWithYouTube) {
      console.log(`🏆 Tournament: ${tournament.name} (ID: ${tournament._id})`);
      console.log(`   Status: ${tournament.status}`);
      console.log(`   Participants: ${tournament.participants.length}`);
      
      // Check if this tournament has generated bracket
      if (tournament.generatedBracket && tournament.generatedBracket.length > 0) {
        console.log(`   ✅ Has generated bracket with ${tournament.generatedBracket.length} matchups`);
        
        // Find matchups with YouTube submissions
        const matchupsWithYouTube = tournament.generatedBracket.filter(matchup => {
          const player1Id = matchup.player1?.participantId?.toString();
          const player2Id = matchup.player2?.participantId?.toString();
          
          return youtubeSubmissions.some(sub => 
            sub.user.toString() === player1Id || sub.user.toString() === player2Id
          );
        });
        
        console.log(`   🎬 Matchups with YouTube submissions: ${matchupsWithYouTube.length}`);
        
        // Show details of first YouTube matchup
        if (matchupsWithYouTube.length > 0) {
          const firstMatchup = matchupsWithYouTube[0];
          console.log(`   📋 First YouTube Matchup ID: ${firstMatchup.matchupId}`);
          console.log(`   📋 Round: ${firstMatchup.round}`);
          
          // Test URL that frontend would call
          const testUrl = `http://localhost:5000/api/tournaments/${tournament._id}/matchup/${firstMatchup.matchupId}/stream-urls`;
          console.log(`   🔗 Stream URLs endpoint: ${testUrl}`);
        }
      } else {
        console.log(`   ⚠️ No generated bracket found`);
      }
      
      console.log(''); // Empty line
    }
    
    mongoose.disconnect();
    console.log('✅ YouTube data analysis complete!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
    mongoose.disconnect();
  }
}
