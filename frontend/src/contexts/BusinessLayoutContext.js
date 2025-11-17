import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

/**
 * BusinessLayoutContext - Phase 8.4
 * Manages Business Left Rail collapse state and persists to user preferences
 */
const BusinessLayoutContext = createContext({
  isCollapsed: false,
  toggleCollapse: () => {},
  setCollapsed: () => {}
});

export const useBusinessLayout = () => {
  const context = useContext(BusinessLayoutContext);
  if (!context) {
    throw new Error('useBusinessLayout must be used within BusinessLayoutProvider');
  }
  return context;
};

export const BusinessLayoutProvider = ({ children }) => {
  const { user } = useAuth();
  // Always start expanded to avoid layout issues
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load collapse state from user preferences on mount
  useEffect(() => {
    const loadCollapseState = async () => {
      try {
        // Check localStorage first for instant load
        const localState = localStorage.getItem('banibs_business_rail_collapsed');
        if (localState === 'true') {
          setIsCollapsed(true);
        }

        // Then fetch from server if authenticated
        if (user) {
          const token = localStorage.getItem('access_token');
          
          // Use XHR to bypass rrweb interference
          const settings = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', `${process.env.REACT_APP_BACKEND_URL}/api/social/settings`, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.withCredentials = true;
            
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                  reject(new Error('Failed to parse settings'));
                }
              } else {
                // Silently fail on auth errors
                resolve(null);
              }
            };
            
            xhr.onerror = () => resolve(null);
            xhr.send();
          });

          if (settings && settings.business_rail_collapsed !== undefined) {
            setIsCollapsed(settings.business_rail_collapsed);
            localStorage.setItem('banibs_business_rail_collapsed', settings.business_rail_collapsed);
          }
        }
      } catch (err) {
        console.error('Error loading business collapse state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCollapseState();
  }, [user]);

  const toggleCollapse = async () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    
    // Save to localStorage immediately
    localStorage.setItem('banibs_business_rail_collapsed', newState);

    // Persist to server
    try {
      const token = localStorage.getItem('access_token');
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            business_rail_collapsed: newState
          })
        }
      );
    } catch (err) {
      console.error('Error saving business collapse state:', err);
    }
  };

  const setCollapsed = (value) => {
    setIsCollapsed(value);
    localStorage.setItem('banibs_business_rail_collapsed', value);
  };

  return (
    <BusinessLayoutContext.Provider 
      value={{ 
        isCollapsed, 
        toggleCollapse,
        setCollapsed,
        isLoading
      }}
    >
      {children}
    </BusinessLayoutContext.Provider>
  );
};
