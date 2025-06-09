import hexport const options = {
  stages: [
    { duration: '15s', target: 200 },  // Users arrive gradually (morning/evening rush)
    { duration: '15s', target: 400 },  // More users join (peak time builds)
    { duration: '15s', target: 600 },  // Near peak traffic
    { duration: '10s', target: 800 }, // Peak moment (tournament event, viral post)
    { duration: '5s', target: 200 },   // Some users finish and leave
  ],m 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Realistic 1000-user simulation over 1 minute
export const options = {  stages: [
    { duration: '15s', target: 200 },  // Users arrive gradually (morning/evening rush)
    { duration: '15s', target: 400 },  // More users join (peak time builds)
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

// Main test function - simulates ultra-realistic user behavior
export default function () {
  const userType = getUserBehavior();
  let authToken = null;
  
  // Ultra-realistic arrival - users don't all hit the site immediately
  // Some users take much longer to actually interact
  sleep(Math.random() * 8 + 1); // 1-9 second delay (loading, reading, distraction)
  
  // Only a small percentage of users trigger health checks (automated tools, monitoring)
  if (Math.random() < 0.02) { // Only 2% hit health endpoint
    const healthResponse = http.get(`${BASE_URL}/health`, { timeout: '5s' });
    check(healthResponse, {
      'Health check status is 200': (r) => r.status === 200,
    });
    sleep(Math.random() * 0.5); // Very brief pause
  }

  // Many users leave before even loading the main content (bounce rate)
  if (Math.random() < 0.15) { // 15% bounce immediately
    sleep(Math.random() * 1 + 0.5); // Quick bounce
    return;
  }

  // Most users who stay do load the tournaments page (main entry point)
  if (Math.random() < 0.75) { // 75% of remaining users load content
    const tournamentsResponse = http.get(`${BASE_URL}/api/tournaments`, { timeout: '10s' });
    const tournamentsPassed = check(tournamentsResponse, {
      'Tournaments status is 200': (r) => r.status === 200,
      'Tournaments response time < 5s': (r) => r.timings.duration < 5000,
    });
    
    if (!tournamentsPassed) errorRate.add(1);
    
    // Users spend varying amounts of time reading/deciding
    sleep(Math.random() * 6 + 1); // 1-7 seconds reading/thinking
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
    // Only authenticated users might check their profile (and not many do)
  if (authToken && Math.random() < 0.25) { // Only 25% of logged-in users check profile
    const profileResponse = http.get(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      timeout: '6s'
    });
    check(profileResponse, {
      'Profile status is 200': (r) => r.status === 200,
    });
    sleep(Math.random() * 3 + 1); // Profile viewing time
  }
  
  // Ultra-realistic session end - most users leave very quickly
  switch (userType) {
    case 'idle_browser':
      sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds then leave
      break;
    case 'casual_browser':
      sleep(Math.random() * 5 + 2); // 2-7 seconds for casual browsing
      break;
    case 'member':
    case 'new_user':
      sleep(Math.random() * 10 + 3); // 3-13 seconds for engaged users
      break;
    case 'music_listener':
      sleep(Math.random() * 15 + 5); // 5-20 seconds listening to music
      break;
    case 'power_user':
      sleep(Math.random() * 20 + 10); // 10-30 seconds for power users
      break;
    default:
      sleep(Math.random() * 3 + 1); // Default short session
  }
}

// Idle browser user - minimal activity (60% of traffic)
function simulateIdleBrowser() {
  // Idle users barely interact - maybe check one page and leave
  if (Math.random() < 0.3) { // Only 30% even click anything
    const randomPage = Math.random() < 0.5 ? 'api/users' : 'api/tracks';
    const response = http.get(`${BASE_URL}/${randomPage}`, { timeout: '10s' });
    check(response, { 'Idle browsing successful': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 1); // 1-4 seconds then leave
  }
  // Most idle users just leave immediately after landing
  sleep(Math.random() * 2 + 0.5); // Very short stay
}

// Casual browser user - light browsing (20% of traffic)
function simulateCasualBrowser() {
  // Browse 1-3 pages casually
  const pagesToVisit = Math.floor(Math.random() * 3) + 1;
  const pages = ['api/users', 'api/tracks', 'api/tournaments'];
  
  for (let i = 0; i < pagesToVisit; i++) {
    const page = pages[Math.floor(Math.random() * pages.length)];
    const response = http.get(`${BASE_URL}/${page}`, { timeout: '8s' });
    check(response, { 'Casual browsing successful': (r) => r.status === 200 });
    sleep(Math.random() * 4 + 2); // 2-6 seconds reading each page
  }
}

// Music listener - specifically here for tournament music (6% of traffic)
function simulateMusicListener() {
  // Music listeners go straight to tournament matchups
  if (Math.random() < 0.8) { // 80% actually visit matchup pages
    visitRandomMatchupPage();
    
    // They might visit multiple matchups (music discovery)
    if (Math.random() < 0.4) { // 40% visit another matchup
      sleep(Math.random() * 2 + 1); // Brief pause between songs
      visitRandomMatchupPage();
    }
  }
  
  // Some also browse tracks
  if (Math.random() < 0.6) {
    const tracksResponse = http.get(`${BASE_URL}/api/tracks`, { timeout: '8s' });
    check(tracksResponse, { 'Music browsing successful': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 2); // Spend time looking at tracks
  }
}

// Existing member login (10% of traffic)
function simulateMemberUser() {
  const loginPayload = JSON.stringify(LOGIN_USER);
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: '15s', // More generous timeout for realistic load
  });
  
  const loginPassed = check(loginResponse, {
    'Member login attempted': (r) => r.status >= 200 && r.status < 500,
    'Member login time < 10s': (r) => r.timings.duration < 10000,
  });
  
  if (!loginPassed) errorRate.add(1);
  
  // Users take time after login (reading notifications, orientation)
  sleep(Math.random() * 3 + 1); // 1-4 seconds after login
  
  // Extract token if successful
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

// New user signup (3% of traffic)
function simulateNewUser() {
  const newUser = generateRandomUser();
  const signupResponse = http.post(`${BASE_URL}/api/auth/signup`, JSON.stringify(newUser), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '20s', // Generous timeout for database writes
  });
  
  const signupPassed = check(signupResponse, {
    'New user signup attempted': (r) => r.status >= 200 && r.status < 500,
    'Signup time < 15s': (r) => r.timings.duration < 15000,
  });
  
  if (!signupPassed) errorRate.add(1);
  
  // New users spend more time reading confirmation, checking email, etc.
  sleep(Math.random() * 5 + 2); // 2-7 seconds processing signup
  
  // Only some new users immediately try to login (30% chance - many check email first)
  if (Math.random() < 0.3 && signupResponse.status === 200) {
    sleep(Math.random() * 2 + 1); // Brief pause before login attempt
    
    const loginResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify(newUser), {
      headers: { 'Content-Type': 'application/json' },
      timeout: '12s',
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
  console.log('🚀 Starting ULTRA-REALISTIC load test...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('📊 Simulating 800 users over 1 minute with HIGHLY realistic behavior:');
  console.log('   • 60% Idle browsers (land and leave quickly)');
  console.log('   • 20% Casual browsers (browse 1-3 pages)');
  console.log('   • 10% Members (login and participate)');
  console.log('   • 6% Music listeners (focus on tournament songs)');
  console.log('   • 3% New users (signup attempts)');
  console.log('   • 1% Power users (heavy activity)');
  console.log('');
  console.log('⏱️  Timeline:');
  console.log('   0-15s: 200 users arrive (gradual morning/evening rush)');
  console.log('   15-30s: 400 users online (peak time builds)');
  console.log('   30-45s: 600 users online (near peak traffic)');
  console.log('   45-55s: 800 users online (peak moment - tournament/viral)');
  console.log('   55-60s: 200 users online (some finish and leave)');
  console.log('');
  console.log('🎯 Realistic behavior patterns:');
  console.log('   • Most users are passive/idle (like real web traffic)');
  console.log('   • Only ~13% actually login/signup (realistic conversion)');
  console.log('   • Natural timing delays and thinking pauses');
  console.log('   • Varied session lengths (most very short)');
  console.log('   • Tournament music is main draw for engaged users');
  
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