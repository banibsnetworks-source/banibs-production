/**
 * BANIBS Mobile - Auth Service
 * Phase M1 - Mobile Shell
 * 
 * API calls for authentication
 */

import axios from 'axios';

// Use environment variable or default to localhost for development
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const authService = {
  async login(email, password) {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        {email, password},
        {
          headers: {'Content-Type': 'application/json'},
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail || 'Login failed. Please try again.',
      );
    }
  },

  async register(firstName, lastName, email, password) {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
        },
        {
          headers: {'Content-Type': 'application/json'},
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.detail ||
          'Registration failed. Please try again.',
      );
    }
  },
};

export default authService;
