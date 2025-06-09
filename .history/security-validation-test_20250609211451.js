// Security Validation Test for Improved Authentication
// Tests the new security features: IP-based rate limiting, progressive delays, and account enumeration prevention

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://musikmadnessbackend.onrender.com';

export const options = {
  scenarios: {
    'test_progressive_delays': {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      exec: 'testProgressiveDelays'
    },
    'test_account_enumeration_protection': {
      executor: 'constant-vus', 
      vus: 1,
      duration: '15s',
      exec: 'testAccountEnumerationProtection'
    },
    'test_rate_limiting': {
      executor: 'constant-vus',
      vus: 5,
      duration: '20s', 
      exec: 'testRateLimiting'
    }
  }
};

// Test 1: Progressive Delays (should increase delay with each failed attempt)
export function testProgressiveDelays() {
  console.log('🔒 Testing Progressive Delays...');
  
  const testData = {
    email: 'nonexistent@test.com',
    password: 'wrongpassword'
  };
  
  let totalDelayTime = 0;
  const maxAttempts = 6; // Test first 6 attempts to see progressive delays
  
  for (let i = 0; i < maxAttempts; i++) {
    const startTime = Date.now();
    
    const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(testData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseTime = Date.now() - startTime;
    totalDelayTime += responseTime;
    
    const expectedDelay = Math.min(1000 * Math.pow(2, i), 32000); // 1s, 2s, 4s, 8s, 16s, 32s
    
    console.log(`   Attempt ${i+1}: Response time: ${responseTime}ms (expected: ~${expectedDelay}ms)`);
    
    check(response, {
      [`Attempt ${i+1}: Returns 400 for invalid credentials`]: (r) => r.status === 400,
      [`Attempt ${i+1}: Response time includes progressive delay (~${expectedDelay}ms)`]: (r) => responseTime >= expectedDelay * 0.8,
      [`Attempt ${i+1}: Returns unified error message`]: (r) => {
        const body = JSON.parse(r.body);
        return body.message === 'Invalid credentials';
      }
    });
    
    // Small sleep to separate attempts
    sleep(0.5);
  }
  
  console.log(`   Total time for ${maxAttempts} attempts: ${totalDelayTime}ms`);
  console.log('✅ Progressive Delays Test Complete');
}

// Test 2: Account Enumeration Protection (same response for valid/invalid emails)
export function testAccountEnumerationProtection() {
  console.log('🔒 Testing Account Enumeration Protection...');
  
  const validEmail = 'ernesto.ortiz0012@gmail.com'; // Known existing user
  const invalidEmail = 'definitely_not_a_user@nonexistent.com';
  const wrongPassword = 'definitelywrongpassword123';
  
  // Test with valid email, wrong password
  const validEmailResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: validEmail,
    password: wrongPassword
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  sleep(1);
  
  // Test with invalid email, any password
  const invalidEmailResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: invalidEmail,
    password: wrongPassword
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  check(validEmailResponse, {
    'Valid email + wrong password: Returns 400': (r) => r.status === 400,
    'Valid email + wrong password: Returns unified error': (r) => {
      const body = JSON.parse(r.body);
      return body.message === 'Invalid credentials';
    }
  });
  
  check(invalidEmailResponse, {
    'Invalid email: Returns 400': (r) => r.status === 400,
    'Invalid email: Returns unified error': (r) => {
      const body = JSON.parse(r.body);
      return body.message === 'Invalid credentials';
    }
  });
  
  // Compare response times (should be similar due to dummy password hash)
  const timeDifference = Math.abs(validEmailResponse.timings.duration - invalidEmailResponse.timings.duration);
  
  check(null, {
    'Response times are similar (timing attack prevention)': () => timeDifference < 200 // Less than 200ms difference
  });
  
  console.log(`   Valid email response time: ${validEmailResponse.timings.duration}ms`);
  console.log(`   Invalid email response time: ${invalidEmailResponse.timings.duration}ms`);
  console.log(`   Time difference: ${timeDifference}ms`);
  console.log('✅ Account Enumeration Protection Test Complete');
}

// Test 3: Rate Limiting (IP-based, 10 attempts per 15 minutes)
export function testRateLimiting() {
  console.log('🔒 Testing Rate Limiting...');
  
  const testData = {
    email: 'test@ratelimit.com',
    password: 'password123'
  };
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  // Try 12 requests (should hit rate limit after 10)
  for (let i = 0; i < 12; i++) {
    const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(testData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.status === 429) {
      rateLimitedCount++;
      console.log(`   Request ${i+1}: Rate limited (429)`);
    } else if (response.status === 400) {
      successCount++;
      console.log(`   Request ${i+1}: Authentication failed as expected (400)`);
    } else {
      console.log(`   Request ${i+1}: Unexpected status ${response.status}`);
    }
    
    sleep(0.2); // Small delay between requests
  }
  
  check(null, {
    'Rate limiting kicks in': () => rateLimitedCount > 0,
    'At least 10 requests processed before rate limiting': () => successCount >= 10,
    'Rate limiting prevents further requests': () => rateLimitedCount >= 2
  });
  
  console.log(`   Successful auth attempts: ${successCount}`);
  console.log(`   Rate limited attempts: ${rateLimitedCount}`);
  console.log('✅ Rate Limiting Test Complete');
}

export default function() {
  // Run all security tests sequentially
  console.log('🚀 Starting Security Validation Tests...\n');
  
  testProgressiveDelays();
  sleep(2);
  
  testAccountEnumerationProtection();
  sleep(2);
  
  testRateLimiting();
  
  console.log('\n✅ All Security Tests Complete!');
}
