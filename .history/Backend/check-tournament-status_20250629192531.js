const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';

async function checkTournamentStatus() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔍 Checking tournament status...');
    
    const db = client.db('test');
    
    // Find the latest tournament
    const tournament = await db.collection('tournaments').findOne({}, { sort: { _id: -1 } });
    
    if (!tournament) {
      console.log('❌ No tournament found');
      return;
    }
    
    console.log('🏆 Tournament Details:');
    console.log('  - ID:', tournament._id.toString());
    console.log('  - Name:', tournament.name);
    console.log('  - Max Participants:', tournament.maxParticipants);
    console.log('  - Participants array length:', tournament.participants?.length || 0);
    console.log('  - Submissions array length:', tournament.submissions?.length || 0);
    console.log('  - Status:', tournament.status);
    
    // Check submissions collection
    const submissions = await db.collection('submissions').find({ 
      tournamentId: tournament._id 
    }).toArray();
    console.log('📁 Submissions in DB:', submissions.length);
    
    // Check test users
    const testUsers = await db.collection('users').find({ 
      username: { $regex: /^testuser/ } 
    }).toArray();
    console.log('👥 Test users created:', testUsers.length);
    
    // Check if tournament.participants contains user IDs
    if (tournament.participants && tournament.participants.length > 0) {
      console.log('🎯 Participant IDs:', tournament.participants.slice(0, 5));
    } else {
      console.log('⚠️  Tournament participants array is empty or missing!');
    }
    
    // Check if tournament.submissions contains submission IDs
    if (tournament.submissions && tournament.submissions.length > 0) {
      console.log('🎵 Submission IDs:', tournament.submissions.slice(0, 5));
    } else {
      console.log('⚠️  Tournament submissions array is empty or missing!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkTournamentStatus();
