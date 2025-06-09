// Load Test User Cleanup Script (Backend Version)
// This script removes all test users created during load testing
// Run from the Backend directory to use local .env file

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function cleanupLoadTestUsers() {
  let client;
  
  try {
    console.log('🧹 Starting load test user cleanup...');    console.log('📍 Running from Backend directory');
    
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!MONGO_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.error('💡 Make sure you have a .env file in the Backend directory');
      process.exit(1);
    }
    
    console.log(`📡 Connecting to MongoDB...`);
    
    // Connect to MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connected to database');
    
    // Show current user stats first
    console.log('');
    console.log('📊 Current database statistics:');
    
    const totalUsers = await db.collection('users').countDocuments({});
    console.log(`   👥 Total users: ${totalUsers}`);
    
    // Count test users by different patterns
    const loadTestUsers = await db.collection('users').countDocuments({
      email: { $regex: /^testuser_.*@loadtest\.com$/ }
    });
    
    const setupUsers = await db.collection('users').countDocuments({
      email: { $regex: /^loadtest_setup@test\.com$/ }
    });
    
    const testUsernameUsers = await db.collection('users').countDocuments({
      username: { $regex: /^testuser_.*/ }
    });
    
    console.log(`   🎭 Load test email users: ${loadTestUsers}`);
    console.log(`   🔧 Setup test users: ${setupUsers}`);
    console.log(`   🧪 Test username users: ${testUsernameUsers}`);
    
    const totalTestUsers = loadTestUsers + setupUsers + testUsernameUsers;
    
    if (totalTestUsers === 0) {
      console.log('');
      console.log('✨ No test users found! Database is already clean.');
      console.log('🎉 No cleanup needed.');
      return;
    }
    
    console.log(`   🎯 Total test users to remove: ${totalTestUsers}`);
    
    const realUsers = totalUsers - totalTestUsers;
    const testPercentage = ((totalTestUsers / totalUsers) * 100).toFixed(1);
    console.log(`   👤 Real users: ${realUsers}`);
    console.log(`   📉 Test users: ${testPercentage}% of database`);
    
    console.log('');
    console.log('⚠️  This will permanently delete all test users created during load testing.');
    console.log('🕒 Starting cleanup in 3 seconds... (Press Ctrl+C to cancel)');
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('');
    console.log('🗑️  Removing test users...');
    
    // Remove users with load test emails
    if (loadTestUsers > 0) {
      const result1 = await db.collection('users').deleteMany({
        email: { $regex: /^testuser_.*@loadtest\.com$/ }
      });
      console.log(`   ✅ Removed ${result1.deletedCount} load test email users`);
    }
    
    // Remove setup test users
    if (setupUsers > 0) {
      const result2 = await db.collection('users').deleteMany({
        email: { $regex: /^loadtest_setup@test\.com$/ }
      });
      console.log(`   ✅ Removed ${result2.deletedCount} setup test users`);
    }
    
    // Remove users with test usernames (but be careful not to remove real users)
    if (testUsernameUsers > 0) {
      const result3 = await db.collection('users').deleteMany({
        $and: [
          { username: { $regex: /^testuser_.*/ } },
          { 
            $or: [
              { email: { $regex: /^testuser_.*@loadtest\.com$/ } },
              { email: { $regex: /^loadtest_.*@.*\.com$/ } }
            ]
          }
        ]
      });
      console.log(`   ✅ Removed ${result3.deletedCount} test username users`);
    }
    
    console.log('');
    console.log('🧹 Checking for related test data...');
    
    // Clean up test submissions if any
    const testSubmissions = await db.collection('submissions').deleteMany({
      $or: [
        { 'user.email': { $regex: /^testuser_.*@loadtest\.com$/ } },
        { 'user.username': { $regex: /^testuser_.*/ } },
        { 'user.email': { $regex: /^loadtest_setup@test\.com$/ } }
      ]
    });
    
    if (testSubmissions.deletedCount > 0) {
      console.log(`   🎵 Removed ${testSubmissions.deletedCount} test submissions`);
    }
    
    // Clean up test tracks if any
    const testTracks = await db.collection('tracks').deleteMany({
      $or: [
        { createdBy: { $regex: /^testuser_.*/ } },
        { 'artist': { $regex: /^TestUser.*/ } }
      ]
    });
    
    if (testTracks.deletedCount > 0) {
      console.log(`   🎼 Removed ${testTracks.deletedCount} test tracks`);
    }
    
    console.log('');
    console.log('📊 Final database statistics:');
    const finalUsers = await db.collection('users').countDocuments({});
    const finalSubmissions = await db.collection('submissions').countDocuments({});
    const finalTracks = await db.collection('tracks').countDocuments({});
    
    console.log(`   👥 Total users: ${finalUsers} (was ${totalUsers})`);
    console.log(`   🎵 Total submissions: ${finalSubmissions}`);
    console.log(`   🎼 Total tracks: ${finalTracks}`);
    
    const removedUsers = totalUsers - finalUsers;
    console.log('');
    console.log(`🎉 Cleanup completed! Removed ${removedUsers} test users.`);
    console.log('✨ Database is now clean and ready for production use.');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🔗 Could not connect to MongoDB. Check your MONGO_URI in .env file.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('🌐 Network error. Is MongoDB running and accessible?');
    } else if (error.name === 'MongoServerError' && error.code === 18) {
      console.error('🔐 Authentication failed. Check your MongoDB credentials in .env file.');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 Disconnected from MongoDB');
    }
  }
}

// Run the cleanup
if (require.main === module) {
  cleanupLoadTestUsers().catch(console.error);
}

module.exports = { cleanupLoadTestUsers };
