/**
 * BANIBS Mobile - Axios Instance with Interceptors
 * Phase M5.1 - Auth Wiring
 * 
 * Configured axios instance with:
 * - Auth token attachment
 * - 401/403 handling
 * - Request/response logging (for debugging ADCS)
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from '../config/api';

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

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
    });
    return response;
  },
  async (error) => {
    const {config, response} = error;
    
    // Log ADCS rejections clearly
    if (response) {
      console.error('❌ API Error:', {
        status: response.status,
        url: config?.url,
        detail: response.data?.detail || response.data?.error,
        // ADCS specific
        request_id: response.data?.request_id,
        reasons: response.data?.reasons,
      });
      
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.warn('🔒 Unauthorized - clearing token');
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('user');
        
        // You can emit an event here to trigger logout in your app
        // or navigate to login screen
      }
      
      // Handle 403 Forbidden - ADCS denial or insufficient permissions
      if (response.status === 403) {
        console.warn('🚫 Forbidden:', response.data?.detail);
      }
      
      // Handle 202 Accepted - ADCS pending approval
      if (response.status === 202) {
        console.warn('⏳ Pending Approval:', response.data);
      }
    } else {
      console.error('❌ Network Error:', {
        message: error.message,
        url: config?.url,
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
