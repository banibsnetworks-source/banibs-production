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
 * Check if error is retryable
 */
const isRetryableError = (error, response) => {
  // Network errors (no response)
  if (!response) return true;
  
  // Server errors (5xx)
  if (response?.status >= 500) return true;
  
  // Rate limiting (429)
  if (response?.status === 429) return true;
  
  // Timeout errors
  if (error?.name === 'AbortError') return true;
  
  return false;
};

/**
 * Custom fetch wrapper with retry logic and 401 handling
 * @param {string} url - API endpoint (relative or absolute)
 * @param {RequestInit} options - Fetch options
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Response>}
 */
export async function apiClient(url, options = {}, retryCount = 0) {
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
  
  // Add timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  options.signal = controller.signal;
  
  try {
    const response = await fetch(fullUrl, options);
    clearTimeout(timeoutId);
    
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
    
    // Retry on server errors
    if (isRetryableError(null, response) && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(`⚠️ Retryable error (${response.status}), retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return apiClient(url, options, retryCount + 1);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle timeout
    if (error.name === 'AbortError' && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(`⏱️ Request timeout, retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return apiClient(url, options, retryCount + 1);
    }
    
    // Retry on network errors
    if (isRetryableError(error, null) && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(`🌐 Network error, retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES}):`, error.message);
      await sleep(delay);
      return apiClient(url, options, retryCount + 1);
    }
    
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
