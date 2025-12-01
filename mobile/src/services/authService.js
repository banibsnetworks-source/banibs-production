/**
 * BANIBS Mobile - Auth Service
 * Phase M5.1 - Updated with axios interceptors
 * 
 * API calls for authentication
 */

import axiosInstance from '../utils/axiosInstance';
import {API_ENDPOINTS} from '../config/api';

export const authService = {
  async login(email, password) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.LOGIN, {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Login failed. Please try again.',
      );
    }
  },

  async register(firstName, lastName, email, password) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.REGISTER, {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        accepted_terms: true, // Required by backend
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail ||
          'Registration failed. Please try again.',
      );
    }
  },

  async getMe() {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Failed to get user info.',
      );
    }
  },
};

export default authService;
