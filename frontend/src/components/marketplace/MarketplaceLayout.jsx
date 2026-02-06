// frontend/src/components/marketplace/MarketplaceLayout.jsx
import React from "react";
import { Link, NavLink, useParams, useLocation } from "react-router-dom";
import GlobalNavBar from "../GlobalNavBar";
import { useTheme } from "../../contexts/ThemeContext";

const navItems = [
  { to: "/portal/marketplace", label: "Home" },
  { to: "/portal/marketplace/region/global", label: "Global View" },
  { to: "/portal/marketplace/checkout", label: "Cart & Checkout" },
  { to: "/portal/marketplace/orders", label: "My Orders" },
  { to: "/portal/marketplace/seller/dashboard", label: "Seller Dashboard" },
];

const DIASPORA_REGIONS = [
  { id: "Africa", label: "Africa" },
  { id: "Caribbean", label: "Caribbean" },
  { id: "North America", label: "North America" },
  { id: "South America", label: "South America" },
  { id: "Europe", label: "Europe" },
  { id: "Asia", label: "Asia" },
];

export default function MarketplaceLayout({ children }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { regionId } = useParams();
  const location = useLocation();
  
  // Check if we're on a marketplace page (to show region bar)
  const isMarketplacePage = location.pathname.startsWith('/portal/marketplace');

  return (
    <>
      {/* Global Navigation Bar */}
      <GlobalNavBar data-layout="marketplace" />
      
      {/* Full-width Marketplace Container */}
      <div 
        className="min-h-screen"
        style={{ 
          paddingTop: '56px', // Account for fixed navbar height
          backgroundColor: isDark ? 'rgb(2, 6, 23)' : 'rgb(249, 250, 251)',
          color: isDark ? 'rgb(248, 250, 252)' : 'rgb(15, 23, 42)'
        }}
      >
        {/* Marketplace-specific Header/Navigation */}
        <div style={{
          borderBottom: `1px solid ${isDark ? 'rgb(30, 41, 59)' : 'rgb(226, 232, 240)'}`,
          background: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.8)'
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Marketplace Branding */}
              <Link to="/portal/marketplace" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                  <span className="font-black text-black text-xl">16</span>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    BANIBS
                  </div>
                  <div className="font-semibold text-sm text-amber-300">
                    Global Marketplace
                  </div>
                </div>
              </Link>

              {/* Horizontal Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      [
                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/40"
                          : "text-slate-300 hover:text-amber-200 hover:bg-slate-800/70",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              {/* Mobile menu button (optional - can be expanded) */}
              <div className="md:hidden">
                <button className="text-slate-400 hover:text-amber-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Persistent Diaspora Region Bar */}
        {isMarketplacePage && (
          <div 
            className="sticky top-14 z-40"
            style={{
              borderBottom: `1px solid ${isDark ? 'rgb(30, 41, 59)' : 'rgb(226, 232, 240)'}`,
              background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(248, 250, 252, 0.95)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
                <span 
                  className="text-xs font-medium whitespace-nowrap mr-2"
                  style={{ color: isDark ? 'rgb(148, 163, 184)' : 'rgb(100, 116, 139)' }}
                >
                  Diaspora Regions:
                </span>
                {DIASPORA_REGIONS.map((region) => {
                  const isActive = regionId === region.id;
                  return (
                    <Link
                      key={region.id}
                      to={`/portal/marketplace/region/${region.id}`}
                      data-testid={`region-link-${region.id.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200
                        ${isActive
                          ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                          : isDark
                            ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-amber-200 border border-slate-700'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-amber-700 border border-slate-200'
                        }
                      `}
                    >
                      {region.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Full-width Main Content */}
        <main className="w-full">
          {children}
        </main>

        {/* Optional Footer */}
        <footer className="border-t border-slate-800 bg-black/40 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-sm text-slate-400 text-center">
              <div className="font-semibold text-amber-400 mb-2">
                From Local → Global
              </div>
              <p>
                A Black-owned marketplace connecting Africa, the Caribbean, and the
                Diaspora with products, art, and digital goods.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}