// Backend Google Token Test
// Replace 'PASTE_YOUR_REAL_TOKEN_HERE' with the actual token from the debug page

const testRealGoogleToken = async () => {
  try {
    console.log('Testing with real Google token...');
    
    // REPLACE THIS WITH THE ACTUAL TOKEN FROM THE DEBUG PAGE
    const realToken = 'PASTE_YOUR_REAL_TOKEN_HERE';
    
    if (realToken === 'PASTE_YOUR_REAL_TOKEN_HERE') {
      console.log('❌ Please replace PASTE_YOUR_REAL_TOKEN_HERE with the actual token from the debug page');
      console.log('💡 Go to http://localhost:5173/debug.html');
      console.log('💡 Click "Test Google Button" and click the Google button');
      console.log('💡 Copy the token that appears after "Token preview:"');
      return;
    }
    
    const response = await fetch('http://localhost:5000/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idToken: realToken
      }),
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ SUCCESS! Google OAuth is working!');
      console.log('🎉 User:', data.user.email);
    } else {
      console.log('❌ FAILED:', data.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
};

testRealGoogleToken();
