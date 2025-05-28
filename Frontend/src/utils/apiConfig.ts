// API base URL
export const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get default headers
export const getDefaultHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Helper function to get multipart headers (for file uploads)
export const getMultipartHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};
