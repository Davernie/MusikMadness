const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../src/models/User').default;
const Tournament = require('../src/models/Tournament').default;
const Submission = require('../src/models/Submission').default;

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const cleanupTestData = async () => {
  try {
    await connectDB();
    
    console.log('🧹 Cleaning up test tournament data...\n');
    
    // Find tournaments created by ernesto.ortiz0012@gmail.com
    const creator = await User.findOne({ email: 'ernesto.ortiz0012@gmail.com' });
    if (!creator) {
      console.log('Creator not found');
      return;
    }
    
    const testTournaments = await Tournament.find({ 
      creator: creator._id,
      name: { $regex: /test/i } // Find tournaments with "test" in the name
    });
    
    console.log(`Found ${testTournaments.length} test tournaments to clean up:`);
    
    for (const tournament of testTournaments) {
      console.log(`\n📋 Cleaning tournament: ${tournament.name} (${tournament._id})`);
      
      // Delete submissions for this tournament
      const submissionResult = await Submission.deleteMany({ tournament: tournament._id });
      console.log(`  ✓ Deleted ${submissionResult.deletedCount} submissions`);
      
      // Get participant IDs to delete fake users
      const participantIds = tournament.participants;
      
      // Delete fake users (but not the creator)
      const userResult = await User.deleteMany({ 
        _id: { $in: participantIds, $ne: creator._id }
      });
      console.log(`  ✓ Deleted ${userResult.deletedCount} fake users`);
      
      // Delete the tournament
      await Tournament.deleteOne({ _id: tournament._id });
      console.log(`  ✓ Deleted tournament`);
    }
    
    // Also clean up any orphaned fake users that might not be in tournaments
    const orphanedUsers = await User.find({
      email: { $regex: /@(gmail|yahoo|hotmail|outlook|music)\.com$/ },
      email: { $ne: 'ernesto.ortiz0012@gmail.com' },
      username: { $regex: /^(Cool|Epic|Fire|Wild|Sick|Dope|Fresh|Raw|Lit|Beast)/ }
    });
    
    if (orphanedUsers.length > 0) {
      console.log(`\n🧹 Found ${orphanedUsers.length} orphaned fake users to clean up`);
      const orphanedUserIds = orphanedUsers.map(u => u._id);
      
      // Delete submissions by orphaned users
      const orphanedSubmissions = await Submission.deleteMany({ 
        participant: { $in: orphanedUserIds }
      });
      console.log(`  ✓ Deleted ${orphanedSubmissions.deletedCount} orphaned submissions`);
      
      // Delete orphaned users
      const orphanedUserResult = await User.deleteMany({ 
        _id: { $in: orphanedUserIds }
      });
      console.log(`  ✓ Deleted ${orphanedUserResult.deletedCount} orphaned fake users`);
    }
    
    console.log('\n🎉 Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Handle command line usage
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('\n🧹 Test Tournament Cleanup');
    console.log('\nThis script removes all test tournaments and fake users created by create-test-tournament.js');
    console.log('\nUsage:');
    console.log('  node scripts/cleanup-test-tournaments.js');
    console.log('\nWhat it cleans:');
    console.log('  • Test tournaments (containing "test" in name)');
    console.log('  • Fake users created for tournaments');
    console.log('  • Submissions from test tournaments');
    console.log('  • Orphaned fake users');
    console.log('\nNote: This will NOT delete ernesto.ortiz0012@gmail.com or real users.');
    process.exit(0);
  }
  
  cleanupTestData();
}

module.exports = { cleanupTestData };
