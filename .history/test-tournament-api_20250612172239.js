const fetch = require('node-fetch');

async function testTournamentAPI() {
  try {
    // First get the list of tournaments
    console.log('Fetching tournaments list...');
    const tournamentsResponse = await fetch('http://localhost:5000/api/tournaments');
    const tournamentsData = await tournamentsResponse.json();
    
    console.log('Tournaments response structure:');
    console.log(JSON.stringify(tournamentsData, null, 2));
    
    if (tournamentsData.tournaments && tournamentsData.tournaments.length > 0) {
      const firstTournament = tournamentsData.tournaments[0];
      console.log('\n--- First Tournament Creator Data ---');
      console.log('Tournament ID:', firstTournament._id);
      console.log('Creator:', JSON.stringify(firstTournament.creator, null, 2));
      
      // Now get the detailed tournament
      console.log('\n--- Fetching Tournament Details ---');
      const tournamentDetailResponse = await fetch(`http://localhost:5000/api/tournaments/${firstTournament._id}`);
      const tournamentDetailData = await tournamentDetailResponse.json();
      
      console.log('Tournament detail response:');
      console.log(JSON.stringify(tournamentDetailData, null, 2));
      
      if (tournamentDetailData.tournament && tournamentDetailData.tournament.creator) {
        console.log('\n--- Tournament Detail Creator Data ---');
        console.log('Creator in detail:', JSON.stringify(tournamentDetailData.tournament.creator, null, 2));
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testTournamentAPI();
