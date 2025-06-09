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

export default function() { 
  const rand = Math.random();
  let userType = 'idle_browser';
  if (rand > 0.60) userType = 'casual_browser';
  if (rand > 0.80) userType = 'member'; 
  if (rand > 0.90) userType = 'music_listener';
  
  sleep(Math.random() * 3 + 1);
  
  if (Math.random() < 0.75) {
    const response = http.get(`${BASE_URL}/api/tournaments`, { timeout: '10s' });
    check(response, {
      'Tournaments loaded': (r) => r.status === 200,
    });
    sleep(Math.random() * 2 + 1);
  }
  
  if (userType === 'music_listener' && Math.random() < 0.5) {
    const matchupResponse = http.get('https://musikmadness.com/tournaments/684478741a14b29bcdcd8c34/matchup/R1M1', {
      timeout: '15s',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    check(matchupResponse, {
      'Matchup page loaded': (r) => r.status === 200,
    });
    sleep(Math.random() * 5 + 2);
  }
  
  sleep(Math.random() * 3 + 1);
}
