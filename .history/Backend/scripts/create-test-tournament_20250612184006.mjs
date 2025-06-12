import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

// Get current file directory for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import models - we'll need to use dynamic imports since they're TypeScript
let User, Tournament, Submission;

const loadModels = async () => {
  try {
    // Dynamic import for TypeScript/ES6 modules
    const userModule = await import('../dist/models/User.js');
    const tournamentModule = await import('../dist/models/Tournament.js');
    const submissionModule = await import('../dist/models/Submission.js');
    
    // Handle both default exports and named exports
    User = userModule.default || userModule.User;
    Tournament = tournamentModule.default || tournamentModule.Tournament;
    Submission = submissionModule.default || submissionModule.Submission;
    
    // Verify models loaded correctly
    if (!User || !Tournament || !Submission) {
      throw new Error('Failed to load one or more models');
    }
    
    console.log('✓ Models loaded successfully');
  } catch (error) {
    console.error('Error loading models:', error.message);
    console.log('Make sure to build the TypeScript first: npm run build');
    process.exit(1);
  }
};

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Fake data generators
const generateFakeUsername = () => {
  const adjectives = ['Cool', 'Epic', 'Fire', 'Wild', 'Sick', 'Dope', 'Fresh', 'Raw', 'Lit', 'Beast'];
  const nouns = ['Producer', 'Artist', 'Musician', 'Creator', 'Rapper', 'Singer', 'DJ', 'Beatmaker', 'Composer', 'Performer'];
  const numbers = Math.floor(Math.random() * 999) + 1;
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${numbers}`;
};

const generateFakeEmail = (username) => {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'music.com'];
  return `${username.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
};

const generateFakeBio = () => {
  const bios = [
    "Making beats since day one 🎵",
    "Hip-hop producer from the underground",
    "Bringing that fire to the music scene 🔥",
    "Creating vibes and good music",
    "Producer | Artist | Dreamer",
    "Music is my passion and my life",
    "Beats, rhymes, and everything fine",
    "Underground artist making waves",
    "Creating soundscapes for the soul",
    "Music producer with a vision"
  ];
  return bios[Math.floor(Math.random() * bios.length)];
};

const generateFakeTrackTitle = () => {
  const adjectives = ['Dark', 'Bright', 'Heavy', 'Smooth', 'Wild', 'Deep', 'Raw', 'Fresh', 'Hot', 'Cold'];
  const nouns = ['Nights', 'Dreams', 'Vibes', 'Beats', 'Flow', 'Sound', 'Wave', 'Storm', 'Fire', 'Ice'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

const generateFakeYouTubeUrl = () => {
  // Generate fake YouTube video IDs (11 characters)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  let videoId = '';
  for (let i = 0; i < 11; i++) {
    videoId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
};

const generateFakeSoundCloudUrl = () => {
  const artists = ['producer123', 'beatmaker456', 'musiccreator789', 'soundartist', 'beatdrop'];
  const tracks = ['new-beat', 'fire-track', 'underground-vibe', 'latest-creation', 'demo-track'];
  return `https://soundcloud.com/${artists[Math.floor(Math.random() * artists.length)]}/${tracks[Math.floor(Math.random() * tracks.length)]}`;
};

// Create fake users
const createFakeUsers = async (count) => {
  console.log(`Creating ${count} fake users...`);
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const username = generateFakeUsername();
    const email = generateFakeEmail(username);
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
      const user = new User({
      username,
      email,
      password: hashedPassword,
      isEmailVerified: true,
      bio: generateFakeBio(),
      location: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Atlanta'][Math.floor(Math.random() * 5)],
      socials: {
        soundcloud: Math.random() > 0.5 ? `https://soundcloud.com/${username.toLowerCase()}` : undefined,
        instagram: Math.random() > 0.5 ? `https://instagram.com/${username.toLowerCase()}` : undefined,
        twitter: Math.random() > 0.5 ? `https://twitter.com/${username.toLowerCase()}` : undefined,
      }
    });
    
    try {
      const savedUser = await user.save();
      users.push(savedUser);
      console.log(`✓ Created user: ${username}`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`! Skipped duplicate user: ${username}`);
        i--; // Try again with a different username
      } else {
        console.error(`Error creating user ${username}:`, error.message);
      }
    }
  }
  
  return users;
};

// Create tournament
const createTournament = async (creatorEmail, tournamentSize, tournamentName) => {
  console.log(`Creating tournament: ${tournamentName} with ${tournamentSize} participants...`);
  
  // Find the creator
  const creator = await User.findOne({ email: creatorEmail });
  if (!creator) {
    throw new Error(`Creator with email ${creatorEmail} not found`);
  }
  
  // Create fake users for participants
  const participants = await createFakeUsers(tournamentSize);
  
  // Create tournament
  const tournament = new Tournament({
    name: tournamentName,
    description: `A test tournament with ${tournamentSize} participants to showcase the bracket system and matchup functionality.`,
    creator: creator._id,
    participants: participants.map(p => p._id),
    maxPlayers: tournamentSize,
    game: 'Hip Hop', // genre
    status: 'upcoming',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    language: 'English',
    rules: [
      'Submit original tracks only',
      'No explicit content',
      'Maximum track length: 5 minutes',
      'Voting opens after submission deadline'
    ]
  });
  
  const savedTournament = await tournament.save();
  console.log(`✓ Tournament created: ${savedTournament._id}`);
  
  return { tournament: savedTournament, participants };
};

// Create fake submissions
const createFakeSubmissions = async (tournament, participants) => {
  console.log(`Creating fake submissions for ${participants.length} participants...`);
  
  for (const participant of participants) {
    const useYouTube = Math.random() > 0.5;
    const trackUrl = useYouTube ? generateFakeYouTubeUrl() : generateFakeSoundCloudUrl();
    
    const submission = new Submission({
      tournament: tournament._id,
      participant: participant._id,
      trackTitle: generateFakeTrackTitle(),
      trackUrl: trackUrl,
      platform: useYouTube ? 'youtube' : 'soundcloud',
      status: 'approved',
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
    });
    
    try {
      await submission.save();
      console.log(`✓ Created submission for ${participant.username}: ${submission.trackTitle}`);
    } catch (error) {
      console.error(`Error creating submission for ${participant.username}:`, error.message);
    }
  }
};

// Begin tournament (change status to ongoing and generate bracket)
const beginTournament = async (tournamentId) => {
  console.log('Beginning tournament and generating bracket...');
  
  try {
    // Since we can't easily make API calls from here, just update the tournament status manually
    const tournament = await Tournament.findById(tournamentId);
    tournament.status = 'ongoing';
    await tournament.save();
    console.log('✓ Tournament status updated to ongoing');
    return tournament;
  } catch (error) {
    console.error('Error beginning tournament:', error.message);
    throw error;
  }
};

// Main execution function
const createTestTournament = async () => {
  try {
    // Load the compiled models first
    await loadModels();
    
    await connectDB();
    
    // Get command line arguments
    const args = process.argv.slice(2);
    const tournamentSize = parseInt(args[0]) || 8;
    const tournamentName = args[1] || `Test Tournament ${tournamentSize} Players`;
    const shouldBegin = args[2] === 'true' || false;
    
    console.log(`\n🎵 Creating test tournament with ${tournamentSize} participants...`);
    console.log(`Tournament name: ${tournamentName}`);
    console.log(`Auto-begin: ${shouldBegin}\n`);
    
    // Validate tournament size (should be power of 2 for proper bracketing)
    const validSizes = [2, 4, 8, 16, 32, 64];
    if (!validSizes.includes(tournamentSize)) {
      console.warn(`⚠️  Warning: ${tournamentSize} is not a power of 2. Bracket may not display perfectly.`);
      console.log(`Recommended sizes: ${validSizes.join(', ')}`);
    }
    
    // Create tournament with fake participants
    const { tournament, participants } = await createTournament(
      'ernesto.ortiz0012@gmail.com',
      tournamentSize,
      tournamentName
    );
    
    // Create fake submissions
    await createFakeSubmissions(tournament, participants);
    
    // Optionally begin the tournament
    if (shouldBegin) {
      await beginTournament(tournament._id);
    }
    
    console.log('\n🎉 Test tournament created successfully!');
    console.log(`Tournament ID: ${tournament._id}`);
    console.log(`Participants: ${participants.length}`);
    console.log(`Status: ${shouldBegin ? 'ongoing' : 'upcoming'}`);
    console.log(`\nView in browser: http://localhost:5173/tournaments/${tournament._id}`);
    
    if (!shouldBegin) {
      console.log('\n💡 To begin the tournament (generate bracket), run:');
      console.log(`node scripts/create-test-tournament.js ${tournamentSize} "${tournamentName}" true`);
    }
    
  } catch (error) {
    console.error('Error creating test tournament:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
  }
};

// Handle command line usage
// Fix for Windows path handling in ES modules
const isMainModule = import.meta.url.startsWith('file:') && 
  (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || 
   import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/')));

if (isMainModule) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('\n🎵 Test Tournament Creator');
    console.log('\nUsage:');
    console.log('  node scripts/create-test-tournament.mjs [size] [name] [begin]');
    console.log('\nParameters:');
    console.log('  size   - Number of participants (default: 8)');
    console.log('  name   - Tournament name (default: "Test Tournament X Players")');
    console.log('  begin  - Auto-begin tournament: true/false (default: false)');
    console.log('\nExamples:');
    console.log('  node scripts/create-test-tournament.mjs 16');
    console.log('  node scripts/create-test-tournament.mjs 32 "Big Test Tournament"');
    console.log('  node scripts/create-test-tournament.mjs 8 "Quick Test" true');
    console.log('\nRecommended sizes: 2, 4, 8, 16, 32, 64');
    process.exit(0);
  }
  
  createTestTournament();
}

export { createTestTournament, createFakeUsers, createTournament };
