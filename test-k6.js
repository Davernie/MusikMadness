import http from 'k6/http';
import { check } from 'k6';

export const options = {
  duration: '10s',
  vus: 1,
};

export default function () {
  const response = http.get('https://musikmadnessbackend.onrender.com/health');
  check(response, {
    'is status 200': (r) => r.status === 200,
  });
}
