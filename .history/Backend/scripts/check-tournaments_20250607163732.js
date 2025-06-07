const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkTournaments() {
  console.log('🔍 Checking database connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    console.log('📡 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully');
    
    const db = client.db('musikmadness');
    
    console.log('\n🏆 Checking tournaments...');
    const tournaments = await db.collection('tournaments').find({status: 'upcoming'}).limit(5).toArray();
    console.log(`Found ${tournaments.length} upcoming tournaments:`);
    tournaments.forEach(t => {
      console.log(`  ID: ${t._id.toString()}`);
      console.log(`  Name: ${t.name}`);
      console.log(`  Participants: ${t.participants.length}`);
      console.log(`  Status: ${t.status}`);
      console.log('  ---');
    });
    
    // Also check for users
    console.log('\n👥 Checking users...');
    const users = await db.collection('users').find({}).limit(5).toArray();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`  ID: ${u._id.toString()}, Username: ${u.username}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    console.log('🔌 Closing connection...');
    await client.close();
  }
}

checkTournaments().catch(console.error);
