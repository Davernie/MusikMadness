// Load Test User Cleanup Script
// This script removes all test users created during load testing

const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB connection configuration
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musikmadness';

async function cleanupTestUsers() {
  let client;
  
  try {
    console.log('🧹 Starting load test user cleanup...');
    console.log(`📡 Connecting to MongoDB: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // Connect to MongoDB
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    
    console.log('✅ Connected to database');
    
    // Define patterns for test users created during load testing
    const testUserPatterns = [
      { email: { $regex: /^testuser_.*@loadtest\.com$/ } },          // Load test users
      { email: { $regex: /^loadtest_setup@test\.com$/ } },          // Setup test user
      { username: { $regex: /^testuser_.*/ } },                     // Test usernames
      { username: { $regex: /^loadtest_.*/ } },                     // Load test usernames
    ];
    
    // Count test users before cleanup
    let totalTestUsers = 0;
    for (const pattern of testUserPatterns) {
      const count = await db.collection('users').countDocuments(pattern);
      totalTestUsers += count;
      console.log(`📊 Found ${count} users matching pattern:`, pattern);
    }
    
    if (totalTestUsers === 0) {
      console.log('✨ No test users found! Database is already clean.');
      return;
    }
    
    console.log(`🎯 Total test users to remove: ${totalTestUsers}`);
    console.log('');
    
    // Ask for confirmation (in a real scenario)
    console.log('⚠️  This will permanently delete all test users created during load testing.');
    console.log('🔍 Proceeding with cleanup in 3 seconds...');
    
    // Wait 3 seconds to allow user to cancel if needed
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Remove test users
    let totalRemoved = 0;
    for (const pattern of testUserPatterns) {
      const result = await db.collection('users').deleteMany(pattern);
      if (result.deletedCount > 0) {
        console.log(`🗑️  Removed ${result.deletedCount} users with pattern:`, pattern);
        totalRemoved += result.deletedCount;
      }
    }
    
    console.log('');
    console.log(`✅ Cleanup completed! Removed ${totalRemoved} test users.`);
    
    // Show remaining user count
    const remainingUsers = await db.collection('users').countDocuments({});
    console.log(`📊 Remaining users in database: ${remainingUsers}`);
    
    // Optional: Also clean up any test submissions or other test data
    console.log('');
    console.log('🔍 Checking for test submissions...');
    
    const testSubmissions = await db.collection('submissions').countDocuments({
      $or: [
        { createdBy: { $regex: /^testuser_.*/ } },
        { 'user.email': { $regex: /^testuser_.*@loadtest\.com$/ } }
      ]
    });
    
    if (testSubmissions > 0) {
      console.log(`🎵 Found ${testSubmissions} test submissions`);
      const submissionResult = await db.collection('submissions').deleteMany({
        $or: [
          { createdBy: { $regex: /^testuser_.*/ } },
          { 'user.email': { $regex: /^testuser_.*@loadtest\.com$/ } }
        ]
      });
      console.log(`🗑️  Removed ${submissionResult.deletedCount} test submissions`);
    } else {
      console.log('✨ No test submissions found');
    }
    
    console.log('');
    console.log('🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🔗 Could not connect to MongoDB. Check your connection string.');
    } else if (error.name === 'MongoNetworkError') {
      console.error('🌐 Network error connecting to MongoDB. Is the database running?');
    } else if (error.name === 'MongoServerError' && error.code === 18) {
      console.error('🔐 Authentication failed. Check your MongoDB credentials.');
    }
    
    process.exit(1);
  } finally {
    // Always close the connection
    if (client) {
      await client.close();
      console.log('📡 Disconnected from MongoDB');
    }
  }
}

// Additional utility functions
async function showTestUserStats() {
  let client;
  
  try {
    console.log('📊 Analyzing test user statistics...');
    
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db();
    
    // Count different types of test users
    const loadTestUsers = await db.collection('users').countDocuments({
      email: { $regex: /^testuser_.*@loadtest\.com$/ }
    });
    
    const setupUsers = await db.collection('users').countDocuments({
      email: { $regex: /^loadtest_setup@test\.com$/ }
    });
    
    const allTestUsers = await db.collection('users').countDocuments({
      $or: [
        { email: { $regex: /^testuser_.*@loadtest\.com$/ } },
        { email: { $regex: /^loadtest_setup@test\.com$/ } },
        { username: { $regex: /^testuser_.*/ } },
        { username: { $regex: /^loadtest_.*/ } }
      ]
    });
    
    const totalUsers = await db.collection('users').countDocuments({});
    const realUsers = totalUsers - allTestUsers;
    
    console.log('📈 User Statistics:');
    console.log(`   🎭 Load test users: ${loadTestUsers}`);
    console.log(`   🔧 Setup test users: ${setupUsers}`);
    console.log(`   🧪 Total test users: ${allTestUsers}`);
    console.log(`   👥 Real users: ${realUsers}`);
    console.log(`   📊 Total users: ${totalUsers}`);
    
    if (allTestUsers > 0) {
      const percentage = ((allTestUsers / totalUsers) * 100).toFixed(1);
      console.log(`   📉 Test users represent ${percentage}% of database`);
    }
    
  } catch (error) {
    console.error('❌ Stats analysis failed:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--stats') || args.includes('-s')) {
    await showTestUserStats();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log('🧹 Load Test User Cleanup Script');
    console.log('');
    console.log('Usage:');
    console.log('  node cleanup-test-users.js           # Clean up all test users');
    console.log('  node cleanup-test-users.js --stats   # Show test user statistics');
    console.log('  node cleanup-test-users.js --help    # Show this help');
    console.log('');
    console.log('Environment Variables:');
    console.log('  MONGO_URI   # MongoDB connection string (default: mongodb://localhost:27017/musikmadness)');
  } else {
    await cleanupTestUsers();
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanupTestUsers, showTestUserStats };
