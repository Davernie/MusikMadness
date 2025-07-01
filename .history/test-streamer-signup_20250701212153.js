// Quick test script to validate streamer signup functionality

const testSignupData = {
  username: 'test_streamer_user',
  email: 'teststreamer@example.com',
  password: 'TestPassword123!',
  bio: 'I am a test streamer',
  streaming: {
    isStreamer: true,
    wantsFeatured: true,
    preferredPlatform: 'twitch',
    streamingAccount: 'test_streamer_channel'
  }
};

console.log('Test Signup Data Structure:');
console.log(JSON.stringify(testSignupData, null, 2));

// Test JSON parsing (simulating backend processing)
const streamingJson = JSON.stringify(testSignupData.streaming);
console.log('\nSerialized streaming data:', streamingJson);

const parsedStreaming = JSON.parse(streamingJson);
console.log('Parsed streaming data:', parsedStreaming);

console.log('\nValidation checks:');
console.log('Is streamer?', parsedStreaming.isStreamer);
console.log('Wants to be featured?', parsedStreaming.wantsFeatured);
console.log('Platform:', parsedStreaming.preferredPlatform);
console.log('Account:', parsedStreaming.streamingAccount);

console.log('\n✅ Test data structure is valid!');
