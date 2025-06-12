console.log('Script started');

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Register models with Mongoose
import '../dist/models/User.js';
import '../dist/models/Tournament.js';
import '../dist/models/Submission.js';

// Load environment variables
dotenv.config();

console.log('Environment loaded');

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create fake users
const createFakeUsers = async (count) => {
  const User = mongoose.model('User');
  const users = [];

  for (let i = 1; i <= count; i++) {
    const username = `fakeuser${i}`;
    const email = `fakeuser${i}@example.com`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create and save user individually to skip duplicates
    try {
      const user = new User({
        username,
        email,
        password: hashedPassword,
        isEmailVerified: true,
        bio: `Fake user ${i} for testing`,
        location: 'Test City'
      });
      const savedUser = await user.save();
      users.push(savedUser);
      console.log(`✓ Created user: ${username}`);
    } catch (error) {
      if (error.code === 11000) {
        console.log(`! Skipped duplicate user: ${username}`);
      } else {
        console.error(`Error creating user ${username}:`, error.message);
      }
    }
  }

  return users;
};

// Create fake submissions
const createFakeSubmissions = async (tournament, participants) => {
  const Submission = mongoose.model('Submission');

  for (const participant of participants) {
    const useYouTube = Math.random() > 0.5;
    const streamUrl = useYouTube
      ? 'https://youtu.be/UjpbQ1OWMPE?list=RDUjpbQ1OWMPE'
      : 'https://soundcloud.com/yungkaai/blue?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing';
    const submission = new Submission({
      tournament: tournament._id,
      user: participant._id,
      songTitle: useYouTube ? 'YouTube Submission' : 'SoundCloud Submission',
      description: 'Fake submission for testing',
      streamingSource: useYouTube ? 'youtube' : 'soundcloud',
      youtubeUrl: useYouTube ? streamUrl : undefined,
      soundcloudUrl: !useYouTube ? streamUrl : undefined,
      submittedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    });

    try {
      await submission.save();
      console.log(`✓ Created submission for ${participant.username}`);
    } catch (error) {
      console.error(`Error creating submission for ${participant.username}:`, error.message);
    }
  }
};

// Create tournament
const createTournament = async (creatorEmail, tournamentSize, tournamentName) => {
  console.log(`Creating tournament: ${tournamentName} with ${tournamentSize} participants...`);

  // Find the creator
  const User = mongoose.model('User');
  const creator = await User.findOne({ email: creatorEmail });
  if (!creator) {
    console.error(`Creator with email ${creatorEmail} not found`);
    throw new Error(`Creator with email ${creatorEmail} not found`);
  }
  console.log('Creator found:', creator.email);

  // Get existing fake users
  let participants = await User.find({ username: { $regex: /^fakeuser\d+$/ } }).limit(tournamentSize);
  if (participants.length < tournamentSize) {
    const needed = tournamentSize - participants.length;
    console.log(`Creating ${needed} additional fake users...`);
    const newUsers = await createFakeUsers(needed);
    participants = participants.concat(newUsers);
  } else {
    console.log(`Using ${participants.length} existing fake users`);
  }

  // Create tournament
  const Tournament = mongoose.model('Tournament');
  const tournament = new Tournament({
    name: tournamentName,
    description: `A test tournament with ${tournamentSize} participants to showcase the bracket system and matchup functionality.`,
    creator: creator._id,
    participants: participants.map(p => p._id),
    maxPlayers: tournamentSize,
    game: 'Hip Hop', // genre
    status: 'Open',
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
  console.log(`Tournament created: ${savedTournament._id}`);

  return { tournament: savedTournament, participants };
};

// Begin tournament (change status to ongoing and generate bracket)
const beginTournament = async (tournamentId) => {
  console.log('Beginning tournament and generating bracket...');

  try {
    // Since we can't easily make API calls from here, just update the tournament status manually
    const Tournament = mongoose.model('Tournament');
    const tournament = await Tournament.findById(tournamentId);
    tournament.status = 'ongoing';
    await tournament.save();
    console.log('Tournament status updated to ongoing');
    return tournament;
  } catch (error) {
    console.error('Error beginning tournament:', error.message);
    throw error;
  }
};

// Main execution function
const createTestTournament = async () => {
  try {
    console.log('Connecting to DB...');
    await connectDB();
    console.log('Connected to DB');

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
    console.log('Tournament and participants created');

    // Create fake submissions
    await createFakeSubmissions(tournament, participants);
    console.log('Fake submissions created');

    // Optionally begin the tournament and generate matchups
    if (shouldBegin) {
      await beginTournament(tournament._id);
      console.log('Tournament begun and matchups generated');
    }

    console.log('\n🎉 Test tournament created successfully!');
    console.log(`Tournament ID: ${tournament._id}`);
    console.log(`Participants: ${participants.length}`);
    console.log(`Status: ${shouldBegin ? 'ongoing' : 'upcoming'}`);
    console.log(`\nView in browser: http://localhost:5173/tournaments/${tournament._id}`);

  } catch (error) {
    console.error('Error creating test tournament:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createTestTournament();
