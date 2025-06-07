const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkTournaments() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('musikmadness');
    const tournaments = await db.collection('tournaments').find({status: 'upcoming'}).limit(5).toArray();
    console.log('Available upcoming tournaments:');
    tournaments.forEach(t => {
      console.log('ID:', t._id.toString(), 'Name:', t.name, 'Participants:', t.participants.length);
    });
    
    // Also check for users
    const users = await db.collection('users').find({}).limit(5).toArray();
    console.log('\nAvailable users:');
    users.forEach(u => {
      console.log('ID:', u._id.toString(), 'Username:', u.username);
    });
  } finally {
    await client.close();
  }
}

checkTournaments();
