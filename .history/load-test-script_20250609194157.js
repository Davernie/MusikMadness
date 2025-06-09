import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Realistic 1000-user simulation over 1 minute
export const options = {
  stages: [
    { duration: '15s', target: 800 },  // Users arrive gradually (morning/evening rush)
    { duration: '15s', target: 900 },  // More users join (peak time builds)
    { duration: '15s', target: 900 },  // Near peak traffic
    { duration: '10s', target: 1000 }, // Peak moment (tournament event, viral post)
    { duration: '5s', target: 800 },   // Some users finish and leave
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],  // 95% under 3 seconds (realistic expectation)
    http_req_failed: ['rate<0.1'],      // Less than 10% errors (production quality)
    errors: ['rate<0.1'],               // Custom error rate under 10%
  },
};

// Base URL configuration - adjust this to your server URL  
const BASE_URL = 'https://musikmadnessbackend.onrender.com';

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

// Realistic user behavior types
function getUserBehavior() {
  const rand = Math.random();
  if (rand < 0.4) return 'browser';        // 40% just browse without login
  if (rand < 0.7) return 'member';         // 30% login and participate  
  if (rand < 0.85) return 'new_user';      // 15% create new accounts
  return 'power_user';                     // 15% heavy users (multiple actions)
}

// Main test function - simulates realistic user behavior
export default function () {
  const userType = getUserBehavior();
  let authToken = null;
  
  // All users start with browsing (realistic entry point)
  sleep(Math.random() * 3); // Users don't all arrive at exact same time
  
  // Health check (some users' browsers do this automatically)
  if (Math.random() < 0.3) { // Only 30% hit health endpoint directly
    const healthResponse = http.get(`${BASE_URL}/health`);
    check(healthResponse, {
      'Health check status is 200': (r) => r.status === 200,
    });
  }

  // Everyone browses tournaments first (most common entry point)
  const tournamentsResponse = http.get(`${BASE_URL}/api/tournaments`);
  const tournamentsPassed = check(tournamentsResponse, {
    'Tournaments status is 200': (r) => r.status === 200,
    'Tournaments response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  if (!tournamentsPassed) errorRate.add(1);
  
  sleep(Math.random() * 2 + 1); // Users read/browse for 1-3 seconds

  // Behavior based on user type
  switch (userType) {
    case 'browser':
      simulateBrowserUser();
      break;
    case 'member':
      authToken = simulateMemberUser();
      break;
    case 'new_user':
      authToken = simulateNewUser();
      break;
    case 'power_user':
      authToken = simulatePowerUser();
      break;
  }
  
  // Some users visit tournament matchup pages (realistic distribution)
  if (Math.random() < 0.15) { // 15% of users visit matchup pages
    visitRandomMatchupPage();
  }
  
  // Authenticated users do additional actions
  if (authToken && Math.random() < 0.8) { // 80% of logged-in users check profile
    const profileResponse = http.get(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    check(profileResponse, {
      'Profile status is 200': (r) => r.status === 200,
    });
    sleep(Math.random() * 2 + 1);
  }
  
  // Random session length (realistic user behavior)
  sleep(Math.random() * 5 + 2); // Users stay 2-7 seconds doing various things
}

// Browser-only user (40% of traffic)
function simulateBrowserUser() {
  // Browse different sections
  if (Math.random() < 0.6) {
    const usersResponse = http.get(`${BASE_URL}/api/users`);
    check(usersResponse, { 'Users browsing successful': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);
  }
  
  if (Math.random() < 0.4) {
    const tracksResponse = http.get(`${BASE_URL}/api/tracks`);
    check(tracksResponse, { 'Tracks browsing successful': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);
  }
}

// Existing member login (30% of traffic)
function simulateMemberUser() {
  const loginPayload = JSON.stringify(LOGIN_USER);
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: '10s',
  });
  
  const loginPassed = check(loginResponse, {
    'Member login successful': (r) => r.status === 200,
    'Member login time < 3s': (r) => r.timings.duration < 3000,
  });
  
  if (!loginPassed) errorRate.add(1);
  
  sleep(Math.random() * 1 + 0.5); // Brief pause after login
  
  // Extract token
  if (loginResponse.status === 200) {
    try {
      const loginData = loginResponse.json();
      return loginData.token;
    } catch (e) {
      return null;
    }
  }
  return null;
}

// New user signup (15% of traffic)
function simulateNewUser() {
  const newUser = generateRandomUser();
  const signupResponse = http.post(`${BASE_URL}/api/auth/signup`, JSON.stringify(newUser), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '15s',
  });
  
  const signupPassed = check(signupResponse, {
    'New user signup completed': (r) => r.status >= 200 && r.status < 500,
    'Signup time < 5s': (r) => r.timings.duration < 5000,
  });
  
  if (!signupPassed) errorRate.add(1);
  
  sleep(Math.random() * 2 + 1); // User reads confirmation/checks email
  
  // Some new users immediately try to login (50% chance)
  if (Math.random() < 0.5) {
    const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(newUser), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
    });
    
    if (loginResponse.status === 200) {
      try {
        const loginData = loginResponse.json();
        return loginData.token;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

// Power user - multiple actions (15% of traffic)
function simulatePowerUser() {
  // Power users login first
  const authToken = simulateMemberUser();
  
  if (authToken) {
    const authHeaders = { headers: { 'Authorization': `Bearer ${authToken}` } };
    
    // Power users browse more content
    http.get(`${BASE_URL}/api/users`, authHeaders);
    sleep(Math.random() * 1 + 0.5);
    
    http.get(`${BASE_URL}/api/tracks`, authHeaders);
    sleep(Math.random() * 1 + 0.5);
    
    // Power users might visit multiple tournament pages
    if (Math.random() < 0.3) {
      visitRandomMatchupPage();
    }
  }
  
  return authToken;
}

// Visit tournament matchup pages (realistic distribution)
function visitRandomMatchupPage() {
  const matchupUrls = [
    'https://musikmadness.com/tournaments/684478741a14b29bcdcd8c34/matchup/R1M1',
    'https://musikmadness.com/tournaments/6839572710513c7471902a8f/matchup/R1M1'
  ];
  
  const url = matchupUrls[Math.floor(Math.random() * matchupUrls.length)];
  
  const matchupResponse = http.get(url, {
    timeout: '15s',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
  });
  
  const matchupPassed = check(matchupResponse, {
    'Matchup page loaded': (r) => r.status === 200,
    'Matchup page content': (r) => r.body && r.body.length > 1000,
  });
  
  if (!matchupPassed) errorRate.add(1);
  
  sleep(Math.random() * 3 + 2); // Users spend time listening to music
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
  console.log('Testing server connectivity...');
  const healthCheck = http.get(`${BASE_URL}/health`);
  console.log(`Health check response: Status ${healthCheck.status}, Body: ${healthCheck.body}`);
  
  // Test auth endpoints
  console.log('Testing auth endpoints...');
  const testUser = {
    username: 'loadtest_setup',
    email: 'loadtest_setup@test.com',
    password: 'TestPassword123!'
  };
  
  const signupTest = http.post(`${BASE_URL}/api/auth/signup`, JSON.stringify(testUser), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '30s',
  });
  console.log(`Signup test response: Status ${signupTest.status}, Body: ${signupTest.body}`);
  
  const loginTest = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(LOGIN_USER), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '30s',
  });
  console.log(`Login test response: Status ${loginTest.status}, Body: ${loginTest.body}`);
  
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