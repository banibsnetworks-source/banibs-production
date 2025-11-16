import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Account Mode Context - Dual-Layout System
 * Manages Personal ↔ Business Mode Switching
 * 
 * Mode Types:
 * - "personal" → BANIBS Social (blue theme)
 * - "business" → BANIBS Connect (gold theme)
 * 
 * State includes:
 * - Current mode
 * - Selected business profile (if in business mode)
 * - List of user's business profiles
 */

const AccountModeContext = createContext();

const STORAGE_KEY = 'banibs_account_mode';

export const AccountModeProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // State
  const [mode, setMode] = useState('personal'); // 'personal' | 'business'
  const [selectedBusinessProfile, setSelectedBusinessProfile] = useState(null);
  const [businessProfiles, setBusinessProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved mode and business profiles on mount
  useEffect(() => {
    loadAccountMode();
    fetchBusinessProfiles();
  }, []);

  /**
   * Load saved account mode from localStorage
   */
  const loadAccountMode = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { mode: savedMode, businessProfileId } = JSON.parse(saved);
        setMode(savedMode);
        if (savedMode === 'business' && businessProfileId) {
          // We'll set the selected profile after fetching from API
          // For now, just store the ID
          sessionStorage.setItem('pending_business_profile_id', businessProfileId);
        }
      }
    } catch (error) {
      console.error('Failed to load account mode:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch user's business profiles
   */
  const fetchBusinessProfiles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/me/all`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const profiles = await response.json();
        setBusinessProfiles(profiles);

        // If there's a pending profile ID, select it
        const pendingId = sessionStorage.getItem('pending_business_profile_id');
        if (pendingId) {
          const profile = profiles.find(p => p.id === pendingId);
          if (profile) {
            setSelectedBusinessProfile(profile);
          }
          sessionStorage.removeItem('pending_business_profile_id');
        }
      }
    } catch (error) {
      console.error('Failed to fetch business profiles:', error);
    }
  };

  /**
   * Switch to Personal Mode
   */
  const switchToPersonal = () => {
    setMode('personal');
    setSelectedBusinessProfile(null);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mode: 'personal',
      businessProfileId: null
    }));

    // Navigate to Social home
    navigate('/portal/social');
  };

  /**
   * Switch to Business Mode
   */
  const switchToBusiness = (businessProfile) => {
    if (!businessProfile) {
      console.error('No business profile provided');
      return;
    }

    setMode('business');
    setSelectedBusinessProfile(businessProfile);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      mode: 'business',
      businessProfileId: businessProfile.id
    }));

    // Navigate to Connect home
    navigate('/portal/connect');
  };

  /**
   * Refresh business profiles (after creating/updating)
   */
  const refreshBusinessProfiles = async () => {
    await fetchBusinessProfiles();
  };

  const value = {
    mode,
    selectedBusinessProfile,
    businessProfiles,
    loading,
    switchToPersonal,
    switchToBusiness,
    refreshBusinessProfiles,
    isPersonalMode: mode === 'personal',
    isBusinessMode: mode === 'business',
    currentTheme: mode === 'business' ? 'connect' : 'social' // For theme CSS classes
  };

  return (
    <AccountModeContext.Provider value={value}>
      {children}
    </AccountModeContext.Provider>
  );
};

export const useAccountMode = () => {
  const context = useContext(AccountModeContext);
  if (!context) {
    throw new Error('useAccountMode must be used within AccountModeProvider');
  }
  return context;
};

export default AccountModeContext;
