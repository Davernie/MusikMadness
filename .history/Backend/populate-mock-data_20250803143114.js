const mongoose = require('mongoose');
const User = require('./src/models/User');
const Tournament = require('./src/models/Tournament');
const Submission = require('./src/models/Submission');
require('dotenv').config();

// Mock data arrays
const musicGenres = [
  'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'Reggae', 
  'Country', 'R&B', 'Dubstep', 'House', 'Techno', 'Ambient', 'Trap', 
  'Lo-fi', 'Synthwave', 'Indie', 'Alternative', 'Metal', 'Punk'
];

const tournamentNames = [
  'Beat Battle Royale',
  'Rhythm Rumble',
  'Sonic Showdown',
  'Melody Madness',
  'Bass Drop Battle',
  'Harmonic Heist',
  'Frequency Fight',
  'Audio Arena',
  'Sound Clash Supreme',
  'Decibel Duel',
  'Waveform Wars',
  'Track Takedown',
  'Music Mayhem',
  'Tempo Tournament',
  'Beat Beast Battle',
  'Sonic Supremacy',
  'Rhythm Revolution',
  'Audio Apocalypse',
  'Sound Storm',
  'Melody Meltdown'
];

const usernames = [
  'BeatMaster2024', 'SynthWizard', 'BassDropper', 'MelodyMaker', 'RhythmRider',
  'SonicSorcerer', 'AudioArtist', 'FrequencyFox', 'WaveformWarrior', 'TempoTitan',
  'HarmonicHero', 'DecibelDemon', 'TrackTamer', 'SoundSage', 'VibeVanguard',
  'GrooveGuru', 'EchoElite', 'LoopLegend', 'MixMaster', 'TuneTornado',
  'BeatBoxBandit', 'SynthSamurai', 'BassBooster', 'DrumDynamo', 'ChordChampion',
  'RiffRanger', 'NoteNinja', 'PulsePhantom', 'SampleSlayer', 'ClefCrusader',
  'AmplifyAce', 'ReverbRebel', 'FilterPhenom', 'DistortionDuke', 'CompressorKing',
  'EQEmperor', 'LimiterLord', 'DelayDragon', 'ChorusChief', 'FlangerForce',
  'PhaserPro', 'TremoloTiger', 'WahWarrior', 'GainGiant', 'VolumeViper'
];

const firstNames = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Avery', 'Riley', 'Quinn',
  'Sage', 'Rowan', 'Phoenix', 'River', 'Sky', 'Eden', 'Nova', 'Luna',
  'Kai', 'Zoe', 'Leo', 'Maya', 'Eli', 'Aria', 'Max', 'Ivy', 'Jude',
  'Ruby', 'Finn', 'Sage', 'Blake', 'Nova', 'Reid', 'Zara', 'Cole', 'Luna'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

const bioTemplates = [
  'Passionate music producer with 5+ years of experience in electronic music.',
  'Hip-hop enthusiast and beat maker from the underground scene.',
  'Classically trained musician exploring modern electronic soundscapes.',
  'Bedroom producer crafting dreamy lo-fi beats and ambient textures.',
  'Bass-heavy trap producer with a love for hard-hitting 808s.',
  'Synthwave artist bringing retro-futuristic vibes to the modern era.',
  'Multi-instrumentalist blending organic and electronic elements.',
  'DJ and producer specializing in high-energy dance music.',
  'Experimental sound artist pushing the boundaries of audio design.',
  'Singer-songwriter turned electronic music creator.',
  'Jazz fusion meets electronic - creating unique hybrid compositions.',
  'Minimalist producer focusing on atmospheric and ambient soundscapes.',
  'Punk rock musician exploring electronic and industrial sounds.',
  'World music enthusiast incorporating global rhythms into modern beats.',
  'Studio engineer turned producer with a passion for clean mixes.'
];

const socialHandles = [
  'soundcloud_user_', 'insta_music_', 'twitter_beats_', 'spotify_artist_',
  'youtube_channel_', 'twitch_stream_', 'kick_live_'
];

const tournamentDescriptions = [
  'A fierce competition where only the most innovative beats survive. Bring your A-game and prepare for an epic musical showdown.',
  'Electronic music producers battle it out in this high-energy tournament. Show us your skills and claim the crown.',
  'Hip-hop heads unite! This tournament celebrates the art of beat making and lyrical prowess.',
  'From ambient to aggressive, all genres welcome in this diverse musical competition.',
  'Lo-fi meets high energy in this unique tournament format. Chill vibes, competitive spirit.',
  'Bass lovers rejoice! This tournament is all about those earth-shaking low frequencies.',
  'Synthwave and retro-electronic artists compete for digital supremacy.',
  'Experimental sounds and innovative production techniques take center stage.',
  'Classic meets modern in this fusion of traditional and electronic elements.',
  'Underground artists get their moment to shine in this community-focused tournament.',
  'Fast-paced competition for producers who can create magic under pressure.',
  'Collaborative tournament where remixing and reinterpretation are encouraged.',
  'Genre-bending competition that celebrates musical diversity and creativity.',
  'Technical prowess meets artistic vision in this advanced producer tournament.',
  'Community celebration of music featuring artists from all skill levels.'
];

const rules = [
  ['Original compositions only', 'No copyrighted samples', 'Minimum 2 minutes length'],
  ['Creative use of samples encouraged', 'No explicit content', 'High quality audio required'],
  ['Collaboration allowed', 'Must include provided sample pack', 'Maximum 4 minutes length'],
  ['Live performance elements bonus points', 'Genre must match tournament theme', 'Professional mixing required'],
  ['Remix of provided track', 'Creative interpretation encouraged', 'Submit stems with final mix']
];

// Helper function to generate random date
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to get random number in range
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function createMockUsers(count) {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = getRandom(firstNames);
    const lastName = getRandom(lastNames);
    const username = usernames[i] || `${firstName}${lastName}${getRandomInt(100, 999)}`;
    
    const userData = {
      username,
      email: `${username.toLowerCase()}@example.com`,
      googleId: `fake_google_id_${i}`,
      authProvider: 'google',
      isEmailVerified: true,
      loginAttempts: 0,
      firstName,
      lastName,
      bio: getRandom(bioTemplates),
      location: `City ${getRandomInt(1, 50)}, State`,
      website: Math.random() > 0.5 ? `https://${username.toLowerCase()}.com` : '',
      genres: [getRandom(musicGenres), getRandom(musicGenres)].filter((v, i, a) => a.indexOf(v) === i),
      socials: {
        soundcloud: Math.random() > 0.5 ? `${socialHandles[0]}${getRandomInt(1, 999)}` : '',
        instagram: Math.random() > 0.5 ? `${socialHandles[1]}${getRandomInt(1, 999)}` : '',
        twitter: Math.random() > 0.5 ? `${socialHandles[2]}${getRandomInt(1, 999)}` : '',
        spotify: Math.random() > 0.5 ? `${socialHandles[3]}${getRandomInt(1, 999)}` : '',
        youtube: Math.random() > 0.5 ? `${socialHandles[4]}${getRandomInt(1, 999)}` : '',
        twitch: Math.random() > 0.5 ? `${socialHandles[5]}${getRandomInt(1, 999)}` : '',
        kick: Math.random() > 0.5 ? `${socialHandles[6]}${getRandomInt(1, 999)}` : ''
      },
      createdAt: getRandomDate(new Date(2023, 0, 1), new Date()),
      lastLogin: getRandomDate(new Date(2024, 6, 1), new Date())
    };
    
    const user = new User(userData);
    await user.save();
    users.push(user);
    console.log(`Created user: ${username}`);
  }
  
  return users;
}

async function createMockTournaments(creatorUser, users) {
  const tournaments = [];
  
  for (let i = 0; i < 15; i++) {
    // Random number of participants (3-20)
    const maxParticipants = getRandomInt(8, 25);
    const actualParticipants = getRandomInt(3, Math.min(maxParticipants, users.length));
    
    // Select random participants
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
    const selectedParticipants = shuffledUsers.slice(0, actualParticipants);
    
    // Random dates
    const now = new Date();
    const startDate = getRandomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000));
    const endDate = new Date(startDate.getTime() + getRandomInt(7, 30) * 24 * 60 * 60 * 1000);
    
    // Determine status based on dates
    let status = 'upcoming';
    if (startDate < now && endDate > now) {
      status = Math.random() > 0.5 ? 'ongoing' : 'upcoming';
    } else if (endDate < now) {
      status = Math.random() > 0.3 ? 'completed' : 'ongoing';
    }
    
    const tournamentData = {
      name: tournamentNames[i] || `Tournament ${i + 1}`,
      game: getRandom(musicGenres),
      description: getRandom(tournamentDescriptions),
      creator: creatorUser._id,
      startDate,
      endDate,
      maxPlayers: maxParticipants,
      participants: selectedParticipants.map(user => user._id),
      rules: getRandom(rules),
      language: Math.random() > 0.8 ? getRandom(['English', 'Spanish', 'French', 'German']) : 'Any Language',
      status,
      createdAt: getRandomDate(new Date(2024, 0, 1), startDate)
    };
    
    const tournament = new Tournament(tournamentData);
    await tournament.save();
    tournaments.push(tournament);
    console.log(`Created tournament: ${tournament.name} with ${actualParticipants} participants (${status})`);
    
    // Create mock submissions for participants
    for (let j = 0; j < selectedParticipants.length; j++) {
      const participant = selectedParticipants[j];
      const submissionData = {
        tournament: tournament._id,
        user: participant._id,
        songTitle: `${getRandom(['Beat', 'Track', 'Song', 'Mix', 'Composition'])} ${getRandomInt(1, 999)}`,
        description: `${getRandom(['Dark', 'Uplifting', 'Experimental', 'Melodic', 'Hard-hitting'])} ${getRandom(musicGenres.slice(0, 10))} track created for this competition.`,
        streamingSource: 'upload',
        originalFileName: `track_${j + 1}.mp3`,
        mimetype: 'audio/mpeg',
        songFilePath: `/fake/path/to/track_${j + 1}.mp3`, // Mock path
        submittedAt: getRandomDate(tournament.createdAt, tournament.startDate)
      };
      
      const submission = new Submission(submissionData);
      await submission.save();
    }
  }
  
  return tournaments;
}

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://musikmadnessfree:yZO6Oeu6O4dBi3wd@musikmadnessfree.amewlxk.mongodb.net/musikmadness?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');
    
    // Find the existing creator user
    const creatorUser = await User.findOne({ email: 'ernesto.ortiz0012@gmail.com' });
    if (!creatorUser) {
      throw new Error('Creator user not found! Please make sure the user exists.');
    }
    console.log(`Found creator user: ${creatorUser.username}`);
    
    // Create mock users (participants)
    console.log('\n--- Creating Mock Users ---');
    const users = await createMockUsers(45); // Create 45 users for variety
    
    // Create mock tournaments
    console.log('\n--- Creating Mock Tournaments ---');
    const tournaments = await createMockTournaments(creatorUser, users);
    
    console.log(`\n✅ Successfully created:`);
    console.log(`   ${users.length} mock users`);
    console.log(`   ${tournaments.length} mock tournaments`);
    console.log(`   Submissions for all participants`);
    
    // Summary statistics
    const statusCounts = tournaments.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 Tournament Status Distribution:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    const totalParticipants = tournaments.reduce((sum, t) => sum + t.participants.length, 0);
    console.log(`\n👥 Average participants per tournament: ${(totalParticipants / tournaments.length).toFixed(1)}`);
    
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the script
if (require.main === module) {
  populateDatabase();
}

module.exports = { populateDatabase };
