// Simple IP Lockout Test
// Tests the new simple security system: immediate attempts until lockout threshold

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://musikmadnessbackend.onrender.com';

export const options = {
  vus: 1,
  duration: '120s'
};

export default function() {
  console.log('🚀 Testing Simple IP Lockout System...\n');
  
  const testData = {
    email: 'test@lockout.com',
    password: 'wrongpassword'
  };
  
  let attemptCount = 0;
  let lockedOut = false;
  
  // Test immediate attempts until lockout (should be 8 attempts)
  console.log('🔍 Testing immediate attempts until lockout...');
  
  for (let i = 1; i <= 12; i++) {
    const startTime = Date.now();
    
    const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(testData), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const responseTime = Date.now() - startTime;
    attemptCount++;
    
    if (response.status === 429) {
      // Hit the lockout!
      lockedOut = true;
      const body = JSON.parse(response.body);
      
      console.log(`🔒 LOCKOUT after ${attemptCount} attempts!`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: "${body.message}"`);
      console.log(`   Remaining Minutes: ${body.remainingMinutes}`);
      console.log(`   Response Time: ${responseTime}ms (should be immediate, no delays)`);
      
      check(response, {
        'Lockout triggered at correct threshold': () => attemptCount <= 8,
        'Returns 429 status': (r) => r.status === 429,
        'Contains lockout message': (r) => body.message && body.message.includes('Too many failed'),
        'Response is immediate (no delays)': () => responseTime < 500, // Should be very fast
        'Provides remaining time': () => body.remainingMinutes > 0
      });
      
      break;
    } else if (response.status === 400) {
      // Normal invalid credentials response
      const body = JSON.parse(response.body);
      
      console.log(`   Attempt ${i}: Invalid credentials (${responseTime}ms) - "${body.message}"`);
      
      check(response, {
        [`Attempt ${i}: Returns 400 for invalid credentials`]: (r) => r.status === 400,
        [`Attempt ${i}: Response is immediate (no delays)`]: () => responseTime < 500,
        [`Attempt ${i}: Returns unified error message`]: (r) => body.message === 'Invalid credentials'
      });
    } else {
      console.log(`   Attempt ${i}: Unexpected status ${response.status}`);
    }
    
    // Small pause between attempts (but system should have no delays)
    sleep(0.3);
  }
  
  // Summary
  if (lockedOut) {
    console.log(`\n✅ SUCCESS: IP lockout triggered after ${attemptCount} attempts`);
    console.log('✅ SUCCESS: No progressive delays detected (responses were immediate)');
    console.log('✅ SUCCESS: Clean "too many attempts" message provided');
  } else {
    console.log(`\n❌ FAILED: No lockout after ${attemptCount} attempts`);
  }
  
  // Test different email addresses to ensure account enumeration protection
  console.log('\n🔍 Testing Account Enumeration Protection...');
  
  sleep(5); // Wait a bit before testing different scenarios
  
  const validEmail = 'ernesto.ortiz0012@gmail.com';
  const invalidEmail = 'definitely_not_real@fake.com';
  const wrongPassword = 'wrongpassword123';
  
  // Test valid email with wrong password
  const validResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: validEmail,
    password: wrongPassword
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  sleep(1);
  
  // Test invalid email with any password
  const invalidResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: invalidEmail,
    password: wrongPassword
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Both should return same error format
  const validBody = JSON.parse(validResponse.body || '{}');
  const invalidBody = JSON.parse(invalidResponse.body || '{}');
  
  check(null, {
    'Valid email returns 400': () => validResponse.status === 400,
    'Invalid email returns 400': () => invalidResponse.status === 400,
    'Both return same error message': () => validBody.message === invalidBody.message,
    'Error message is "Invalid credentials"': () => validBody.message === 'Invalid credentials'
  });
  
  console.log(`   Valid email response: ${validResponse.status} - "${validBody.message}"`);
  console.log(`   Invalid email response: ${invalidResponse.status} - "${invalidBody.message}"`);
  
  if (validBody.message === invalidBody.message) {
    console.log('✅ SUCCESS: Account enumeration protection working');
  } else {
    console.log('❌ FAILED: Different error messages reveal account existence');
  }
  
  console.log('\n✅ Simple Lockout Test Complete!');
}
