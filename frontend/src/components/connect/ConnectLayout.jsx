import React from 'react';
import GlobalNavBar from '../GlobalNavBar';
import ConnectLeftRail from './ConnectLeftRail';
import ConnectRightRail from './ConnectRightRail';
import NewsBeat from '../common/NewsBeat';

/**
 * ConnectLayout - BANIBS Connect (Business Network)
 * Dual-Layout System: LinkedIn-style business shell
 * 
 * Theme: Gold primary, Blue accent
 * Focus: Business owners and operators (NOT job seekers)
 * 
 * Structure:
 * - Left: My Network, Recent Activity, Business Groups, etc.
 * - Center: Business feed (posts, opportunities)
 * - Right: Business Tools, Company Pulse, Funding, etc.
 */

const ConnectLayout = ({ children }) => {
  return (
    <div className="theme-connect min-h-screen bg-background">
      {/* Global Nav */}
      <GlobalNavBar />
      
      {/* Mobile NewsBeat Strip */}
      <div className="lg:hidden">
        <NewsBeat variant="mobile" limit={5} />
      </div>

      {/* Main Layout */}
      <div className="max-w-[1400px] mx-auto">
        <div className="flex gap-6 pt-4 px-4">
          {/* Left Rail - Hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <ConnectLeftRail />
            </div>
          </aside>

          {/* Main Content - Full width on mobile, constrained on desktop */}
          <main className="flex-1 min-w-0">
            {children}
          </main>

          {/* Right Rail - Hidden on tablet, visible on large desktop */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-20">
              <ConnectRightRail />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ConnectLayout;
