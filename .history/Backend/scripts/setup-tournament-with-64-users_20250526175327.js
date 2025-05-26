const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

// Update these with your actual MongoDB connection details
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'musikmadness'; // Update with your actual database name

const generateTestUsers = async () => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const tournamentsCollection = db.collection('tournaments');
    
    // Generate 64 test users following your exact structure
    const users = [];
    const hashedPassword = await bcrypt.hash('password123', 10); // Same password for all test users
    
    console.log('Generating 64 test users...');
    
    for (let i = 1; i <= 64; i++) {
      const paddedNumber = i.toString().padStart(2, '0');
      
      const user = {
        username: `testuser${paddedNumber}`,
        email: `testuser${i}@example.com`,
        password: hashedPassword,
        bio: `I'm test user number ${i}. Love making music and competing in tournaments!`,
        location: `City ${i}`,
        website: i % 5 === 0 ? `https://testuser${i}.com` : "",
        genres: [], // Empty array as per your structure
        socials: {
          soundcloud: i % 4 === 0 ? `testuser${i}` : "",
          instagram: i % 3 === 0 ? `testuser${i}` : "",
          twitter: i % 6 === 0 ? `@testuser${i}` : "",
          spotify: i % 7 === 0 ? `testuser${i}` : ""
        },
        stats: {
          tournamentsEntered: Math.floor(Math.random() * 10),
          tournamentsWon: Math.floor(Math.random() * 3),
          tournamentsCreated: Math.floor(Math.random() * 2),
          followers: Math.floor(Math.random() * 1000)
        },
        isCreator: i <= 10 ? true : false, // First 10 users are creators
        followers: [], // Empty array as per your structure
        following: [], // Empty array as per your structure
        createdAt: new Date(),
        updatedAt: new Date(),
        __v: 0
        // Note: profilePicture will be handled separately if needed
      };
      
      users.push(user);
    }
    
    // Insert all users
    console.log('Inserting users into database...');
    const userResult = await usersCollection.insertMany(users);
    const userIds = Object.values(userResult.insertedIds);
    console.log(`✅ Successfully created ${userIds.length} test users`);
    
    // Create or update a tournament with these 64 users
    console.log('Creating tournament with 64 participants...');
    
    // Use the first user as the creator
    const creatorId = userIds[0];
    
    const tournamentData = {
      name: "64-Player Music Madness Championship",
      game: "Electronic", // You can change this to match your preferred genre
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      maxPlayers: 64,
      description: "Epic tournament with 64 talented musicians competing for the ultimate prize! This is a test tournament with generated participants.",
      creator: creatorId,
      participants: userIds, // All 64 users as participants
      status: "upcoming",
      rules: [
        "Original tracks only",
        "3-minute maximum length", 
        "High quality audio required (minimum 320kbps)",
        "No explicit content",
        "Must be your own composition",
        "Submissions due 24 hours before tournament start"
      ],
      language: "English",
      createdAt: new Date(),
      updatedAt: new Date(),
      __v: 0
      // Note: coverImage will be handled separately if needed
    };
    
    const tournamentResult = await tournamentsCollection.insertOne(tournamentData);
    console.log(`✅ Created tournament with ID: ${tournamentResult.insertedId}`);
    
    // Update the creator's stats
    await usersCollection.updateOne(
      { _id: creatorId },
      { 
        $inc: { 
          'stats.tournamentsCreated': 1 
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );
    
    // Update all participants' stats (tournamentsEntered)
    await usersCollection.updateMany(
      { _id: { $in: userIds } },
      { 
        $inc: { 
          'stats.tournamentsEntered': 1 
        },
        $set: {
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ Updated user statistics');
    
    console.log('\n🎉 Setup Complete!');
    console.log('====================================');
    console.log(`Tournament ID: ${tournamentResult.insertedId}`);
    console.log(`Tournament Creator: ${users[0].username} (${creatorId})`);
    console.log(`Total Participants: ${userIds.length}`);
    console.log(`User Login Details: username: testuser01-64, password: password123`);
    console.log('====================================');
    
    return {
      tournamentId: tournamentResult.insertedId,
      userIds: userIds,
      creatorId: creatorId
    };
    
  } catch (error) {
    console.error('❌ Error setting up tournament and users:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
};

// Add function to clean up test data (optional)
const cleanupTestData = async () => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB for cleanup');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const tournamentsCollection = db.collection('tournaments');
    
    // Delete test users
    const userDeleteResult = await usersCollection.deleteMany({
      username: { $regex: /^testuser\d+$/ }
    });
    
    // Delete test tournaments
    const tournamentDeleteResult = await tournamentsCollection.deleteMany({
      name: { $regex: /64-Player Music Madness Championship/i }
    });
    
    console.log(`🗑️ Deleted ${userDeleteResult.deletedCount} test users`);
    console.log(`🗑️ Deleted ${tournamentDeleteResult.deletedCount} test tournaments`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await client.close();
  }
};

// Run the script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    cleanupTestData();
  } else {
    generateTestUsers();
  }
}

module.exports = {
  generateTestUsers,
  cleanupTestData
};
