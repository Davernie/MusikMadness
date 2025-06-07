const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting script...');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

const tournamentSchema = new mongoose.Schema({
  name: String,
  maxParticipants: Number,
  submissionDeadline: Date,
  tournamentStart: Date,
  status: String,
  bracket: mongoose.Schema.Types.Mixed,
  submissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Submission' }]
});

const submissionSchema = new mongoose.Schema({
  songTitle: String,
  audioType: String,
  streamingSource: String,
  youtubeUrl: String,
  youtubeVideoId: String,
  youtubeThumbnail: String,
  youtubeDuration: Number,
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Tournament = mongoose.model('Tournament', tournamentSchema);
const Submission = mongoose.model('Submission', submissionSchema);

async function debugTournaments() {
  console.log('🔍 Starting Tournament Debug Check...');
  
  try {
    // Find tournaments with YouTube submissions
    const tournamentsWithYouTube = await Tournament.find({
      $or: [
        { _id: '6842eb726247ee0127e6656c' },
        { _id: '6842f7d26247ee0127e6662d' }
      ]
    }).populate('submissions');
    
    console.log(`\n🎯 === TOURNAMENT ANALYSIS ===`);
    console.log(`📊 Found ${tournamentsWithYouTube.length} tournaments`);
    
    for (const tournament of tournamentsWithYouTube) {
      console.log(`\n🏆 Tournament: ${tournament.name}`);
      console.log(`   ID: ${tournament._id}`);
      console.log(`   Status: ${tournament.status}`);
      console.log(`   Submissions: ${tournament.submissions.length}`);
      console.log(`   Max Participants: ${tournament.maxParticipants}`);
      
      // Count YouTube submissions
      const youtubeSubmissions = tournament.submissions.filter(s => s.audioType === 'youtube');
      console.log(`   YouTube Submissions: ${youtubeSubmissions.length}`);
      
      // Check bracket structure
      if (tournament.bracket) {
        console.log(`\n📋 Bracket Structure:`);
        console.log(`   Type: ${typeof tournament.bracket}`);
        
        if (Array.isArray(tournament.bracket)) {
          console.log(`   Bracket Array Length: ${tournament.bracket.length}`);
          
          // Look for matchups in bracket
          tournament.bracket.forEach((round, roundIndex) => {
            console.log(`   Round ${roundIndex + 1}:`);
            if (Array.isArray(round)) {
              round.forEach((matchup, matchupIndex) => {
                console.log(`     Matchup ${matchupIndex + 1}:`, matchup);
              });
            } else {
              console.log(`     Round data:`, round);
            }
          });
        } else {
          console.log(`   Bracket Object Keys:`, Object.keys(tournament.bracket));
          console.log(`   Bracket Structure:`, JSON.stringify(tournament.bracket, null, 2));
        }
      } else {
        console.log(`   ❌ No bracket found`);
      }
      
      console.log(`\n📝 Submission Details:`);
      tournament.submissions.forEach((submission, index) => {
        console.log(`   ${index + 1}. ${submission.songTitle} (${submission.audioType})`);
        if (submission.audioType === 'youtube') {
          console.log(`      Video ID: ${submission.youtubeVideoId}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n🏁 Analysis complete, disconnected from database.');
    mongoose.disconnect();
  }
}

debugTournaments();
