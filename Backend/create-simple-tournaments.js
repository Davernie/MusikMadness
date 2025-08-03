const mongoose = require('mongoose');
const User = require('./dist/models/User').default;
const Tournament = require('./dist/models/Tournament').default;
require('dotenv').config();

console.log('Starting simplified mock data script...');

// Simplified tournament creation
async function createSimpleTournaments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the creator user
    const creatorUser = await User.findOne({ email: 'ernesto.ortiz0012@gmail.com' });
    if (!creatorUser) {
      throw new Error('Creator user not found!');
    }
    console.log(`Found creator user: ${creatorUser.username}`);
    
    // Get some existing users as participants
    const existingUsers = await User.find({}).limit(20);
    console.log(`Found ${existingUsers.length} existing users for participants`);
    
    const tournamentNames = [
      'Beat Battle Royale', 'Rhythm Rumble', 'Sonic Showdown', 'Melody Madness', 'Bass Drop Battle',
      'Harmonic Heist', 'Frequency Fight', 'Audio Arena', 'Sound Clash Supreme', 'Decibel Duel',
      'Waveform Wars', 'Track Takedown', 'Music Mayhem', 'Tempo Tournament', 'Beat Beast Battle'
    ];
    
    const musicGenres = ['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Techno', 'House', 'Trap', 'Dubstep', 'Ambient'];
    const statuses = ['Open', 'In Progress', 'Completed'];
    const types = ['artist', 'producer', 'aux'];
    
    // Create 15 tournaments
    for (let i = 0; i < 15; i++) {
      try {
        // Random dates
        const now = new Date();
        const startDate = new Date(now.getTime() + (Math.random() - 0.5) * 60 * 24 * 60 * 60 * 1000); // ±30 days
        const endDate = new Date(startDate.getTime() + (7 + Math.random() * 21) * 24 * 60 * 60 * 1000); // 7-28 days later
        
        // Random participants
        const maxParticipants = 8 + Math.floor(Math.random() * 17); // 8-24
        const numParticipants = 3 + Math.floor(Math.random() * Math.min(maxParticipants - 2, existingUsers.length - 1)); // 3 to max available
        const shuffled = [...existingUsers].sort(() => Math.random() - 0.5);
        const selectedParticipants = shuffled.slice(0, numParticipants);
        
        const tournamentData = {
          name: tournamentNames[i] || `Tournament ${i + 1}`,
          game: musicGenres[Math.floor(Math.random() * musicGenres.length)],
          type: types[Math.floor(Math.random() * types.length)],
          description: `A competitive music tournament featuring ${musicGenres[Math.floor(Math.random() * musicGenres.length)]} artists and producers.`,
          creator: creatorUser._id,
          startDate,
          endDate,
          maxPlayers: maxParticipants,
          participants: selectedParticipants.map(user => user._id),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          rules: ['Original compositions only', 'No copyrighted samples', 'Minimum 2 minutes length'],
          language: 'Any Language'
        };
        
        const tournament = new Tournament(tournamentData);
        await tournament.save();
        console.log(`✅ Created tournament: ${tournament.name} (${tournament.type}) with ${numParticipants} participants - Status: ${tournament.status}`);
        
      } catch (error) {
        console.error(`❌ Error creating tournament ${i + 1}:`, error.message);
      }
    }
    
    console.log('\n🎉 Mock tournament creation completed!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createSimpleTournaments();
