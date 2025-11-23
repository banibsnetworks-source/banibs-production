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
  // FIX: Wait for both operations to complete before setting loading=false
  useEffect(() => {
    const initializeAccountMode = async () => {
      try {
        setLoading(true);
        
        // Step 1: Load saved mode from localStorage
        const savedData = loadAccountModeData();
        
        // Step 2: Fetch business profiles from API
        await fetchBusinessProfiles(savedData);
        
      } catch (error) {
        console.error('Failed to initialize account mode:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAccountMode();
  }, []);

  // Apply theme class to body based on mode
  useEffect(() => {
    const themeClass = mode === 'business' ? 'theme-connect' : 'theme-social';
    document.body.classList.remove('theme-social', 'theme-connect');
    document.body.classList.add(themeClass);
    
    return () => {
      document.body.classList.remove('theme-social', 'theme-connect');
    };
  }, [mode]);

  /**
   * Load saved account mode data from localStorage (synchronous)
   * Returns the saved data without triggering state updates yet
   */
  const loadAccountModeData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { mode: savedMode, businessProfileId } = JSON.parse(saved);
        setMode(savedMode);
        return { mode: savedMode, businessProfileId };
      }
    } catch (error) {
      console.error('Failed to load account mode:', error);
    }
    return { mode: 'personal', businessProfileId: null };
  };

  /**
   * Fetch user's business profiles
   * Uses XHR to bypass rrweb interference
   * @param {Object} savedData - Optional saved mode data from localStorage
   */
  const fetchBusinessProfiles = async (savedData = null) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      // Use XMLHttpRequest to bypass rrweb "Response body already used" error
      const profiles = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${process.env.REACT_APP_BACKEND_URL}/api/business/me/all`, true);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.withCredentials = true;
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch (e) {
              reject(new Error('Failed to parse business profiles'));
            }
          } else {
            reject(new Error(`Failed to load business profiles: ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error loading business profiles'));
        xhr.send();
      });

      setBusinessProfiles(profiles);

      // If user was in business mode, restore their selected profile
      if (savedData && savedData.mode === 'business' && savedData.businessProfileId) {
        const profile = profiles.find(p => p.id === savedData.businessProfileId);
        if (profile) {
          setSelectedBusinessProfile(profile);
        } else {
          // Profile not found, switch back to personal mode
          console.warn('Saved business profile not found, switching to personal mode');
          setMode('personal');
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            mode: 'personal',
            businessProfileId: null
          }));
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

    // Navigate to Business home (Phase 8.4)
    navigate('/portal/business');
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
