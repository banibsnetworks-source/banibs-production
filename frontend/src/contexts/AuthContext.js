import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedAccess = localStorage.getItem('access_token');
    const storedRefresh = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');

    if (storedAccess && storedUser) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
        email,
        password
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Store tokens
      setAccessToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userData);

      // Persist to localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Also store as adminToken for Phase 5 admin API helpers
      localStorage.setItem('adminToken', access_token);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const logout = () => {
    // Clear state
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);

    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminToken');
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token } = response.data;
      setAccessToken(access_token);
      localStorage.setItem('access_token', access_token);

      return access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return null;
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    login,
    logout,
    refreshAccessToken,
    loading,
    isAuthenticated: !!accessToken && !!user,
    isAdmin: user?.roles?.includes('admin') || user?.roles?.includes('super_admin') || user?.roles?.includes('moderator')
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
