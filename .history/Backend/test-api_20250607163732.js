// Simple test script to check YouTube data
const https = require('http');

console.log('Testing YouTube data from backend API...');

// Test the health endpoint first
const healthReq = https.request({
  hostname: 'localhost',
  port: 5000,
  path: '/health',
  method: 'GET'
}, (res) => {
  console.log('Health check status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const healthData = JSON.parse(data);
      console.log('Backend is running:', healthData.status);
      console.log('Environment:', healthData.environment);
      
      // If backend is running, test a specific tournament endpoint
      // You'll need to replace with actual tournament/matchup IDs from your database
      testTournamentEndpoint();
      
    } catch (err) {
      console.log('Health response:', data);
    }
  });
});

healthReq.on('error', (err) => {
  console.error('Backend not running or not accessible:', err.message);
  console.log('Please make sure to run: npm run dev in the Backend directory');
});

healthReq.end();

function testTournamentEndpoint() {
  console.log('\nTesting tournament endpoints...');
  
  // Test tournaments list
  const tournamentsReq = https.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/tournaments',
    method: 'GET'
  }, (res) => {
    console.log('Tournaments endpoint status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const tournaments = JSON.parse(data);
        console.log('Found tournaments:', tournaments.length || 'Error');
        
        if (tournaments.length > 0) {
          console.log('First tournament:', tournaments[0].name, tournaments[0]._id);
        }
        
      } catch (err) {
        console.log('Tournaments response:', data.substring(0, 200));
      }
    });
  });
  
  tournamentsReq.on('error', (err) => {
    console.error('Error testing tournaments endpoint:', err.message);
  });
  
  tournamentsReq.end();
}
