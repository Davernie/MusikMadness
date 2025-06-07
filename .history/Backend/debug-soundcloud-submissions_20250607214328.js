const mongoose = require('mongoose');
const Submission = require('./dist/models/Submission').default;

async function checkSoundCloudSubmissions() {
  try {
    console.log('Attempting to connect to MongoDB...');
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/musikmadness');
    console.log('✓ Connected to MongoDB');
    
    console.log('Querying submissions...');
    // Find all submissions and log their data
    const submissions = await Submission.find({})
      .select('songTitle user streamingSource soundcloudTrackId soundcloudUrl soundcloudArtwork youtubeVideoId audioType')
      .populate('user', 'username');
    
    console.log(`✓ Found ${submissions.length} submissions:`);
    
    if (submissions.length === 0) {
      console.log('No submissions found in database');
      return;
    }
    
    submissions.forEach((submission, index) => {
      console.log(`\nSubmission ${index + 1}:`);
      console.log('  ID:', submission._id.toString());
      console.log('  Title:', submission.songTitle);
      console.log('  User:', submission.user?.username || 'Unknown');
      console.log('  streamingSource:', submission.streamingSource);
      console.log('  audioType:', submission.audioType);
      console.log('  soundcloudTrackId:', submission.soundcloudTrackId);
      console.log('  soundcloudUrl:', submission.soundcloudUrl);
      console.log('  soundcloudArtwork:', submission.soundcloudArtwork);
      console.log('  youtubeVideoId:', submission.youtubeVideoId);
    });
    
    // Look specifically for submissions that might be SoundCloud
    const possibleSoundcloud = submissions.filter(s => 
      s.soundcloudTrackId || 
      s.soundcloudUrl || 
      s.songTitle?.toLowerCase().includes('soundcloud') ||
      s.songTitle?.toLowerCase().includes('soundlocud')
    );
    
    console.log(`\n✓ Found ${possibleSoundcloud.length} possible SoundCloud submissions:`);
    possibleSoundcloud.forEach((submission, index) => {
      console.log(`\nPossible SoundCloud ${index + 1}:`);
      console.log('  ID:', submission._id.toString());
      console.log('  Title:', submission.songTitle);
      console.log('  streamingSource:', submission.streamingSource);
      console.log('  soundcloudTrackId:', submission.soundcloudTrackId);
      console.log('  soundcloudUrl:', submission.soundcloudUrl);
    });
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('\n✓ Disconnected from MongoDB');
    } catch (error) {
      console.error('✗ Error disconnecting:', error.message);
    }
  }
}

console.log('Starting SoundCloud submissions debug script...');
checkSoundCloudSubmissions();
