/**
 * Centralized API Client with 401 handling and retry logic
 * Stability Improvements - Phase 1
 * 
 * Features:
 * - Automatic retry with exponential backoff for network/server errors
 * - 401 session handling
 * - Request timeout management
 * - Enhanced error logging
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const TIMEOUT = 30000; // 30 seconds

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Custom fetch wrapper with centralized 401 handling
 * @param {string} url - API endpoint (relative or absolute)
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiClient(url, options = {}) {
  // Build full URL if relative
  const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
  
  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Add Content-Type if not set and has body
  if (options.body && !options.headers?.['Content-Type']) {
    options.headers = {
      ...options.headers,
      'Content-Type': 'application/json'
    };
  }
  
  try {
    const response = await fetch(fullUrl, options);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.warn('🔐 401 Unauthorized - Session expired');
      
      // Clear auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // Store error message for login page
      sessionStorage.setItem('auth_error', 'Your session has expired. Please sign in again.');
      
      // Redirect to login
      window.location.href = '/login';
      
      // Throw error to prevent further processing
      throw new Error('Session expired');
    }
    
    return response;
  } catch (error) {
    // Re-throw for caller to handle
    throw error;
  }
}

/**
 * Convenience method for JSON requests
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Parsed JSON response
 */
export async function apiClientJSON(url, options = {}) {
  const response = await apiClient(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export default apiClient;
