import React, { createContext, useContext, useState, useEffect } from 'react';
import { contributorAPI } from '../services/api';

const ContributorAuthContext = createContext(null);

export const useContributorAuth = () => {
  const context = useContext(ContributorAuthContext);
  if (!context) {
    throw new Error('useContributorAuth must be used within ContributorAuthProvider');
  }
  return context;
};

export const ContributorAuthProvider = ({ children }) => {
  const [contributor, setContributor] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccess = localStorage.getItem('contributor_access_token');
    const storedContributor = localStorage.getItem('contributor_user');

    if (storedAccess && storedContributor) {
      setAccessToken(storedAccess);
      setContributor(JSON.parse(storedContributor));
    }
    setLoading(false);
  }, []);

  const register = async (email, password, name, organization) => {
    try {
      const response = await contributorAPI.register(email, password, name, organization);
      const { access_token, contributor: contributorData } = response.data;

      setAccessToken(access_token);
      setContributor(contributorData);

      localStorage.setItem('contributor_access_token', access_token);
      localStorage.setItem('contributor_user', JSON.stringify(contributorData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await contributorAPI.login(email, password);
      const { access_token, contributor: contributorData } = response.data;

      setAccessToken(access_token);
      setContributor(contributorData);

      localStorage.setItem('contributor_access_token', access_token);
      localStorage.setItem('contributor_user', JSON.stringify(contributorData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const logout = () => {
    setAccessToken(null);
    setContributor(null);
    localStorage.removeItem('contributor_access_token');
    localStorage.removeItem('contributor_user');
  };

  const value = {
    contributor,
    accessToken,
    register,
    login,
    logout,
    loading,
    isAuthenticated: !!accessToken && !!contributor
  };

  return (
    <ContributorAuthContext.Provider value={value}>
      {children}
    </ContributorAuthContext.Provider>
  );
};
