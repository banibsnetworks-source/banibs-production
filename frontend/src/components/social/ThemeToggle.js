import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeToggle - Quick theme switcher button
 * Can be placed in LeftRail or Settings pages
 */
const ThemeToggle = ({ showLabel = false, size = 'md' }) => {
  const { theme, toggleTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4'
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} rounded-lg transition-all duration-200`}
      style={{
        background: 'var(--hover-overlay)',
        color: 'var(--gold-primary)',
        border: `1px solid var(--border-subtle)`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--active-overlay)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--hover-overlay)';
      }}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? (
        <>
          <Sun size={iconSizes[size]} />
          {showLabel && <span style={{ fontSize: '14px', fontWeight: 500 }}>Light Mode</span>}
        </>
      ) : (
        <>
          <Moon size={iconSizes[size]} />
          {showLabel && <span style={{ fontSize: '14px', fontWeight: 500 }}>Dark Mode</span>}
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
