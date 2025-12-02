import React from 'react';
import GlobalNavBar from '../GlobalNavBar';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * FullWidthLayout - For pages like Business Directory, Marketplace
 * Includes global header but NO left/right sidebars
 * Full-width content area for premium layouts
 */
const FullWidthLayout = ({ children }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <GlobalNavBar />
      <div 
        style={{ 
          minHeight: 'calc(100vh - 56px)',
          marginTop: '56px',
          backgroundColor: isDark ? 'rgb(10, 10, 12)' : 'rgb(249, 250, 251)',
          position: 'relative'
        }}
      >
        {children}
      </div>
    </>
  );
};

export default FullWidthLayout;
