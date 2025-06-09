import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration for 1-minute load test with quick ramp-ups
export const options = {  stages: [
    { duration: '10s', target: 500 }, // Quick ramp up to 500 users over 10 seconds
    { duration: '10s', target: 1000 }, // Quick ramp up to 1000 users over 10 seconds
    { duration: '30s', target: 1000 }, // Sustained load at 1000 users for 30 seconds
    { duration: '10s', target: 0 },   // Quick ramp down to 0 users over 10 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5 seconds
    http_req_failed: ['rate<0.2'],     // Error rate should be below 20%
    errors: ['rate<0.2'],              // Custom error rate should be below 20%
  },
};

// Base URL configuration - adjust this to your server URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

// Test data for creating accounts and testing
const TEST_USERS = [
  { username: 'testuser1', email: 'test1@example.com', password: 'TestPass123!' },
  { username: 'testuser2', email: 'test2@example.com', password: 'TestPass123!' },
  { username: 'testuser3', email: 'test3@example.com', password: 'TestPass123!' },
];

// Helper function to get random test user with unique credentials
function getRandomTestUser() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substr(2, 9);
  return {
    username: `testuser_${timestamp}_${randomSuffix}`,
    email: `test_${timestamp}_${randomSuffix}@example.com`,
    password: 'TestPass123!'
  };
}

// Main test function that runs for each virtual user
export default function () {
  const testUser = getRandomTestUser();
  
  // Test 1: Health Check
  const healthResponse = http.get(`${BASE_URL}/health`);
  const healthCheckPassed = check(healthResponse, {
    'Health check status is 200': (r) => r.status === 200,
    'Health check response time < 1s': (r) => r.timings.duration < 1000,
    'Health check contains status': (r) => {
      try {
        const data = r.json();
        return data.status === 'ok';
      } catch (e) {
        return false;
      }
    },
  });
  
  if (!healthCheckPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 2: User Registration (ignoring email verification)
  const signupPayload = JSON.stringify(testUser);
  const signupParams = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const signupResponse = http.post(`${BASE_URL}/api/auth/signup`, signupPayload, signupParams);
  const signupPassed = check(signupResponse, {
    'Signup status is 201 or 400 (user exists)': (r) => r.status === 201 || r.status === 400,
    'Signup response time < 3s': (r) => r.timings.duration < 3000,
    'Signup response contains expected fields': (r) => {
      if (r.status === 201) {
        try {
          const data = r.json();
          return data.message && data.user && data.user.username === testUser.username;
        } catch (e) {
          return false;
        }
      }
      return true; // For 400 status, we don't check response body
    },
  });
  
  if (!signupPassed) {
    errorRate.add(1);
  }
  sleep(1);

  // Test 3: Get All Tournaments (Public endpoint)
  const tournamentsResponse = http.get(`${BASE_URL}/api/tournaments`);
  const tournamentsPassed = check(tournamentsResponse, {
    'Tournaments status is 200': (r) => r.status === 200,
    'Tournaments response time < 2s': (r) => r.timings.duration < 2000,
    'Tournaments response is array or object': (r) => {
      try {
        const data = r.json();
        return Array.isArray(data) || typeof data === 'object';
      } catch (e) {
        return false;
      }
    },
  });
  
  if (!tournamentsPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 4: Get All Users (Public endpoint)
  const usersResponse = http.get(`${BASE_URL}/api/users`);
  const usersPassed = check(usersResponse, {
    'Users status is 200': (r) => r.status === 200,
    'Users response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  if (!usersPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 5: Get All Tracks (Public endpoint)
  const tracksResponse = http.get(`${BASE_URL}/api/tracks`);
  const tracksPassed = check(tracksResponse, {
    'Tracks status is 200': (r) => r.status === 200,
    'Tracks response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  if (!tracksPassed) {
    errorRate.add(1);
  }

  // Random sleep between 1-3 seconds to simulate real user behavior
  sleep(Math.random() * 2 + 1);
}

// Setup function - runs once before all VUs start
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Test configuration: 1000 users max over 1 minute (quick ramp-up)');
  console.log('Focus: Signup performance test (no login/authentication required)');
  console.log('Stages: 10s → 500 users, 10s → 1000 users, 30s sustained, 10s → 0');
  
  // Test if the server is reachable
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    console.error(`Server health check failed. Status: ${healthCheck.status}`);
    console.error('Make sure your server is running before starting the load test.');
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function - runs once after all VUs finish
export function teardown(data) {
  console.log('Load test completed!');
  console.log('Check the results above for performance metrics.');
} 