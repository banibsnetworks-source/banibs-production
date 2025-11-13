import React from 'react';
import { SocialLayoutProvider, useSocialLayout } from '../../contexts/SocialLayoutContext';
import LeftRail from './LeftRail/LeftRail';
import RightRail from './RightRail/RightRail';
import GlobalNavBar from '../GlobalNavBar';

/**
 * SocialLayout - Phase 10.1
 * 3-column layout: LeftRail (nav) | Center (feed) | RightRail (discovery)
 * Each column has independent scrolling
 */
const SocialLayoutContent = ({ children }) => {
  const { isCollapsed } = useSocialLayout();

  return (
    <>
      <GlobalNavBar />
      <div 
        style={{ 
          display: 'flex',
          height: 'calc(100vh - 56px)',
          background: 'var(--bg-primary)',
          position: 'relative'
        }}
      >
        {/* Left Rail - Fixed width, collapsible */}
        <div style={{ 
          width: isCollapsed ? '72px' : '260px',
          transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0
        }}>
          <LeftRail />
        </div>
        
        {/* Main Content Area - Flexible, Scrollable */}
        <main 
          className="social-main"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#0B0B0B',
            position: 'relative',
            minWidth: 0
          }}
        >
          {children}
        </main>

        {/* Right Rail - Fixed width */}
        <div style={{ 
          width: '320px',
          flexShrink: 0
        }}>
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
