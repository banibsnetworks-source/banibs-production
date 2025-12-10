import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * PortalLayout - Phase 11+ Infrastructure
 * 
 * Abstract base layout for all BANIBS portals.
 * Provides consistent structure while allowing customization.
 * 
 * Props:
 * - theme: Theme class (theme-social, theme-connect, etc.)
 * - leftRail: Optional left navigation component
 * - rightRail: Optional right sidebar component
 * - maxWidth: Content max-width (default: 1400px)
 * - children: Main content
 * 
 * NOTE: Global navigation (BanibsNetworkNav) is rendered at App.js level
 */
const PortalLayout = ({ 
  theme = 'theme-social',
  leftRail: LeftRail = null,
  rightRail: RightRail = null,
  maxWidth = '1400px',
  fullWidth = false,
  verticalPadding = true,
  children 
}) => {
  const { theme: currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  return (
    <div className={`${theme} min-h-screen bg-background`}>
      
      {/* Main Layout Container */}
      <div 
        className={fullWidth ? '' : 'mx-auto'}
        style={{ maxWidth: fullWidth ? '100%' : maxWidth }}
      >
        <div 
          className="flex gap-6"
          style={{ 
            paddingTop: verticalPadding ? '1rem' : 0,
            paddingLeft: fullWidth ? 0 : '1rem',
            paddingRight: fullWidth ? 0 : '1rem'
          }}
        >
          {/* Left Rail */}
          {LeftRail && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <LeftRail />
              </div>
            </aside>
          )}
          
          {/* Main Content Area */}
          <main 
            className="bg-background"
            style={{
              flex: 1,
              minWidth: 0,
              overflowX: 'hidden'
            }}
          >
            {children}
          </main>
          
          {/* Right Rail */}
          {RightRail && (
            <aside className="hidden xl:block w-80 flex-shrink-0">
              <div className="sticky top-20">
                <RightRail />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Create a specialized portal layout factory
 * Makes it easy to create new portal layouts with consistent structure
 */
export const createPortalLayout = (config) => {
  return ({ children }) => (
    <PortalLayout {...config}>
      {children}
    </PortalLayout>
  );
};

/**
 * Example usage for future modules:
 * 
 * // Prayer Rooms Layout
 * export const SpiritualLayout = createPortalLayout({
 *   theme: 'theme-spiritual',
 *   leftRail: SpiritualLeftRail,
 *   rightRail: PrayerCirclesRail
 * });
 * 
 * // Beauty Marketplace Layout
 * export const BeautyMarketplaceLayout = createPortalLayout({
 *   theme: 'theme-marketplace',
 *   leftRail: BeautyCategories,
 *   rightRail: FeaturedProducts
 * });
 */

export default PortalLayout;
