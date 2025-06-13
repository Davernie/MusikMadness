// Quick script to test tournament API and see organizer data
const fetch = require('node-fetch');

async function testTournamentAPI() {
  try {
    // First get all tournaments to see what's available
    console.log('🔍 Fetching all tournaments...');
    const response = await fetch('http://localhost:5000/api/tournaments');
    const data = await response.json();
    
    console.log('📊 Total tournaments:', data.tournaments?.length || 0);
    
    if (data.tournaments && data.tournaments.length > 0) {
      const tournament = data.tournaments[0];
      console.log('\n📄 First tournament overview:');
      console.log('- ID:', tournament._id);
      console.log('- Name:', tournament.name);
      console.log('- Creator type:', typeof tournament.creator);
      
      if (typeof tournament.creator === 'object' && tournament.creator) {
        console.log('- Creator username:', tournament.creator.username);
        console.log('- Creator bio:', tournament.creator.bio);
        console.log('- Creator socials:', tournament.creator.socials);
        console.log('- Creator website:', tournament.creator.website);
        console.log('- Creator location:', tournament.creator.location);
      }
      
      // Now get detailed view of this tournament
      console.log('\n🔍 Fetching tournament details...');
      const detailResponse = await fetch(`http://localhost:5000/api/tournaments/${tournament._id}`);
      const detailData = await detailResponse.json();
      
      console.log('\n📄 Tournament detail creator data:');
      if (detailData.tournament && detailData.tournament.creator) {
        const creator = detailData.tournament.creator;
        console.log('- Creator type:', typeof creator);
        console.log('- Creator username:', creator.username);
        console.log('- Creator bio:', creator.bio);
        console.log('- Creator socials:', JSON.stringify(creator.socials, null, 2));
        console.log('- Creator website:', creator.website);
        console.log('- Creator location:', creator.location);
        console.log('- Creator profilePictureUrl:', creator.profilePictureUrl);
      }
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testTournamentAPI();
