import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ThemeContext - Light/Dark Mode Management
 * Persists to user settings and localStorage
 */
const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {}
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // Initialize from localStorage immediately
    const saved = localStorage.getItem('banibs_theme');
    return saved || 'dark';
  });
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme to document on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load theme from server after mount (if authenticated)
  useEffect(() => {
    const loadServerTheme = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/social/settings`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          }
        );

        if (response.ok) {
          const settings = await response.json();
          if (settings.theme && settings.theme !== theme) {
            setThemeState(settings.theme);
            localStorage.setItem('banibs_theme', settings.theme);
          }
        }
      } catch (err) {
        console.error('Error loading theme from server:', err);
      }
    };

    loadServerTheme();
  }, []);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('banibs_theme', newTheme);

    // Persist to server
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/social/settings`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ theme: newTheme })
          }
        );
      }
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
