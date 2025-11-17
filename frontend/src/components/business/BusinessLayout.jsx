import React from 'react';
import { BusinessLayoutProvider, useBusinessLayout } from '../../contexts/BusinessLayoutContext';
import BusinessLeftRail from './BusinessLeftRail/BusinessLeftRail';
import GlobalNavBar from '../GlobalNavBar';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BusinessLayout - Phase 8.4
 * 2-column layout: BusinessLeftRail (nav) | Center (content)
 * Mirrors SocialLayout architecture with business-specific navigation
 */
const BusinessLayoutContent = ({ children }) => {
  const { isCollapsed } = useBusinessLayout();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      <GlobalNavBar />
      <div 
        className="theme-business bg-background"
        style={{ 
          display: 'flex',
          height: 'calc(100vh - 56px)',
          position: 'relative'
        }}
      >
        {/* Left Rail - Hidden on mobile (< 1024px), fixed width on desktop */}
        <div 
          className="hidden lg:block"
          style={{ 
            width: isCollapsed ? '72px' : '260px',
            transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0
          }}
        >
          <BusinessLeftRail />
        </div>
        
        {/* Main Content Area - Full width on mobile, flexible on desktop */}
        <main 
          className="business-main bg-background"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
            minWidth: 0,
            width: '100%'
          }}
        >
          {children}
        </main>
      </div>
    </>
  );
};

const BusinessLayout = ({ children }) => {
  return (
    <BusinessLayoutProvider>
      <BusinessLayoutContent>
        {children}
      </BusinessLayoutContent>
    </BusinessLayoutProvider>
  );
};

export default BusinessLayout;
