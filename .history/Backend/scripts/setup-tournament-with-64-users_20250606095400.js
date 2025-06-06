const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Update these with your actual MongoDB connection details
const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';
const dbName = process.env.DB_NAME || 'test'; // MongoDB Atlas default database name

const generateTestUsers = async (tournamentSize = 64) => {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
      const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const tournamentsCollection = db.collection('tournaments');
    
    // Check if test users already exist and clean them up
    console.log('Checking for existing test users...');
    const existingTestUsers = await usersCollection.find({
      username: { $regex: /^testuser\d+$/ }
    }).toArray();
    
    if (existingTestUsers.length > 0) {
      console.log(`Found ${existingTestUsers.length} existing test users. Cleaning up...`);
      await usersCollection.deleteMany({
        username: { $regex: /^testuser\d+$/ }
      });
      console.log('✅ Cleaned up existing test users');
    }
      // Also clean up any existing test tournaments
    const existingTestTournaments = await tournamentsCollection.find({
      name: { $regex: /\d+-Player Music Madness Championship/i }
    }).toArray();
    
    if (existingTestTournaments.length > 0) {      console.log(`Found ${existingTestTournaments.length} existing test tournaments. Cleaning up...`);
      await tournamentsCollection.deleteMany({
        name: { $regex: /\d+-Player Music Madness Championship/i }
      });
      console.log('✅ Cleaned up existing test tournaments');
    }
      // Generate test users following your exact structure
    const users = [];
    const hashedPassword = await bcrypt.hash('password123', 10); // Same password for all test users
    
    console.log(`Generating ${tournamentSize} test users...`);
      for (let i = 1; i <= tournamentSize; i++) {
      const paddedNumber = i.toString().padStart(3, '0'); // Changed to 3 digits to support larger tournaments
      
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
      // Create or update a tournament with these users
    console.log(`Creating tournament with ${tournamentSize} participants...`);
      // Use the existing creator account with the specific ID
    const creatorId = new ObjectId('6841818a6a43d9d7302da134');
    
    // Verify the creator exists
    const creator = await usersCollection.findOne({ _id: creatorId });
    
    if (!creator) {
      console.error('❌ Creator account with ID 6841818a6a43d9d7302da134 not found!');
      console.error('Please make sure the user ernesto.ortiz0012@gmail.com exists in the database.');
      throw new Error('Creator account not found');
    }
    
    console.log(`✅ Using existing creator account: ${creator.email || creator.username} (${creatorId})`);
    
    // Make sure the creator has the isCreator flag set
    if (!creator.isCreator) {
      await usersCollection.updateOne(
        { _id: creatorId },
        { 
          $set: { 
            isCreator: true,
            updatedAt: new Date()
          }
        }
      );
      console.log('✅ Updated creator account with isCreator flag');
    }
      const tournamentData = {
      name: `${tournamentSize}-Player Music Madness Championship`,
      game: "Electronic", // You can change this to match your preferred genre
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      maxPlayers: tournamentSize,
      description: `Epic tournament with ${tournamentSize} talented musicians competing for the ultimate prize! This is a test tournament with generated participants.`,
      creator: creatorId,
      participants: userIds, // All users as participants
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
    console.log(`Tournament Creator: ernesto.ortiz0012@gmail.com (${creatorId})`);
    console.log(`Total Participants: ${userIds.length}`);
    console.log(`Test User Login Details: username: testuser001-${tournamentSize.toString().padStart(3, '0')}, password: password123`);
    console.log(`Creator Login Details: email: ernesto.ortiz0012@gmail.com, password: Tennis.ie1`);
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
      name: { $regex: /\d+-Player Music Madness Championship/i }
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
    // Parse tournament size from command line arguments
    let tournamentSize = 64; // Default size
    
    const sizeArg = args.find(arg => arg.startsWith('--size='));
    if (sizeArg) {
      const size = parseInt(sizeArg.split('=')[1]);
      if (size && size > 0 && size <= 1000) { // Reasonable limits
        tournamentSize = size;
      } else {
        console.error('❌ Invalid tournament size. Please provide a number between 1 and 1000.');
        process.exit(1);
      }
    }
    
    if (args.includes('--force')) {
      console.log(`🧹 Force mode: Will clean up existing data first and create ${tournamentSize}-player tournament`);
    } else {
      console.log(`🎯 Creating ${tournamentSize}-player tournament...`);
    }
    
    generateTestUsers(tournamentSize);
  }
}

module.exports = {
  generateTestUsers,
  cleanupTestData
};
