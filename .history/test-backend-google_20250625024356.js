// Test script to check backend Google OAuth
const testBackendGoogle = async () => {
  try {
    console.log('Testing backend Google OAuth endpoint...');
    
    // Test 1: Check if endpoint exists
    const response = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: 'test_token'
      }),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const data = await response.text();
    console.log('Response body:', data);
    
  } catch (error) {
    console.error('Backend test error:', error);
  }
};

testBackendGoogle();
