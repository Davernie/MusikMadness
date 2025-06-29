const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';

async function fixTournamentStatus() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('🔧 Fixing tournament status and details...');
    
    const db = client.db('test');
    
    // Find the latest tournament
    const tournament = await db.collection('tournaments').findOne({}, { sort: { _id: -1 } });
    
    if (!tournament) {
      console.log('❌ No tournament found');
      return;
    }
    
    console.log('🏆 Tournament ID:', tournament._id.toString());
    console.log('Current status:', tournament.status);
    console.log('Max Players:', tournament.maxPlayers);
    
    // Update the tournament to have the correct status
    await db.collection('tournaments').updateOne(
      { _id: tournament._id },
      {
        $set: {
          status: "Open", // Set to Open status
          updatedAt: new Date()
        }
      }
    );
    
    console.log('✅ Updated tournament status to "Open"');
    
    // Verify the update
    const updatedTournament = await db.collection('tournaments').findOne({ _id: tournament._id });
    
    console.log('\n🎉 TOURNAMENT STATUS FIXED! 🎉');
    console.log('============================================');
    console.log(`🏆 Tournament ID: ${updatedTournament._id}`);
    console.log(`👑 Tournament Name: ${updatedTournament.name}`);
    console.log(`📊 Max Players: ${updatedTournament.maxPlayers}`);
    console.log(`👥 Current Participants: ${updatedTournament.participants?.length || 0}`);
    console.log(`📻 Submissions: ${updatedTournament.submissions?.length || 0}`);
    console.log(`📈 Available Spots: ${updatedTournament.maxPlayers - (updatedTournament.participants?.length || 0)}`);
    console.log(`🔥 Status: ${updatedTournament.status} ✅`);
    console.log(`🎵 Genre: ${updatedTournament.game}`);
    console.log(`👤 Creator ID: ${updatedTournament.creator}`);
    console.log(`📱 Access at: http://localhost:5173/tournaments/${updatedTournament._id}`);
    console.log('============================================');
    
    // Also check creator details
    const creator = await db.collection('users').findOne({ _id: updatedTournament.creator });
    if (creator) {
      console.log(`👤 Creator: ${creator.email || creator.username} ✅`);
    } else {
      console.log('❌ Creator not found in database!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing tournament status:', error);
    throw error;
  } finally {
    await client.close();
  }
}

fixTournamentStatus();
