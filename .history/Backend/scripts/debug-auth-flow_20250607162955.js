#!/usr/bin/env node

/**
 * Authentication Debug Script
 * Tests authentication headers and token validation
 */

const axios = require('axios');

async function testAuthentication() {
  console.log('🔍 Testing Authentication Flow');
  console.log('==============================\n');

  // First, let's test if we can reach the backend
  try {
    console.log('1. Testing backend connectivity...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend is reachable:', healthResponse.data.message);
    console.log('   Environment:', healthResponse.data.environment);
  } catch (error) {
    console.error('❌ Cannot reach backend:', error.message);
    return;
  }

  // Test CORS by making a request with Origin header
  try {
    console.log('\n2. Testing CORS configuration...');
    const corsResponse = await axios.get('http://localhost:5000/health', {
      headers: {
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('✅ CORS allows localhost:5173');
  } catch (error) {
    console.error('❌ CORS issue with localhost:5173:', error.message);
  }

  // Test authentication endpoint without token
  try {
    console.log('\n3. Testing tournament begin endpoint without token...');
    const noTokenResponse = await axios.post('http://localhost:5000/api/tournaments/6842ae78d97a74e109e27d37/begin');
    console.log('Unexpected success:', noTokenResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Expected 401 response without token:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  // Test with a fake token
  try {
    console.log('\n4. Testing with invalid token...');
    const fakeTokenResponse = await axios.post('http://localhost:5000/api/tournaments/6842ae78d97a74e109e27d37/begin', {}, {
      headers: {
        'Authorization': 'Bearer fake_token_here',
        'Origin': 'http://localhost:5173'
      }
    });
    console.log('Unexpected success:', fakeTokenResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Expected 401 response with fake token:', error.response.data.message);
    } else {
      console.error('❌ Unexpected error:', error.response?.data || error.message);
    }
  }

  console.log('\n🔧 Next Steps:');
  console.log('1. Open browser developer tools');
  console.log('2. Go to Network tab');
  console.log('3. Try the "Begin Tournament" action');
  console.log('4. Check the request headers for Authorization header');
  console.log('5. Check if the token is being sent properly');
  console.log('\n📝 To check token in browser console:');
  console.log('   localStorage.getItem("token")');
}

testAuthentication().catch(console.error);
