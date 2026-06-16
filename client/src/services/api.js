const getApiUrl = () => {
  // Try to get from import.meta.env, fallback to relative /api
  try {
    return import.meta.env.VITE_API_URL || '/api';
  } catch (e) {
    return '/api';
  }
};

import axios from 'axios';

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true, // Crucial for sending httpOnly cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if error is due to authentication failure
    if (error.response && error.response.status === 401) {
      // Clean auth state (redirects can be handled by contexts or page components)
      loggerWarn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

// Simple logging helper
function loggerWarn(msg) {
  try {
    console.warn(`[API] ${msg}`);
  } catch (e) {}
}

export default api;
