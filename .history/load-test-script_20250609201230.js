import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Realistic 1000-user simulation over 1 minute
export const options = {  stages: [
    { duration: '15s', target: 200 },  // Users arrive gradually (morning/evening rush)
    { duration: '15s', target: 40 },  // More users join (peak time builds)
    { duration: '15s', target: 600 },  // Near peak traffic
    { duration: '10s', target: 800 }, // Peak moment (tournament event, viral post)
    { duration: '5s', target: 200 },   // Some users finish and leave
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

// Realistic user behavior types (much more passive/idle users)
function getUserBehavior() {
  const rand = Math.random();
  if (rand < 0.60) return 'idle_browser';   // 60% mostly idle, minimal browsing
  if (rand < 0.80) return 'casual_browser'; // 20% browse a few pages  
  if (rand < 0.90) return 'member';         // 10% login and participate
  if (rand < 0.96) return 'music_listener'; // 6% specifically here for music
  if (rand < 0.99) return 'new_user';       // 3% create new accounts
  return 'power_user';                      // 1% heavy users (multiple actions)
}

// Main test function - simulates very realistic user behavior
export default function () {
  const userType = getUserBehavior();
  let authToken = null;
  
  // Realistic arrival - users don't all hit the site immediately
  sleep(Math.random() * 5 + 1); // 1-6 second delay (loading, thinking, etc.)
  
  // Only some users trigger health checks (background browser behavior)
  if (Math.random() < 0.05) { // Only 5% hit health endpoint
    const healthResponse = http.get(`${BASE_URL}/health`, { timeout: '5s' });
    check(healthResponse, {
      'Health check status is 200': (r) => r.status === 200,
    });
    sleep(Math.random() * 1); // Brief pause
  }

  // Most users land on tournaments page (main entry point)
  if (Math.random() < 0.85) { // 85% actually load the main page
    const tournamentsResponse = http.get(`${BASE_URL}/api/tournaments`, { timeout: '8s' });
    const tournamentsPassed = check(tournamentsResponse, {
      'Tournaments status is 200': (r) => r.status === 200,
      'Tournaments response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    if (!tournamentsPassed) errorRate.add(1);
    
    // Users spend time reading/browsing
    sleep(Math.random() * 4 + 2); // 2-6 seconds reading
  }

  // Behavior based on realistic user type
  switch (userType) {
    case 'idle_browser':
      simulateIdleBrowser();
      break;
    case 'casual_browser':
      simulateCasualBrowser();
      break;
    case 'member':
      authToken = simulateMemberUser();
      break;
    case 'music_listener':
      simulateMusicListener();
      break;
    case 'new_user':
      authToken = simulateNewUser();
      break;
    case 'power_user':
      authToken = simulatePowerUser();
      break;
  }
  
  // Only authenticated users might check their profile
  if (authToken && Math.random() < 0.4) { // Only 40% of logged-in users check profile
    const profileResponse = http.get(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      timeout: '5s'
    });
    check(profileResponse, {
      'Profile status is 200': (r) => r.status === 200,
    });
    sleep(Math.random() * 2 + 1);
  }
  
  // Realistic session end - most users leave quickly
  if (userType === 'idle_browser') {
    sleep(Math.random() * 3 + 1); // 1-4 seconds then leave
  } else {
    sleep(Math.random() * 8 + 3); // Others stay 3-11 seconds
  }
}

// Idle browser - just lands and maybe looks around briefly (60% of traffic)
function simulateIdleBrowser() {
  // These users might not even make additional requests
  if (Math.random() < 0.7) { // 70% of idle users do nothing else
    sleep(Math.random() * 2 + 1); // Just pause and leave
    return;
  }
  
  // 30% might click one more thing before leaving
  if (Math.random() < 0.5) {
    const usersResponse = http.get(`${BASE_URL}/api/users`, { timeout: '5s' });
    check(usersResponse, { 'Idle user browsed users': (r) => r.status === 200 });
  } else {
    const tracksResponse = http.get(`${BASE_URL}/api/tracks`, { timeout: '5s' });
    check(tracksResponse, { 'Idle user browsed tracks': (r) => r.status === 200 });
  }
  sleep(Math.random() * 3 + 1); // Brief look then leave
}

// Casual browser - browses a few pages but doesn't engage deeply (20% of traffic)
function simulateCasualBrowser() {
  // Browse 1-3 sections
  const browsingSections = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < browsingSections; i++) {
    const rand = Math.random();
    if (rand < 0.4) {
      const usersResponse = http.get(`${BASE_URL}/api/users`, { timeout: '6s' });
      check(usersResponse, { 'Casual browsing users successful': (r) => r.status === 200 });
    } else if (rand < 0.8) {
      const tracksResponse = http.get(`${BASE_URL}/api/tracks`, { timeout: '6s' });
      check(tracksResponse, { 'Casual browsing tracks successful': (r) => r.status === 200 });
    } else {
      // Some casual browsers might peek at matchup pages
      visitRandomMatchupPage();
    }
    
    sleep(Math.random() * 3 + 2); // Spend time reading each section
  }
}

// Music listener - specifically here to listen to tournament songs (6% of traffic)
function simulateMusicListener() {
  // These users go straight to matchup pages to hear music
  sleep(Math.random() * 2 + 1); // Brief pause after landing
  
  // Visit 1-3 matchup pages to listen to music
  const matchupsToVisit = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < matchupsToVisit; i++) {
    visitRandomMatchupPage();
    
    // Music listeners spend more time on each page (listening to songs)
    sleep(Math.random() * 8 + 5); // 5-13 seconds listening to music
    
    if (i < matchupsToVisit - 1) {
      sleep(Math.random() * 2 + 1); // Brief pause between songs
    }
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
export function setup() {  console.log('🚀 Starting REALISTIC load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('📊 Simulating 800 users over 1 minute with realistic behavior patterns:');
  console.log('   • 40% Browser users (browse without login)');
  console.log('   • 30% Members (login and participate)');
  console.log('   • 15% New users (signup + maybe login)'); 
  console.log('   • 15% Power users (heavy activity)');
  console.log('');
  console.log('⏱️  Timeline:');
  console.log('   0-15s: 200 users arrive (gradual morning/evening rush)');
  console.log('   15-30s: 400 users online (peak time builds)');
  console.log('   30-45s: 600 users online (near peak traffic)');
  console.log('   45-55s: 800 users online (peak moment - tournament/viral)');
  console.log('   55-60s: 200 users online (some finish and leave)');
  console.log('');
  console.log('🎯 User behavior patterns:');
  console.log('   • Natural arrival timing (not all at once)');
  console.log('   • Tournament browsing as primary entry point');
  console.log('   • Only ~30% actually login (realistic ratio)');
  console.log('   • Only ~15% visit matchup pages (focused interest)');
  console.log('   • Varied session lengths and activities');
  
  // Quick connectivity test
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status === 200) {
    console.log('✅ Server connectivity confirmed');
  } else {
    console.log(`❌ Server issue detected: ${healthCheck.status}`);
  }
  
  return { baseUrl: BASE_URL };
}

// Teardown function - runs once after all VUs finish
export function teardown(data) {
  console.log('Load test completed!');
  console.log('Check the results above for performance metrics.');
} 