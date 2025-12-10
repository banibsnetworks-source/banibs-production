import React from 'react';
import { SocialLayoutProvider, useSocialLayout } from '../../contexts/SocialLayoutContext';
import LeftRail from './LeftRail/LeftRail';
import RightRail from './RightRail/RightRail';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * SocialLayout - Phase 10.1
 * 3-column layout: LeftRail (nav) | Center (feed) | RightRail (discovery)
 * Each column has independent scrolling
 * NOTE: Global navigation (BanibsNetworkNav) is now rendered at App.js level
 */
const SocialLayoutContent = ({ children }) => {
  const { isCollapsed } = useSocialLayout();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
        className="theme-social bg-background"
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
          <LeftRail />
        </div>
        
        {/* Main Content Area - Full width on mobile, flexible on desktop */}
        <main 
          className="social-main bg-background"
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

        {/* Right Rail - Hidden on mobile and tablet (< 1280px), fixed width on desktop */}
        <div 
          className="hidden xl:block"
          style={{ 
            width: '320px',
            flexShrink: 0
          }}
        >
          <RightRail />
        </div>
      </div>
    </>
  );
};

const SocialLayout = ({ children }) => {
  return (
    <SocialLayoutProvider>
      <SocialLayoutContent>
        {children}
      </SocialLayoutContent>
    </SocialLayoutProvider>
  );
};

export default SocialLayout;
