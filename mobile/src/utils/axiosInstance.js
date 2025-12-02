/**
 * BANIBS Mobile - Enhanced Axios Instance
 * Stability Improvements - Phase 1
 * 
 * Configured axios instance with:
 * - Auth token attachment
 * - 401/403 handling
 * - Request/response logging (for debugging ADCS)
 * - Automatic retry with exponential backoff
 * - Enhanced error reporting
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '../config/api';

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Check if error is retryable
 */
const isRetryableError = (error) => {
  // Network errors
  if (!error.response) return true;
  
  // Server errors (5xx)
  if (error.response?.status >= 500) return true;
  
  // Rate limiting (429)
  if (error.response?.status === 429) return true;
  
  // Timeout errors
  if (error.code === 'ECONNABORTED') return true;
  
  return false;
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - attach auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging (especially ADCS)
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasAuth: !!token,
      });
      
      return config;
    } catch (error) {
      console.error('❌ Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and retry logic
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      retries: response.config.__retryCount || 0,
    });
    return response;
  },
  async (error) => {
    const {config, response} = error;
    
    // Initialize retry count
    config.__retryCount = config.__retryCount || 0;
    
    // Log ADCS rejections clearly
    if (response) {
      console.error('❌ API Error:', {
        status: response.status,
        url: config?.url,
        detail: response.data?.detail || response.data?.error,
        // ADCS specific
        request_id: response.data?.request_id,
        reasons: response.data?.reasons,
        retryCount: config.__retryCount,
      });
      
      // Handle 401 Unauthorized - token expired or invalid (no retry)
      if (response.status === 401) {
        console.warn('🔒 Unauthorized - clearing token');
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('user');
        
        // You can emit an event here to trigger logout in your app
        // or navigate to login screen
        return Promise.reject(error);
      }
      
      // Handle 403 Forbidden - ADCS denial or insufficient permissions (no retry)
      if (response.status === 403) {
        console.warn('🚫 Forbidden:', response.data?.detail);
        return Promise.reject(error);
      }
      
      // Handle 202 Accepted - ADCS pending approval (no retry)
      if (response.status === 202) {
        console.warn('⏳ Pending Approval:', response.data);
        return Promise.reject(error);
      }
    } else {
      console.error('❌ Network Error:', {
        message: error.message,
        code: error.code,
        url: config?.url,
        retryCount: config.__retryCount,
      });
    }
    
    // Retry logic for retryable errors
    if (isRetryableError(error) && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
      
      console.warn(`⚠️ Retrying request... (attempt ${config.__retryCount}/${MAX_RETRIES}) in ${delay}ms`);
      await sleep(delay);
      
      return axiosInstance(config);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
