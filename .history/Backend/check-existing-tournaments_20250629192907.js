const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';

async function checkExistingTournaments() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔍 Checking existing tournament structures...');
    
    const db = client.db('test');
    
    // Find all tournaments (not just test ones)
    const allTournaments = await db.collection('tournaments').find({}).sort({ _id: -1 }).limit(5).toArray();
    
    console.log(`Found ${allTournaments.length} tournaments:`);
    
    allTournaments.forEach((tournament, index) => {
      console.log(`\n${index + 1}. Tournament: ${tournament.name}`);
      console.log(`   - ID: ${tournament._id}`);
      console.log(`   - Creator: ${tournament.creator}`);
      console.log(`   - Status: ${tournament.status}`);
      console.log(`   - Max Participants: ${tournament.maxParticipants}`);
      console.log(`   - Participants: ${tournament.participants?.length || 0}`);
      console.log(`   - Type: ${tournament.type}`);
      console.log(`   - Game: ${tournament.game}`);
    });
    
    // Get a good working tournament to see its full structure
    const workingTournament = allTournaments.find(t => 
      t.status === 'open' || 
      (t.participants && t.participants.length > 0 && !t.name.includes('64-Slot'))
    );
    
    if (workingTournament) {
      console.log('\n📋 Sample working tournament structure:');
      console.log(JSON.stringify(workingTournament, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkExistingTournaments();
