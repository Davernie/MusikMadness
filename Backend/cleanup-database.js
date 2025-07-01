const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness';

async function cleanupDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Get collection names to check what exists
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📋 Available collections:', collectionNames);
    
    // Collections to clean up
    const collectionsToClean = [
      'competitors',
      'matchups', 
      'tracks',
      'votes'
    ];
    
    console.log('\n🧹 Starting database cleanup...\n');
    
    for (const collectionName of collectionsToClean) {
      if (collectionNames.includes(collectionName)) {
        const collection = db.collection(collectionName);
        
        // Get count before deletion
        const countBefore = await collection.countDocuments();
        console.log(`📊 ${collectionName}: ${countBefore} documents found`);
        
        if (countBefore > 0) {
          // Delete all documents
          const result = await collection.deleteMany({});
          console.log(`🗑️  ${collectionName}: Deleted ${result.deletedCount} documents`);
        } else {
          console.log(`✅ ${collectionName}: Already empty`);
        }
      } else {
        console.log(`⚠️  ${collectionName}: Collection doesn't exist`);
      }
    }
    
    console.log('\n✅ Database cleanup completed!');
    
    // Show final counts
    console.log('\n📊 Final collection counts:');
    for (const collectionName of collectionsToClean) {
      if (collectionNames.includes(collectionName)) {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        console.log(`   ${collectionName}: ${count} documents`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupDatabase().catch(console.error); 