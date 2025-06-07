const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting database check...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness')
  .then(() => {
    console.log('✅ Connected to MongoDB');
    checkSubmissions();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

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

const Submission = mongoose.model('Submission', submissionSchema);

async function checkSubmissions() {
  try {
    console.log('\n=== CHECKING SUBMISSIONS ===');
    
    const totalSubmissions = await Submission.countDocuments();
    console.log(`Total submissions in database: ${totalSubmissions}`);
    
    if (totalSubmissions === 0) {
      console.log('No submissions found in database.');
      mongoose.disconnect();
      return;
    }
    
    // Get all submissions
    const submissions = await Submission.find().limit(10);
    
    console.log('\n--- Recent Submissions ---');
    submissions.forEach((submission, index) => {
      console.log(`\nSubmission ${index + 1}:`);
      console.log(`  ID: ${submission._id}`);
      console.log(`  Song Title: ${submission.songTitle}`);
      console.log(`  Streaming Source: ${submission.streamingSource}`);
      
      if (submission.streamingSource === 'youtube') {
        console.log(`  YouTube URL: ${submission.youtubeUrl}`);
        console.log(`  YouTube Video ID: ${submission.youtubeVideoId}`);
        console.log(`  YouTube Thumbnail: ${submission.youtubeThumbnail}`);
        console.log(`  YouTube Duration: ${submission.youtubeDuration}`);
      } else {
        console.log(`  File Path: ${submission.songFilePath}`);
        console.log(`  R2 Key: ${submission.r2Key}`);
        console.log(`  R2 URL: ${submission.r2Url}`);
        console.log(`  Original Filename: ${submission.originalFileName}`);
        console.log(`  Mimetype: ${submission.mimetype}`);
      }
      
      console.log(`  Submitted At: ${submission.submittedAt}`);
    });
    
    // Count by streaming source
    const youtubeCount = await Submission.countDocuments({ streamingSource: 'youtube' });
    const uploadCount = await Submission.countDocuments({ streamingSource: 'upload' });
    
    console.log('\n--- Streaming Source Breakdown ---');
    console.log(`YouTube submissions: ${youtubeCount}`);
    console.log(`Upload submissions: ${uploadCount}`);
    
    mongoose.disconnect();
    console.log('\nDatabase check complete.');
    
  } catch (error) {
    console.error('Error checking submissions:', error);
    mongoose.disconnect();
  }
}
