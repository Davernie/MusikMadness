import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration for 500 virtual users with faster ramp-up and 1 minute sustained load
export const options = {
  stages: [
    { duration: '15s', target: 200 }, // Ramp up to 200 users over 15 seconds
    { duration: '15s', target: 500 }, // Ramp up to 500 users over next 15 seconds
    { duration: '1m', target: 500 },  // Stay at 500 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2 seconds
    http_req_failed: ['rate<0.1'],     // Error rate should be below 10%
    errors: ['rate<0.1'],              // Custom error rate should be below 10%
  },
};

// Base URL configuration - adjust this to your server URL
const BASE_URL = __ENV.BASE_URL || 'https://musikmadnessbackend.onrender.com';

// Test data for creating accounts and testing
const TEST_USERS = [
  { username: 'testuser1', email: 'test1@example.com', password: 'TestPass123!' },
  { username: 'testuser2', email: 'test2@example.com', password: 'TestPass123!' },
  { username: 'testuser3', email: 'test3@example.com', password: 'TestPass123!' },
];

// Helper function to get random test user
function getRandomTestUser() {
  const randomIndex = Math.floor(Math.random() * TEST_USERS.length);
  return {
    ...TEST_USERS[randomIndex],
    username: `${TEST_USERS[randomIndex].username}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@example.com`
  };
}

// Main test function that runs for each virtual user
export default function () {
  const testUser = getRandomTestUser();
  let authToken = null;

  // Test 1: Health Check
  const healthResponse = http.get(`${BASE_URL}/health`);
  const healthCheckPassed = check(healthResponse, {
    'Health check status is 200': (r) => r.status === 200,
    'Health check response time < 1s': (r) => r.timings.duration < 1000,
    'Health check contains status': (r) => r.json('status') === 'ok',
  });
  
  if (!healthCheckPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 2: User Registration
  const signupPayload = JSON.stringify(testUser);
  const signupParams = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  const signupResponse = http.post(`${BASE_URL}/api/auth/signup`, signupPayload, signupParams);
  const signupPassed = check(signupResponse, {
    'Signup status is 201 or 400 (user exists)': (r) => r.status === 201 || r.status === 400,
    'Signup response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  if (!signupPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 3: User Login (try with one of the predefined users)
  const loginUser = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
  const loginPayload = JSON.stringify({
    email: loginUser.email,
    password: loginUser.password
  });
  
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, loginPayload, signupParams);
  const loginPassed = check(loginResponse, {
    'Login status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'Login response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  if (loginResponse.status === 200) {
    const loginData = loginResponse.json();
    authToken = loginData.token;
  }
  
  if (!loginPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 4: Get All Tournaments (Public endpoint)
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

  // Test 5: Get All Users (Public endpoint)
  const usersResponse = http.get(`${BASE_URL}/api/users`);
  const usersPassed = check(usersResponse, {
    'Users status is 200': (r) => r.status === 200,
    'Users response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  if (!usersPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 6: Get All Tracks (Public endpoint)
  const tracksResponse = http.get(`${BASE_URL}/api/tracks`);
  const tracksPassed = check(tracksResponse, {
    'Tracks status is 200': (r) => r.status === 200,
    'Tracks response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  if (!tracksPassed) {
    errorRate.add(1);
  }

  sleep(1);

  // Test 7: Authenticated requests (if we have a token)
  if (authToken) {
    const authHeaders = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    };

    // Test authenticated user profile
    const profileResponse = http.get(`${BASE_URL}/api/auth/me`, authHeaders);
    const profilePassed = check(profileResponse, {
      'Profile status is 200': (r) => r.status === 200,
      'Profile response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    if (!profilePassed) {
      errorRate.add(1);
    }

    sleep(1);

    // Test creating a track
    const trackPayload = JSON.stringify({
      title: `Test Track ${Date.now()}`,
      artist: `Test Artist ${Math.random().toString(36).substr(2, 5)}`,
      album: 'Test Album',
      releaseYear: 2024
    });
    
    const createTrackResponse = http.post(`${BASE_URL}/api/tracks`, trackPayload, authHeaders);
    const createTrackPassed = check(createTrackResponse, {
      'Create track status is 201 or 400': (r) => r.status === 201 || r.status === 400,
      'Create track response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    if (!createTrackPassed) {
      errorRate.add(1);
    }
  }

  // Random sleep between 1-3 seconds to simulate real user behavior
  sleep(Math.random() * 2 + 1);
}

// Setup function - runs once before all VUs start
export function setup() {
  console.log('Starting load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('Test configuration: 500 users over 2 minutes');
  
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