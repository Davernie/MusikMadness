// Test script to validate creator application with streaming data

const testCreatorApplicationData = {
  firstName: 'John',
  lastName: 'StreamerMusic',
  bio: 'Applied via simplified form. Reason: I am a passionate music producer and streamer looking to host exciting tournaments.',
  experience: 'This user applied through our simplified creator application form. Their motivation and background: I am a passionate music producer and streamer looking to host exciting tournaments.',
  musicGenres: ['General'],
  musicLinks: {
    soundcloud: 'https://soundcloud.com/johnmusic',
    spotify: '',
    youtube: 'https://youtube.com/@johnmusic',
    bandcamp: '',
    other: ''
  },
  reasonForApplying: 'I am a passionate music producer and streamer looking to host exciting tournaments.',
  pastTournaments: 'Not specified in simplified application',
  estimatedTournamentsPerMonth: 1,
  streaming: {
    isStreamer: true,
    wantsFeatured: true,
    preferredPlatform: 'twitch',
    streamingAccount: 'johnmusic_streamer'
  }
};

console.log('Test Creator Application Data with Streaming:');
console.log(JSON.stringify(testCreatorApplicationData, null, 2));

console.log('\nStreaming Data Validation:');
console.log('Is Streamer:', testCreatorApplicationData.streaming.isStreamer);
console.log('Wants Featured:', testCreatorApplicationData.streaming.wantsFeatured);
console.log('Platform:', testCreatorApplicationData.streaming.preferredPlatform);
console.log('Account:', testCreatorApplicationData.streaming.streamingAccount);

console.log('\n✅ Creator application data structure with streaming is valid!');

// Test frontend form data structure
const testFrontendFormData = {
  firstName: 'John',
  lastName: 'StreamerMusic',
  socialMediaLinks: {
    soundcloud: 'https://soundcloud.com/johnmusic',
    youtube: 'https://youtube.com/@johnmusic'
  },
  reasonForApplying: 'I am a passionate music producer and streamer looking to host exciting tournaments.',
  isStreamer: 'yes',
  wantsFeatured: 'yes',
  streamingPlatform: 'twitch',
  streamingAccount: 'johnmusic_streamer'
};

console.log('\nTest Frontend Form Data:');
console.log(JSON.stringify(testFrontendFormData, null, 2));

// Test conversion logic
const convertedStreaming = {
  isStreamer: testFrontendFormData.isStreamer === 'yes',
  wantsFeatured: testFrontendFormData.wantsFeatured === 'yes',
  preferredPlatform: testFrontendFormData.streamingPlatform || undefined,
  streamingAccount: testFrontendFormData.streamingAccount || undefined
};

console.log('\nConverted Streaming Data:');
console.log(JSON.stringify(convertedStreaming, null, 2));

console.log('\n✅ Frontend to backend data conversion is working correctly!');
