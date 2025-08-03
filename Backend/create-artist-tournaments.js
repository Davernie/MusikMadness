const mongoose = require('mongoose');
const User = require('./dist/models/User').default;
const Tournament = require('./dist/models/Tournament').default;
const Submission = require('./dist/models/Submission').default;
require('dotenv').config();

console.log('Starting artist-focused tournament creation...');

// Expanded artist-focused tournament names
const artistTournamentNames = [
  // Electronic/EDM Artist Tournaments
  'Neon Dreams Artist Showcase', 'Synth Soul Sessions', 'Electronic Euphoria', 'Digital Dreamscape',
  'Cyber Sound Clash', 'Virtual Vibes Contest', 'Electric Energy Expo', 'Future Bass Festival',
  'Ambient Artist Arena', 'Progressive Pulse Battle', 'Techno Titans Tournament', 'House Heroes Showdown',
  
  // Hip-Hop Artist Tournaments  
  'Rap Royalty Rumble', 'Hip-Hop Heroes Battle', 'Lyrical Legends League', 'Beat Box Bonanza',
  'Flow Master Festival', 'Rhyme Time Royale', 'Mic Drop Madness', 'Street Style Showdown',
  'Underground Uprising', 'Freestyle Fury', 'Boom Bap Battle', 'Trap Star Tournament',
  
  // Pop/Mainstream Artist Tournaments
  'Pop Star Paradise', 'Mainstream Magic', 'Chart Topper Challenge', 'Radio Ready Rumble',
  'Catchy Chorus Contest', 'Hook Master Heroes', 'Melody Maker Mayhem', 'Top 40 Titans',
  'Billboard Bound Battle', 'Viral Vibes Contest', 'Stadium Anthem Showdown', 'Dance Floor Dynamos',
  
  // Alternative/Indie Artist Tournaments
  'Indie Artist Invasion', 'Alternative Atmosphere', 'Underground Universe', 'Artsy Audio Arena',
  'Creative Commons Clash', 'Experimental Expression', 'Avant-Garde Assembly', 'Ethereal Elements',
  'Dreamy Soundscape Duel', 'Chill Vibes Championship', 'Lo-Fi Legends League', 'Bedroom Pop Battle',
  
  // Rock/Metal Artist Tournaments
  'Rock Rebellion Royale', 'Metal Mayhem Masters', 'Guitar Gods Gathering', 'Riff Raiders Rally',
  'Power Chord Playoffs', 'Headbanging Heroes', 'Stadium Rock Showdown', 'Classic Rock Revival',
  'Punk Rock Riot', 'Grunge Gods Battle', 'Alternative Rock Arena', 'Prog Rock Paradise',
  
  // R&B/Soul Artist Tournaments
  'Soul Singer Showcase', 'R&B Royalty Rumble', 'Smooth Vocals Showdown', 'Neo-Soul Sessions',
  'Funk Masters Festival', 'Gospel Groove Games', 'Jazz Fusion Jam', 'Smooth Jazz Showdown',
  'Blues Brothers Battle', 'Motown Magic', 'Contemporary R&B Challenge', 'Vocal Harmony Heroes',
  
  // World/Cultural Artist Tournaments
  'Global Groove Games', 'World Music Warriors', 'Cultural Sound Clash', 'International Rhythm Rally',
  'Ethnic Beats Battle', 'Folk Fusion Festival', 'Traditional Meets Modern', 'Continental Chorus',
  'Multilingual Music Mayhem', 'Diaspora Sounds Showdown', 'Heritage Harmony Heroes', 'Cultural Bridge Battle',
  
  // Specialized Artist Tournaments
  'Vocalist Virtuoso Contest', 'Songwriter Supreme', 'Multi-Instrumental Masters', 'One-Person Band Battle',
  'Acoustic Artist Arena', 'Live Performance Legends', 'Studio Session Stars', 'Collaboration Champions',
  'Cover Artist Challenge', 'Original Only Olympics', 'Remix Revolution', 'Sample Master Showdown'
];

// Artist-focused descriptions
const artistDescriptions = [
  'Showcase your vocal prowess and artistic vision in this competitive artist tournament.',
  'A platform for emerging artists to demonstrate their unique sound and creative expression.',
  'Celebrate the art of songwriting and performance in this comprehensive artist competition.',
  'From bedroom artists to studio professionals - all skill levels welcome in this inclusive showcase.',
  'Multi-genre artist tournament celebrating diversity in musical expression and creativity.',
  'Original compositions only - let your authentic artistic voice shine through.',
  'Performance-focused competition highlighting stage presence and audience connection.',
  'Collaborative artist tournament encouraging cross-genre experimentation and innovation.',
  'Singer-songwriter spotlight featuring acoustic and intimate musical performances.',
  'High-energy artist battle featuring powerful vocals and dynamic stage presence.',
  'Underground artist showcase providing a platform for non-mainstream musical expression.',
  'Professional artist competition with industry-standard evaluation and feedback.',
  'Cultural fusion tournament celebrating artists from diverse musical backgrounds.',
  'Contemporary artist showdown featuring modern production and cutting-edge creativity.',
  'Classic meets modern - artists reimagining timeless musical styles for today\'s audience.',
  'Artist development tournament focused on growth, feedback, and community building.',
  'Genre-blending competition encouraging artists to push creative boundaries.',
  'Storytelling through song - narrative-focused artist competition.',
  'Visual and audio artist tournament incorporating multimedia performance elements.',
  'Artist collective showcase featuring solo performers and collaborative groups.'
];

// Helper functions
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const musicGenres = [
  'Pop', 'R&B', 'Hip Hop', 'Electronic', 'Rock', 'Alternative', 'Indie', 'Folk',
  'Country', 'Jazz', 'Blues', 'Soul', 'Funk', 'Reggae', 'Latin', 'World',
  'Classical', 'Ambient', 'Lo-fi', 'Synthwave', 'Punk', 'Metal', 'Grunge'
];

const artistRules = [
  ['Original songs only', 'Live vocals required', 'Maximum 4 minutes per track', 'High-quality recording essential'],
  ['Cover songs allowed with creative interpretation', 'Acoustic arrangements preferred', 'Storytelling emphasis', 'Lyrical content judged'],
  ['Multi-instrumental performances encouraged', 'Solo artists only', 'Minimum 2 minutes per song', 'Studio quality expected'],
  ['Collaborative works welcome', 'Cross-genre fusion encouraged', 'Visual performance elements bonus', 'Audience engagement important'],
  ['Singer-songwriter format', 'Acoustic or minimal production', 'Personal narrative required', 'Intimate performance style'],
  ['Full production allowed', 'Electronic elements welcome', 'Commercial appeal considered', 'Radio-ready quality expected'],
  ['Experimental approaches encouraged', 'Unconventional song structures allowed', 'Artistic risk-taking rewarded', 'Innovation over convention'],
  ['Cultural authenticity valued', 'Traditional instruments welcome', 'Language diversity celebrated', 'Heritage representation encouraged']
];

async function createArtistTournaments() {
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
    
    // Get existing users as participants
    const existingUsers = await User.find({}).limit(100);
    console.log(`Found ${existingUsers.length} existing users for participants`);
    
    if (existingUsers.length < 10) {
      console.log('Not enough users found. Creating additional users first...');
      // Create more users if needed
      await createAdditionalUsers(30);
      const updatedUsers = await User.find({}).limit(100);
      existingUsers.push(...updatedUsers.slice(existingUsers.length));
    }
    
    const tournaments = [];
    
    // Create 50 artist-focused tournaments
    for (let i = 0; i < 50; i++) {
      try {
        // Random dates (more variety in timing)
        const now = new Date();
        const daysOffset = getRandomInt(-60, 90); // -60 to +90 days from now
        const startDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + getRandomInt(5, 21) * 24 * 60 * 60 * 1000); // 5-21 days duration
        
        // More participants for artist tournaments
        const maxParticipants = getRandomInt(12, 32); // Larger tournaments
        const numParticipants = getRandomInt(6, Math.min(maxParticipants, existingUsers.length - 1)); // At least 6 participants
        const shuffled = [...existingUsers].sort(() => Math.random() - 0.5);
        const selectedParticipants = shuffled.slice(0, numParticipants);
        
        // Determine status based on dates with more variety
        let status = 'Open';
        if (startDate < now && endDate > now) {
          status = Math.random() > 0.4 ? 'In Progress' : 'Open';
        } else if (endDate < now) {
          status = Math.random() > 0.2 ? 'Completed' : 'In Progress';
        }
        
        const tournamentData = {
          name: artistTournamentNames[i % artistTournamentNames.length] + (i >= artistTournamentNames.length ? ` ${Math.floor(i / artistTournamentNames.length) + 1}` : ''),
          game: getRandom(musicGenres),
          type: 'artist', // Focus on artist type
          description: getRandom(artistDescriptions),
          creator: creatorUser._id,
          startDate,
          endDate,
          maxPlayers: maxParticipants,
          participants: selectedParticipants.map(user => user._id),
          status,
          rules: getRandom(artistRules),
          language: Math.random() > 0.7 ? getRandom(['English', 'Spanish', 'French', 'Portuguese', 'German', 'Italian']) : 'Any Language',
          hasCustomPrize: Math.random() > 0.6,
          customPrizeText: Math.random() > 0.6 ? getRandom([
            'Recording studio session worth $500',
            'Professional music video production',
            'Spotify playlist feature for 3 months',
            'Collaboration opportunity with established artist',
            'Music equipment package worth $300',
            'Social media promotion campaign',
            'Radio station interview and airplay',
            'Music festival performance slot'
          ]) : undefined
        };
        
        const tournament = new Tournament(tournamentData);
        await tournament.save();
        tournaments.push(tournament);
        console.log(`✅ Created artist tournament: ${tournament.name} (${tournament.game}) with ${numParticipants} participants - Status: ${tournament.status}`);
        
        // Create mock submissions for Open and In Progress tournaments
        if (status === 'Open' || status === 'In Progress') {
          for (let j = 0; j < selectedParticipants.length; j++) {
            const participant = selectedParticipants[j];
            const submissionData = {
              tournament: tournament._id,
              user: participant._id,
              songTitle: `${getRandom(['Midnight', 'Ocean', 'Fire', 'Dreams', 'Stars', 'Thunder', 'Whispers', 'Echoes', 'Golden', 'Silver'])} ${getRandom(['Song', 'Melody', 'Anthem', 'Ballad', 'Symphony', 'Serenade', 'Rhapsody', 'Harmony'])}`,
              description: `${getRandom(['Heartfelt', 'Energetic', 'Melodic', 'Powerful', 'Intimate', 'Uplifting', 'Emotional', 'Dynamic'])} ${tournament.game.toLowerCase()} track showcasing artistic expression and creativity.`,
              streamingSource: 'upload',
              originalFileName: `artist_track_${j + 1}.mp3`,
              mimetype: 'audio/mpeg',
              songFilePath: `/fake/path/to/artist_track_${j + 1}.mp3`,
              submittedAt: getRandomDate(tournament.createdAt, new Date())
            };
            
            const submission = new Submission(submissionData);
            await submission.save();
          }
        }
        
      } catch (error) {
        console.error(`❌ Error creating artist tournament ${i + 1}:`, error.message);
      }
    }
    
    // Summary
    console.log(`\n🎉 Artist Tournament Creation Summary:`);
    console.log(`   ✅ ${tournaments.length} artist tournaments created`);
    
    const statusCounts = tournaments.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 Tournament Status Distribution:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    
    const genreCounts = tournaments.reduce((acc, t) => {
      acc[t.game] = (acc[t.game] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n🎵 Genre Distribution (Top 10):`);
    Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([genre, count]) => {
        console.log(`   ${genre}: ${count}`);
      });
    
    const totalParticipants = tournaments.reduce((sum, t) => sum + t.participants.length, 0);
    console.log(`\n👥 Average participants per tournament: ${(totalParticipants / tournaments.length).toFixed(1)}`);
    
    const openTournaments = tournaments.filter(t => t.status === 'Open').length;
    console.log(`\n🚀 ${openTournaments} tournaments ready to start!`);
    
  } catch (error) {
    console.error('Error creating artist tournaments:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

async function createAdditionalUsers(count) {
  const usernames = [
    'VocalVirtuoso', 'SongbirdSoul', 'MelodyMaven', 'HarmonyHeart', 'RhythmRise',
    'LyricLegend', 'ChorusChamp', 'VerseVibe', 'BridgeBard', 'HookHero',
    'ArtisticAura', 'CreativeCore', 'MusicalMuse', 'SonicSinger', 'ToneTeller',
    'VoiceVortex', 'SoundSage', 'PitchPerfect', 'TunetalentEcho', 'ResonanceRider',
    'FrequencyFlair', 'AmplitudeArt', 'WaveformWonder', 'DecibelDream', 'HertzHeart',
    'TimbreTrail', 'OctaveOracle', 'ScaleStar', 'ChordChaser', 'NoteNomad',
    'BeatBard', 'TempoTrend', 'MeterMagic', 'CadenceCall', 'PulsePower'
  ];
  
  const firstNames = ['Aria', 'Melody', 'Harmony', 'Cadence', 'Lyric', 'Song', 'Chord', 'Note', 'Rhythm', 'Beat'];
  const lastNames = ['Singer', 'Vocalist', 'Artist', 'Performer', 'Creator', 'Writer', 'Composer', 'Musician'];
  
  for (let i = 0; i < count; i++) {
    try {
      const username = `${usernames[i % usernames.length]}_${getRandomInt(100, 999)}`;
      const firstName = getRandom(firstNames);
      const lastName = getRandom(lastNames);
      
      const userData = {
        username,
        email: `${username.toLowerCase()}@artistdemo.com`,
        googleId: `artist_demo_${Date.now()}_${i}`,
        authProvider: 'google',
        isEmailVerified: true,
        loginAttempts: 0,
        firstName,
        lastName,
        bio: 'Passionate artist participating in the MusikMadness community showcase.',
        location: `Music City ${getRandomInt(1, 25)}`,
        website: Math.random() > 0.5 ? `https://${username.toLowerCase()}.music` : '',
        genres: [getRandom(musicGenres), getRandom(musicGenres)].filter((v, i, a) => a.indexOf(v) === i),
        socials: {
          soundcloud: Math.random() > 0.4 ? `artist_${getRandomInt(1, 999)}` : '',
          instagram: Math.random() > 0.4 ? `music_${getRandomInt(1, 999)}` : '',
          twitter: Math.random() > 0.4 ? `song_${getRandomInt(1, 999)}` : '',
          spotify: Math.random() > 0.4 ? `artist_${getRandomInt(1, 999)}` : '',
          youtube: Math.random() > 0.4 ? `channel_${getRandomInt(1, 999)}` : '',
          twitch: Math.random() > 0.3 ? `stream_${getRandomInt(1, 999)}` : '',
          kick: Math.random() > 0.3 ? `live_${getRandomInt(1, 999)}` : ''
        }
      };
      
      const user = new User(userData);
      await user.save();
      console.log(`Created additional user: ${username}`);
      
    } catch (error) {
      console.log(`Skipped user creation:`, error.message);
    }
  }
}

// Run the script
if (require.main === module) {
  createArtistTournaments();
}

module.exports = { createArtistTournaments };
