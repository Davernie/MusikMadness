const mongoose = require('mongoose');
require('dotenv').config();

// Import the Tournament model
const Tournament = require('../dist/models/Tournament').default;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB for tournament type migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const migrateTournamentTypes = async () => {
  try {
    console.log('🔄 Starting tournament type migration...');
    
    // Find all tournaments that don't have a type field or have null/undefined type
    const tournamentsToUpdate = await Tournament.find({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: undefined }
      ]
    });

    console.log(`📊 Found ${tournamentsToUpdate.length} tournaments without type field`);

    if (tournamentsToUpdate.length === 0) {
      console.log('✅ No tournaments to migrate - all tournaments already have type field');
      return;
    }

    // Update all tournaments without type to be 'artist' tournaments
    const updateResult = await Tournament.updateMany(
      {
        $or: [
          { type: { $exists: false } },
          { type: null },
          { type: undefined }
        ]
      },
      {
        $set: { type: 'artist' }
      }
    );

    console.log(`✅ Migration completed successfully!`);
    console.log(`📈 Updated ${updateResult.modifiedCount} tournaments to 'artist' type`);

    // Verify the migration
    const artistTournaments = await Tournament.countDocuments({ type: 'artist' });
    const producerTournaments = await Tournament.countDocuments({ type: 'producer' });
    const totalTournaments = await Tournament.countDocuments();

    console.log('\n📊 Tournament type distribution after migration:');
    console.log(`   Artist tournaments: ${artistTournaments}`);
    console.log(`   Producer tournaments: ${producerTournaments}`);
    console.log(`   Total tournaments: ${totalTournaments}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await migrateTournamentTypes();
    console.log('\n🎉 Tournament type migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the migration
main();
