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
    // Also add/remove .dark class for Tailwind CSS
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load theme from server after mount (if authenticated)
  useEffect(() => {
    const loadServerTheme = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) return;

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
              // Silently fail on 401/403 - user may not be logged in
              resolve(null);
            }
          };
          
          xhr.onerror = () => resolve(null);
          xhr.send();
        });

        if (settings && settings.theme && settings.theme !== theme) {
          setThemeState(settings.theme);
          localStorage.setItem('banibs_theme', settings.theme);
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
    // Also add/remove .dark class for Tailwind CSS
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
