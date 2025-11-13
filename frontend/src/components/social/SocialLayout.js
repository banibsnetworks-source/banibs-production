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
        className="social-layout-root" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: isCollapsed ? '72px minmax(0, 1fr) 320px' : '260px minmax(0, 1fr) 320px',
          height: 'calc(100vh - 56px)',
          background: '#050507', /* Deep BANIBS black base */
          transition: 'grid-template-columns 200ms cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <LeftRail />
        
        {/* Main Content Area - Scrollable */}
        <main 
          className="social-main"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            background: '#0B0B0B',
            position: 'relative'
          }}
        >
          {children}
        </main>

        <RightRail />
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
