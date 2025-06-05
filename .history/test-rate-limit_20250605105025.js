// Rate Limit Test Script
// This will test the Cloudflare rate limiting on auth endpoints

const API_BASE = 'https://your-domain.com/api'; // Replace with your actual domain

async function testRateLimit() {
    console.log('🧪 Testing Cloudflare Rate Limiting on /api/auth endpoints...\n');
    
    const testData = {
        email: 'test@example.com',
        password: 'wrongpassword'
    };
    
    for (let i = 1; i <= 8; i++) {
        try {
            console.log(`Request ${i}:`);
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });
            
            const status = response.status;
            const responseTime = Date.now();
            
            if (status === 429) {
                console.log(`  ✅ RATE LIMITED! Status: ${status} (This is what we want!)`);
                console.log(`  🛡️ Cloudflare rate limiting is working correctly\n`);
                break;
            } else {
                console.log(`  ⏳ Status: ${status} - Request allowed`);
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log(`  ❌ Error: ${error.message}`);
        }
    }
    
    console.log('📊 Test complete!');
    console.log('Expected: Requests 1-5 should succeed, request 6+ should be rate limited (429)');
}

// Run the test
testRateLimit();
