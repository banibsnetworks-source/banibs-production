import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * FullWidthLayout - For pages like Business Directory, Marketplace
 * Full-width content area for premium layouts
 * FULLY THEME-AWARE: Respects light/dark mode
 * 
 * NOTE: Global navigation (BanibsNetworkNav) is rendered at App.js level
 */
const FullWidthLayout = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div 
      className="full-width-layout-container"
      data-theme={theme}
      style={{ 
        minHeight: 'calc(100vh - 56px)',
        backgroundColor: 'var(--bn-color-bg)',
        position: 'relative',
        transition: 'background-color 0.2s ease'
      }}
    >
      {children}
    </div>
  );
};

export default FullWidthLayout;
