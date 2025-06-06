const axios = require('axios');
require('dotenv').config();

async function testFrontendAuthFlow() {
    console.log('🚀 Starting Frontend Authentication Flow Test...');
    
    try {
        // Step 1: Login to get a JWT token (simulate frontend login)
        console.log('🔐 Step 1: Attempting login...');
        console.log('  Email: ernesto.ortiz0012@gmail.com');
        
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'ernesto.ortiz0012@gmail.com',
            password: 'Tennis.ie1'
        }, {
            timeout: 10000
        });
        
        console.log('✅ Login successful!');
        console.log('  Status:', loginResponse.status);
        
        const { token, user } = loginResponse.data;
        console.log('  User Details:');
        console.log('    ID:', user.id);
        console.log('    Username:', user.username);
        console.log('    Email:', user.email);
        console.log('    Is Creator:', user.isCreator);
        console.log('  Token (first 50 chars):', token.substring(0, 50) + '...');
        
        // Step 2: Try to begin the tournament using the frontend token
        const tournamentId = '6842ae78d97a74e109e27d37';
        console.log('\n🎯 Step 2: Attempting to begin tournament...');
        console.log('  Tournament ID:', tournamentId);
        console.log('  Using token from login response');
        
        const beginResponse = await axios.post(
            `http://localhost:5000/api/tournaments/${tournamentId}/begin`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log('✅ Tournament begin successful!');
        console.log('  Status:', beginResponse.status);
        console.log('  Tournament Status:', beginResponse.data.status);
        console.log('  Message:', beginResponse.data.message);
        
    } catch (error) {
        console.error('\n❌ Error in frontend auth flow:');
        
        if (error.response) {
            console.error('  HTTP Status:', error.response.status);
            console.error('  Status Text:', error.response.statusText);
            console.error('  Error Message:', error.response.data?.message || 'Unknown error');
            console.error('  Full Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('  No response received');
            console.error('  Request details:', error.request);
        } else {
            console.error('  Setup Error:', error.message);
        }
        console.error('  Full Error Stack:', error.stack);
    }
}

testFrontendAuthFlow();
