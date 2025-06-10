// API base URL - use environment variable for deployment flexibility
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get stored token (checks both localStorage and sessionStorage)
const getStoredToken = (): string | null => {
  // Check localStorage first (for "Remember Me"), then sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Helper function to get default headers
export const getDefaultHeaders = () => {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper function to get multipart headers (for file uploads)
export const getMultipartHeaders = () => {
  const token = getStoredToken();
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
