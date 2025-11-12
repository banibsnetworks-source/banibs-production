import React from 'react';
import { SocialLayoutProvider, useSocialLayout } from '../../contexts/SocialLayoutContext';
import LeftRail from './LeftRail/LeftRail';
import GlobalNavBar from '../GlobalNavBar';

/**
 * SocialLayout - Phase 10.0
 * Main layout wrapper for all BANIBS Social pages
 * Includes collapsible Left Rail with glass effect
 */
const SocialLayoutContent = ({ children }) => {
  const { isCollapsed } = useSocialLayout();

  return (
    <>
      <GlobalNavBar />
      <div 
        className="social-layout-root" 
        style={{ 
          display: 'flex', 
          minHeight: '100vh',
          background: '#050507' /* Deep BANIBS black base */
        }}
      >
        <LeftRail />
        
        {/* Main Content Area */}
        <main 
          className="social-main"
          style={{
            flex: 1,
            marginLeft: isCollapsed ? '72px' : '260px',
            transition: 'margin-left 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: '100vh',
            background: '#0B0B0B'
          }}
        >
          {children}
        </main>
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
