const mongoose = require('mongoose');
require('dotenv').config();

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness';
    console.log('Attempting to connect to MongoDB...');
    console.log('URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in log
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully for migration');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
};

// Migration script to update tournament status values
const migrateTournamentStatus = async () => {
  try {
    await connectDB();
    
    console.log('Starting tournament status migration...');
    
    // Get the Tournament collection directly
    const db = mongoose.connection.db;
    const tournamentsCollection = db.collection('tournaments');
    
    // Update upcoming -> Open
    const upcomingResult = await tournamentsCollection.updateMany(
      { status: 'upcoming' },
      { $set: { status: 'Open' } }
    );
    console.log(`Updated ${upcomingResult.modifiedCount} tournaments from 'upcoming' to 'Open'`);
    
    // Update ongoing -> In Progress
    const ongoingResult = await tournamentsCollection.updateMany(
      { status: 'ongoing' },
      { $set: { status: 'In Progress' } }
    );
    console.log(`Updated ${ongoingResult.modifiedCount} tournaments from 'ongoing' to 'In Progress'`);
    
    // Update completed -> Completed
    const completedResult = await tournamentsCollection.updateMany(
      { status: 'completed' },
      { $set: { status: 'Completed' } }
    );
    console.log(`Updated ${completedResult.modifiedCount} tournaments from 'completed' to 'Completed'`);
    
    // Verify the changes
    const statusCounts = await tournamentsCollection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('\nCurrent status distribution after migration:');
    statusCounts.forEach(item => {
      console.log(`${item._id}: ${item.count} tournaments`);
    });
    
    // Check for any remaining old status values
    const oldStatusCount = await tournamentsCollection.countDocuments({
      status: { $in: ['upcoming', 'ongoing', 'completed'] }
    });
    
    if (oldStatusCount > 0) {
      console.log(`\nWARNING: ${oldStatusCount} tournaments still have old status values!`);
      const remainingOldStatuses = await tournamentsCollection.find({
        status: { $in: ['upcoming', 'ongoing', 'completed'] }
      }, { _id: 1, status: 1, name: 1 }).toArray();
      
      console.log('Tournaments with old status values:');
      remainingOldStatuses.forEach(tournament => {
        console.log(`- ${tournament.name} (${tournament._id}): ${tournament.status}`);
      });
    } else {
      console.log('\n✅ Migration completed successfully! All tournaments now use new status values.');
    }
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the migration
migrateTournamentStatus();
