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
  ],  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% of requests should be below 10 seconds (more lenient)
    http_req_failed: ['rate<0.3'],      // Error rate should be below 30% (more lenient for debugging)
    errors: ['rate<0.3'],               // Custom error rate should be below 30%
  },
};

// Base URL configuration - adjust this to your server URL
const BASE_URL = __ENV.BASE_URL || 'https://musikmadnessbackend.onrender.com';

// Single test user credentials for login attempts (verified user)
const LOGIN_USER = {
  email: 'ernesto.ortiz0012@gmail.com',
  password: 'Tennis.ie1'
};

// Function to generate random user data for signup
function generateRandomUser() {
  const randomId = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now();
  return {
    username: `testuser_${randomId}_${timestamp}`,
    email: `testuser_${randomId}_${timestamp}@loadtest.com`,
    password: 'TestPassword123!'
  };
}

// Main test function that runs for each virtual user
export default function () {
  let authToken = null;
  
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
  // Test 2: User Signup (create account but don't verify)
  const newUser = generateRandomUser();
  const signupPayload = JSON.stringify(newUser);
  const signupParams = {
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: '30s',
  };
  
  console.log(`Attempting signup with payload: ${signupPayload}`);
  
  const signupResponse = http.post(`${BASE_URL}/api/auth/signup`, signupPayload, signupParams);
  
  console.log(`Signup response - Status: ${signupResponse.status}, Body: ${signupResponse.body}`);
  
  const signupPassed = check(signupResponse, {
    'Signup request completed': (r) => r.status >= 200 && r.status < 500,
    'Signup response time < 5s': (r) => r.timings.duration < 5000,
    'Signup response has body': (r) => r.body && r.body.length > 0,
  });
  
  if (!signupPassed) {
    errorRate.add(1);
  }

  sleep(1);
  // Test 3: User Login (login with existing verified credentials)
  const loginPayload = JSON.stringify(LOGIN_USER);
  const loginParams = {
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: '30s',
  };
  
  console.log(`Attempting login with user: ${LOGIN_USER.email}`);
  
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, loginPayload, loginParams);
  
  console.log(`Login response - Status: ${loginResponse.status}, Body: ${loginResponse.body}`);
  
  const loginPassed = check(loginResponse, {
    'Login request completed': (r) => r.status >= 200 && r.status < 500,
    'Login response time < 5s': (r) => r.timings.duration < 5000,
    'Login response has body': (r) => r.body && r.body.length > 0,
  });
  
  // Extract token from login response if successful
  if (loginResponse.status === 200) {
    try {
      const loginData = loginResponse.json();
      authToken = loginData.token;
    } catch (e) {
      console.log('Failed to parse login response');
    }
  }
  
  if (!loginPassed) {
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
  sleep(1);
  // Test 6: Tournament Matchup Pages (Frontend)
  const matchupUrls = [
    'https://musikmadness.com/tournaments/684478741a14b29bcdcd8c34/matchup/R1M1',
    'https://musikmadness.com/tournaments/6839572710513c7471902a8f/matchup/R1M1'
  ];
  
  // Test both tournament matchup pages
  for (let i = 0; i < matchupUrls.length; i++) {
    console.log(`Testing matchup page ${i + 1}: ${matchupUrls[i]}`);
    
    const matchupResponse = http.get(matchupUrls[i], {
      timeout: '30s',
      headers: {
        'User-Agent': 'k6-load-test/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    console.log(`Matchup ${i + 1} response - Status: ${matchupResponse.status}, Body length: ${matchupResponse.body ? matchupResponse.body.length : 0}`);
    
    const matchupPassed = check(matchupResponse, {
      [`Matchup ${i + 1} status is 200`]: (r) => r.status === 200,
      [`Matchup ${i + 1} response time < 5s`]: (r) => r.timings.duration < 5000,
      [`Matchup ${i + 1} has content`]: (r) => r.body && r.body.length > 1000,
      [`Matchup ${i + 1} contains web content`]: (r) => {
        const body = r.body ? r.body.toLowerCase() : '';
        return body.includes('html') || body.includes('title') || body.includes('body') || 
               body.includes('tournament') || body.includes('matchup') || 
               body.includes('soundcloud') || body.includes('musikmadness');
      },
    });
    
    if (!matchupPassed) {
      errorRate.add(1);
    }
    
    sleep(1);
  }

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
    }    sleep(1);

    // Test 8: Logout
    const logoutResponse = http.post(`${BASE_URL}/api/auth/logout`, '', authHeaders);
    const logoutPassed = check(logoutResponse, {
      'Logout status is 200, 204, or 404': (r) => [200, 204, 404].includes(r.status),
      'Logout response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    if (!logoutPassed) {
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
  console.log('Test configuration: 1000 users max over 1 minute (quick ramp-up)');
  console.log('Testing strategy: Hybrid approach - signup new users + login with verified user');
  console.log(`Login user: ${LOGIN_USER.email}`);
  console.log('Stages: 10s → 500 users, 10s → 1000 users, 30s sustained, 10s → 0');  console.log('Each virtual user will:');
  console.log('  1. Create a new account (signup endpoint test)');
  console.log('  2. Login with verified credentials (login endpoint test)');
  console.log('  3. Test other endpoints and authenticated operations');
  console.log('  4. Visit tournament matchup pages with SoundCloud music playback');
  
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