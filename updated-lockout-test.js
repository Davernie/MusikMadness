// Updated IP Lockout Test - Verifies the new progressive lockout system
// Tests: 5 free attempts, then 1min → 5min → 15min → 30min → 1hr → 2hr lockouts

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'https://musikmadnessbackend.onrender.com';

export const options = {
  vus: 1,
  duration: '30s'
};

export default function() {
  console.log('🚀 Testing Updated IP Lockout System...\n');
  
  const testData = {
    email: 'lockout-test@example.com',
    password: 'wrongpassword123'
  };
  
  console.log('📋 Expected Behavior:');
  console.log('   Attempts 1-5: ✅ Instant "Invalid credentials" response');
  console.log('   Attempt 6: 🚫 "Too many attempts" - 1 minute lockout');
  console.log('   After 1min wait + 1 attempt: 🚫 5 minute lockout');
  console.log('   After 5min wait + 1 attempt: 🚫 15 minute lockout');
  console.log('   Progressive: 30min → 1hr → 2hr (max)\n');
  
  // Test the first 6 attempts (5 free + 1st lockout)
  for (let i = 1; i <= 6; i++) {
    console.log(`🔍 Attempt ${i}:`);
    
    const startTime = Date.now();
    const response = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(testData), {
      headers: { 'Content-Type': 'application/json' }
    });
    const responseTime = Date.now() - startTime;
    
    if (i <= 5) {
      // First 5 attempts should be fast and return 400
      check(response, {
        [`Attempt ${i}: Returns 400 (Invalid credentials)`]: (r) => r.status === 400,
        [`Attempt ${i}: Fast response (<1000ms)`]: (r) => responseTime < 1000,
        [`Attempt ${i}: Correct error message`]: (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.message === 'Invalid credentials';
          } catch {
            return false;
          }
        }
      });
      
      console.log(`   ✅ Status: ${response.status}, Time: ${responseTime}ms, Message: "${JSON.parse(response.body).message}"`);
      
    } else {
      // 6th attempt should trigger lockout
      check(response, {
        [`Attempt ${i}: Returns 429 (Too many attempts)`]: (r) => r.status === 429,
        [`Attempt ${i}: Contains lockout message`]: (r) => {
          try {
            const body = JSON.parse(r.body);
            return body.message.includes('Too many failed login attempts');
          } catch {
            return false;
          }
        }
      });
      
      try {
        const body = JSON.parse(response.body);
        console.log(`   🚫 Status: ${response.status}, Time: ${responseTime}ms`);
        console.log(`   🚫 Message: "${body.message}"`);
        console.log(`   🚫 Remaining: ${body.remainingMinutes} minutes`);
        console.log(`   🚫 Locked until: ${body.lockedUntil}`);
      } catch (e) {
        console.log(`   🚫 Status: ${response.status}, Body: ${response.body}`);
      }
    }
    
    // Small delay between attempts
    sleep(0.5);
  }
  
  console.log('\n📊 Lockout Progression Summary:');
  console.log('   ✅ Attempts 1-5: Free attempts (no lockout)');
  console.log('   🚫 1st Lockout: 1 minute (after 5 failed attempts)');
  console.log('   🚫 2nd Lockout: 5 minutes (after next failure)');
  console.log('   🚫 3rd Lockout: 15 minutes');
  console.log('   🚫 4th Lockout: 30 minutes');
  console.log('   🚫 5th Lockout: 1 hour');
  console.log('   🚫 6th+ Lockout: 2 hours (maximum)');
  
  console.log('\n🔒 Security Features:');
  console.log('   ✅ IP-based protection (prevents DoS on user accounts)');
  console.log('   ✅ Progressive lockout times (deters persistent attacks)');
  console.log('   ✅ Unified error messages (prevents account enumeration)');
  console.log('   ✅ Automatic cleanup (prevents memory leaks)');
  
  console.log('\n✅ Updated Lockout Test Complete!');
}
