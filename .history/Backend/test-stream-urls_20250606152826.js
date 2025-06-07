const https = require('http');

// Test tournament IDs from the debug output
const tournamentIds = [
  '6842eb726247ee0127e6656c',
  '6842f7d26247ee0127e6662d'
];

console.log('🧪 Testing YouTube Stream URLs Endpoint...\n');

async function testTournamentEndpoint(tournamentId) {
  return new Promise((resolve, reject) => {
    console.log(`📋 Testing Tournament: ${tournamentId}`);
    
    // First get the tournament details to find matchups
    const req = https.request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/tournaments/${tournamentId}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            console.log(`❌ Tournament endpoint returned ${res.statusCode}`);
            console.log('Response:', data);
            resolve();
            return;
          }
          
          const tournament = JSON.parse(data);
          console.log(`✅ Tournament: ${tournament.tournament.name}`);
          console.log(`   Status: ${tournament.tournament.status}`);
          console.log(`   Participants: ${tournament.tournament.participants.length}`);
          
          if (tournament.tournament.generatedBracket && tournament.tournament.generatedBracket.length > 0) {
            console.log(`   Matchups: ${tournament.tournament.generatedBracket.length}`);
            
            // Test the first matchup stream URLs
            const firstMatchup = tournament.tournament.generatedBracket[0];
            console.log(`   First Matchup ID: ${firstMatchup.matchupId}`);
            
            testStreamUrls(tournamentId, firstMatchup.matchupId);
          } else {
            console.log(`   ⚠️ No generated bracket`);
          }
          
          resolve();
        } catch (err) {
          console.log('❌ Error parsing tournament response:', err.message);
          console.log('Raw response:', data.substring(0, 300));
          resolve();
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Request error: ${err.message}`);
      resolve();
    });
    
    req.end();
  });
}

function testStreamUrls(tournamentId, matchupId) {
  console.log(`\n🎵 Testing Stream URLs for matchup: ${matchupId}`);
  
  const req = https.request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/tournaments/${tournamentId}/matchup/${matchupId}/stream-urls`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`   Status: ${res.statusCode}`);
      
      try {
        if (res.statusCode === 200) {
          const streamData = JSON.parse(data);
          console.log('   ✅ Stream URLs Response:');
          
          if (streamData.streamUrls.player1) {
            const p1 = streamData.streamUrls.player1;
            console.log(`   🎬 Player 1:`);
            console.log(`      Audio Type: ${p1.audioType}`);
            console.log(`      Stream URL: ${p1.streamUrl}`);
            if (p1.audioType === 'youtube') {
              console.log(`      Video ID: ${p1.videoId}`);
              console.log(`      Embed URL: ${p1.embedUrl}`);
              console.log(`      Thumbnail: ${p1.thumbnail}`);
              console.log(`      Title: ${p1.title}`);
            }
          }
          
          if (streamData.streamUrls.player2) {
            const p2 = streamData.streamUrls.player2;
            console.log(`   🎬 Player 2:`);
            console.log(`      Audio Type: ${p2.audioType}`);
            console.log(`      Stream URL: ${p2.streamUrl}`);
            if (p2.audioType === 'youtube') {
              console.log(`      Video ID: ${p2.videoId}`);
              console.log(`      Embed URL: ${p2.embedUrl}`);
              console.log(`      Thumbnail: ${p2.thumbnail}`);
              console.log(`      Title: ${p2.title}`);
            }
          }
          
        } else {
          console.log('   ❌ Error Response:');
          console.log('   ', data);
        }
      } catch (err) {
        console.log('   ❌ Error parsing stream URLs:', err.message);
        console.log('   Raw response:', data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.log(`   ❌ Stream URLs request error: ${err.message}`);
  });
  
  req.end();
}

// Test all tournaments
async function runTests() {
  for (const tournamentId of tournamentIds) {
    await testStreamUrls(tournamentId);
    console.log('\n' + '─'.repeat(50) + '\n');
  }
}

runTests().catch(console.error);
