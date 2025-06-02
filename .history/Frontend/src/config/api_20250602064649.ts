// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export { API_BASE_URL, BACKEND_URL };

// Default API instance configuration
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  tournaments: {
    base: '/tournaments',
    join: (id: string) => `/tournaments/${id}/join`,
    submissions: (id: string) => `/tournaments/${id}/submissions`,
  },
  matchups: {
    base: '/matchups',
    byTournament: (tournamentId: string) => `/matchups/tournament/${tournamentId}`,
    vote: (id: string) => `/matchups/${id}/vote`,
  },
  submissions: {
    base: '/submissions',
    upload: '/submissions/upload',
  },
  users: {
    base: '/users',
    profile: '/users/profile',
  },
};