import React from 'react';
import GlobalNavBar from '../GlobalNavBar';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * FullWidthLayout - For pages like Business Directory, Marketplace
 * Includes global header but NO left/right sidebars
 * Full-width content area for premium layouts
 * FULLY THEME-AWARE: Respects light/dark mode
 */
const FullWidthLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <>
      <GlobalNavBar />
      <div 
        className="full-width-layout-container"
        data-theme={theme}
        style={{ 
          minHeight: 'calc(100vh - 56px)',
          marginTop: '56px',
          backgroundColor: 'var(--bn-color-bg)',
          position: 'relative',
          transition: 'background-color 0.2s ease'
        }}
      >
        {children}
      </div>
    </>
  );
};

export default FullWidthLayout;
