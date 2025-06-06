// Paste this into your browser's console on the tournament details page
// This will help diagnose the authentication issue

console.log('🔍 Frontend Authentication Diagnostic...');

// Check if user is logged in
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);

if (token) {
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    
    // Decode JWT payload (without verification - just for debugging)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('Token expiry:', new Date(payload.exp * 1000));
        console.log('Token expired:', Date.now() > (payload.exp * 1000));
    } catch (e) {
        console.error('Error decoding token:', e);
    }
} else {
    console.log('❌ No token found in localStorage');
}

// Check if AuthContext has user data
console.log('Current URL:', window.location.href);
console.log('Tournament ID from URL:', window.location.pathname.split('/').pop());

// Test the token by making a request to a protected endpoint
if (token) {
    fetch('http://localhost:5000/api/auth/verify', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Token verification result:', data);
    })
    .catch(error => {
        console.error('Token verification error:', error);
    });
}
