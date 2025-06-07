const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

async function testTournamentBegin() {
    console.log('🚀 Starting tournament begin test...');
    
    try {
        // Use the creator account
        const userId = '6841818a6a43d9d7302da134';
        const tournamentId = '6842adda9b687556281ddd5f'; // From the script output
        
        console.log('📋 Test Parameters:');
        console.log('  User ID:', userId);
        console.log('  Tournament ID:', tournamentId);
        console.log('  JWT Secret exists:', !!process.env.JWT_SECRET);
        
        console.log('🔐 Generating JWT token...');
        const token = jwt.sign(
            { userId: userId },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('🎯 Testing tournament begin endpoint...');
        console.log('  URL:', `http://localhost:5000/api/tournaments/${tournamentId}/begin`);
        console.log('  Token (first 50 chars):', token.substring(0, 50) + '...');
        
        // Test the begin tournament endpoint
        console.log('📡 Sending request...');
        const response = await axios.post(
            `http://localhost:5000/api/tournaments/${tournamentId}/begin`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            }
        );
        
        console.log('✅ Success! Tournament begun successfully');
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ Error occurred:');
        
        if (error.response) {
            console.error('  Status:', error.response.status);
            console.error('  Status Text:', error.response.statusText);
            console.error('  Response Data:', JSON.stringify(error.response.data, null, 2));
            console.error('  Response Headers:', error.response.headers);
        } else if (error.request) {
            console.error('  No response received');
            console.error('  Request:', error.request);
        } else {
            console.error('  Error Message:', error.message);
        }
        console.error('  Full Error:', error);
    }
}

testTournamentBegin();
