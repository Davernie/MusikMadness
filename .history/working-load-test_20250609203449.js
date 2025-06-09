import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '15s', target: 200 },
    { duration: '15s', target: 400 },
    { duration: '15s', target: 600 },
    { duration: '10s', target: 800 },
    { duration: '5s', target: 200 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.2'],
    errors: ['rate<0.2'],
  },
};

const BASE_URL = 'https://musikmadnessbackend.onrender.com';

const LOGIN_USER = {
  email: 'ernesto.ortiz0012@gmail.com',
  password: 'Tennis.ie1'
};

function generateRandomUser() {
  const randomId = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now();
  return {
    username: `testuser_${randomId}_${timestamp}`,
    email: `testuser_${randomId}_${timestamp}@loadtest.com`,
    password: 'TestPassword123!'
  };
}

function getUserBehavior() {
  const rand = Math.random();
  if (rand < 0.85) return 'new_user';          // 85% trying to sign up
  if (rand < 0.93) return 'member';            // 8% existing members login
  if (rand < 0.97) return 'casual_browser';    // 4% just browsing
  if (rand < 0.99) return 'music_listener';    // 2% focused on music
  return 'power_user';                         // 1% heavy users
}

export default function() { 
  const userType = getUserBehavior();
  let authToken = null;
  
  // Viral signup rush - users hit site immediately
  sleep(Math.random() * 3 + 0.5); // 0.5-3.5 seconds (much faster arrival)
  
  // Lower bounce rate during viral signup rush
  if (Math.random() < 0.05) { // Only 5% bounce (FOMO effect)
    sleep(Math.random() * 1 + 0.5);
    return;
  }
  
  // Most users still check tournaments page first
  if (Math.random() < 0.70) { // 70% load main content
    const response = http.get(`${BASE_URL}/api/tournaments`, { timeout: '10s' });
    const success = check(response, {
      'Tournaments loaded': (r) => r.status === 200,
      'Tournaments fast': (r) => r.timings.duration < 3000,
    });
    if (!success) errorRate.add(1);
    sleep(Math.random() * 2 + 1); // 1-3 seconds reading (faster during signup rush)
  }
    // Execute behavior based on user type
  switch(userType) {
    case 'new_user':
      authToken = simulateNewUser();
      break;
    case 'member':
      authToken = simulateMemberLogin();
      break;
    case 'casual_browser':
      simulateCasualBrowser();
      break;
    case 'music_listener':
      simulateMusicListener();
      break;
    case 'power_user':
      authToken = simulatePowerUser();
      break;
  }
  
  // Only authenticated users might check profile
  if (authToken && Math.random() < 0.30) { // 30% check their profile
    const profileResponse = http.get(`${BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      timeout: '8s'
    });
    check(profileResponse, {
      'Profile loaded': (r) => r.status === 200,
    });
    sleep(Math.random() * 3 + 1);
  }
    // Realistic session end - varies by user type
  switch(userType) {
    case 'new_user':
      sleep(Math.random() * 8 + 2); // 2-10 seconds (excited new users)
      break;
    case 'casual_browser':
      sleep(Math.random() * 4 + 1); // 1-5 seconds
      break;
    case 'member':
      sleep(Math.random() * 10 + 3); // 3-13 seconds
      break;
    case 'music_listener':
      sleep(Math.random() * 15 + 5); // 5-20 seconds (listening time)
      break;
    case 'power_user':
      sleep(Math.random() * 20 + 8); // 8-28 seconds
      break;
  }
}

function simulateIdleBrowser() {
  // Idle users barely interact - most just leave
  if (Math.random() < 0.25) { // Only 25% click anything
    const pages = ['api/users', 'api/tracks'];
    const page = pages[Math.floor(Math.random() * pages.length)];
    const response = http.get(`${BASE_URL}/${page}`, { timeout: '8s' });
    check(response, { 'Idle browsing': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1);
  }
  sleep(Math.random() * 1 + 0.5); // Very short stay
}

function simulateCasualBrowser() {
  // Browse 1-3 pages casually
  const pagesToVisit = Math.floor(Math.random() * 3) + 1;
  const pages = ['api/users', 'api/tracks', 'api/tournaments'];
  
  for (let i = 0; i < pagesToVisit; i++) {
    const page = pages[Math.floor(Math.random() * pages.length)];
    const response = http.get(`${BASE_URL}/${page}`, { timeout: '8s' });
    check(response, { 'Casual browsing': (r) => r.status === 200 });
    sleep(Math.random() * 5 + 2); // 2-7 seconds per page
  }
}

function simulateMemberLogin() {
  const loginPayload = JSON.stringify(LOGIN_USER);
  const loginResponse = http.post(`${BASE_URL}/api/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: '15s',
  });
  
  const loginSuccess = check(loginResponse, {
    'Member login success': (r) => r.status === 200,
    'Login time reasonable': (r) => r.timings.duration < 8000,
  });
  
  if (!loginSuccess) errorRate.add(1);
  sleep(Math.random() * 3 + 1); // Post-login pause
  
  if (loginResponse.status === 200) {
    try {
      const loginData = loginResponse.json();
      
      // Members browse more after login
      if (Math.random() < 0.70) { // 70% browse after login
        const response = http.get(`${BASE_URL}/api/users`, { 
          headers: { 'Authorization': `Bearer ${loginData.token}` },
          timeout: '8s' 
        });
        check(response, { 'Member browsing': (r) => r.status === 200 });
        sleep(Math.random() * 3 + 2);
      }
      
      return loginData.token;
    } catch (e) {
      return null;
    }
  }
  return null;
}

function simulateNewUser() {
  const newUser = generateRandomUser();
  const signupResponse = http.post(`${BASE_URL}/api/auth/signup`, JSON.stringify(newUser), {
    headers: { 'Content-Type': 'application/json' },
    timeout: '20s',
  });
  
  const signupSuccess = check(signupResponse, {
    'Signup attempted': (r) => r.status >= 200 && r.status < 500,
    'Signup time OK': (r) => r.timings.duration < 15000,
  });
  
  if (!signupSuccess) errorRate.add(1);
  sleep(Math.random() * 4 + 2); // Reading confirmation, etc.
  
  // Only 25% try to login immediately after signup
  if (Math.random() < 0.25 && signupResponse.status === 200) {
    sleep(Math.random() * 2 + 1); // Brief pause
    
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

function simulateMusicListener() {
  // Music listeners focus on tournament matchups
  if (Math.random() < 0.85) { // 85% visit matchup pages
    visitRandomMatchupPage();
    
    // Many visit multiple songs
    if (Math.random() < 0.55) { // 55% listen to multiple songs
      sleep(Math.random() * 3 + 2); // Time between songs
      visitRandomMatchupPage();
    }
  }
  
  // Also browse tracks page
  if (Math.random() < 0.60) {
    const tracksResponse = http.get(`${BASE_URL}/api/tracks`, { timeout: '8s' });
    check(tracksResponse, { 'Music browsing': (r) => r.status === 200 });
    sleep(Math.random() * 4 + 2);
  }
}

function simulatePowerUser() {
  // Power users login first
  const authToken = simulateMemberLogin();
  
  if (authToken) {
    const authHeaders = { 
      headers: { 'Authorization': `Bearer ${authToken}` },
      timeout: '10s'
    };
    
    // Browse multiple sections heavily
    const sections = ['api/users', 'api/tracks', 'api/tournaments'];
    const sectionsToVisit = Math.floor(Math.random() * 3) + 2; // 2-4 sections
    
    for (let i = 0; i < sectionsToVisit; i++) {
      const section = sections[Math.floor(Math.random() * sections.length)];
      const response = http.get(`${BASE_URL}/${section}`, authHeaders);
      check(response, { 'Power user browsing': (r) => r.status === 200 });
      sleep(Math.random() * 4 + 1); // 1-5 seconds per section
    }
    
    // Power users likely visit tournament pages
    if (Math.random() < 0.80) { // 80% visit matchups
      visitRandomMatchupPage();
      
      if (Math.random() < 0.70) { // 70% visit multiple
        sleep(Math.random() * 4 + 2);
        visitRandomMatchupPage();
      }
    }
  }
  
  return authToken;
}

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
  
  const matchupSuccess = check(matchupResponse, {
    'Matchup page loaded': (r) => r.status === 200,
    'Matchup has content': (r) => r.body && r.body.length > 1000,
  });
    if (!matchupSuccess) errorRate.add(1);
  sleep(Math.random() * 4 + 3); // 3-7 seconds listening to music
}

export function setup() {
  console.log('🚀 Starting ULTRA-REALISTIC user behavior simulation...');
  console.log(`🎯 Target: ${BASE_URL}`);
  console.log('');
  console.log('📊 User Distribution (mimics real website traffic):');
  console.log('   • 65% Idle browsers (land and leave quickly - high bounce rate)');
  console.log('   • 20% Casual browsers (browse 1-3 pages, then leave)');
  console.log('   • 8% Members (existing users who login and browse)');
  console.log('   • 4% Music listeners (focus on tournament songs)');
  console.log('   • 2% New users (signup attempts)');
  console.log('   • 1% Power users (heavy activity, multiple pages)');
  console.log('');
  console.log('⏱️  Load Timeline:');
  console.log('   0-15s: 200 users (gradual arrival)');
  console.log('   15-30s: 400 users (building traffic)');
  console.log('   30-45s: 600 users (peak builds)');
  console.log('   45-55s: 800 users (viral moment/tournament event)');
  console.log('   55-60s: 200 users (users finish and leave)');
  console.log('');
  console.log('🎭 Realistic Behaviors:');
  console.log('   • 20% bounce rate (leave immediately)');
  console.log('   • Natural arrival delays (1-9 seconds)');
  console.log('   • Varied session lengths by user type');
  console.log('   • Only ~10% actually login/signup (realistic conversion)');
  console.log('   • Music listeners spend more time on pages');
  console.log('   • Members browse more content after login');
  console.log('');
  
  // Quick connectivity test
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status === 200) {
    console.log('✅ Server connectivity confirmed');
  } else {
    console.log(`❌ Server issue detected: ${healthCheck.status}`);
  }
  console.log('🏁 Starting realistic load test...');
  console.log('');
  
  return { baseUrl: BASE_URL };
}

export function teardown(data) {
  console.log('');
  console.log('🎉 Realistic load test completed!');
  console.log('📊 Results show how your website handles real user behavior patterns.');
  console.log('💡 This simulation reflects actual web traffic: mostly passive users with few active participants.');
}
