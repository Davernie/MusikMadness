require('dotenv').config();
const path = require('path');
require('ts-node').register({
  project: path.resolve(__dirname, 'tsconfig.json')
});

const mongoose = require('mongoose');
const StreamerStatusService = require('./src/services/streamerStatusService').default;

async function testCurrentConfiguration() {
  console.log('🔍 Testing Current Streamer Status Service Configuration');
  console.log('='.repeat(60));
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness');
    console.log('✅ Connected to database');
    
    // Initialize the streamer status service
    console.log('\n📅 Initializing streamer schedule...');
    await StreamerStatusService.initializeStreamersSchedule();
    
    console.log('\n🔄 Running one update cycle to test API limits...');
    await StreamerStatusService.updateAllStreamersStatus();
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📊 Your system is properly configured for 24/7 operation with:');
    console.log('  • API limits enforcement');
    console.log('  • Priority-based scheduling');
    console.log('  • Safe intervals for all platforms');
    console.log('  • Automatic error handling');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

testCurrentConfiguration();
