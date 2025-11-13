import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import GlobalNavBar from '../../components/GlobalNavBar';
import { useTheme } from '../../contexts/ThemeContext';

const MarketplacePortal = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: isDark ? 'rgb(10, 10, 12)' : 'rgb(249, 250, 251)' 
    }}>
      <GlobalNavBar />
      {/* Marketplace Hero */}
      <div className="py-20" style={{
        background: isDark
          ? 'linear-gradient(to bottom right, rgb(120, 53, 15), rgb(17, 24, 39))'
          : 'linear-gradient(to bottom right, rgb(254, 243, 199), rgb(253, 230, 138))'
      }}>
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6" style={{
            background: 'rgb(232, 182, 87)'
          }}>
            <span className="text-black font-bold">🛍️ MARKETPLACE</span>
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{
            color: isDark ? 'white' : 'rgb(17, 24, 39)'
          }}>
            BANIBS Marketplace
          </h1>
          <p className="text-xl mb-8" style={{
            color: isDark ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'
          }}>
            Connect, Trade, and Grow Within the Black Community
          </p>
        </div>
      </div>

      {/* Marketplace Navigation Tabs */}
      <div className="sticky top-14 z-40" style={{
        background: isDark ? 'rgba(10, 10, 12, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)'
      }}>
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <Link
              to="/portal/marketplace/jobs"
              className="py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors"
              style={{
                borderColor: isActive('/portal/marketplace/jobs') ? 'rgb(232, 182, 87)' : 'transparent',
                color: isActive('/portal/marketplace/jobs') ? 'rgb(232, 182, 87)' : 'rgb(156, 163, 175)'
              }}
            >
              💼 Jobs
            </Link>
            <Link
              to="/portal/marketplace/listings"
              className="py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors"
              style={{
                borderColor: isActive('/portal/marketplace/listings') ? 'rgb(232, 182, 87)' : 'transparent',
                color: isActive('/portal/marketplace/listings') ? 'rgb(232, 182, 87)' : 'rgb(156, 163, 175)'
              }}
            >
              📋 Listings & Opportunities
            </Link>
            <Link
              to="/portal/marketplace/products"
              className="py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors"
              style={{
                borderColor: isActive('/portal/marketplace/products') ? 'rgb(232, 182, 87)' : 'transparent',
                color: isActive('/portal/marketplace/products') ? 'rgb(232, 182, 87)' : 'rgb(156, 163, 175)'
              }}
            >
              🛍️ Products
            </Link>
            <Link
              to="/portal/marketplace/services"
              className="py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors"
              style={{
                borderColor: isActive('/portal/marketplace/services') ? 'rgb(232, 182, 87)' : 'transparent',
                color: isActive('/portal/marketplace/services') ? 'rgb(232, 182, 87)' : 'rgb(156, 163, 175)'
              }}
            >
              🔧 Services
            </Link>
          </nav>
        </div>
      </div>

      {/* Marketplace Content */}
      <div className="container mx-auto px-4 py-8" style={{ 
        backgroundColor: isDark ? 'rgb(10, 10, 12)' : 'rgb(249, 250, 251)' 
      }}>
        <Routes>
          <Route index element={<Navigate to="/portal/marketplace/jobs" replace />} />
          <Route path="jobs" element={<JobsSection />} />
          <Route path="listings" element={<ListingsSection />} />
          <Route path="products" element={<ProductsSection />} />
          <Route path="services" element={<ServicesSection />} />
        </Routes>
      </div>
    </div>
  );
};

// Jobs Section Component
const JobsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Job Opportunities</h2>
        <p className="text-muted-foreground mb-6">
          Explore career opportunities within Black-owned businesses and organizations supporting the community.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search jobs by title, company, or location..."
              className="flex-1 px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Job Listings Placeholder */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-2xl">
                💼
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Full-Time
              </span>
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">
              Software Engineer {i}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">Black Tech Company Inc.</p>
            <p className="text-sm text-muted-foreground mb-4">📍 Remote / Atlanta, GA</p>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              Join our team building innovative solutions for the Black community...
            </p>
            <button className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium">
              View Details
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          🚀 <strong>Coming Soon:</strong> Full job search and filtering functionality
        </p>
      </div>
    </div>
  );
};

// Listings Section Component (Business Opportunities)
const ListingsSection = () => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Business Listings & Opportunities</h2>
        <p className="text-muted-foreground mb-6">
          Discover grants, funding opportunities, and business resources for Black entrepreneurs.
        </p>
      </div>

      {/* Opportunities Placeholder */}
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                💰
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  Small Business Grant Program {i}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  U.S. Department of Commerce - Minority Business Development Agency
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>💵 Up to $50,000</span>
                  <span>📅 Deadline: Dec 31, 2025</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  Funding for minority-owned businesses to expand operations, hire staff, and invest in growth...
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          📊 <strong>Note:</strong> This section will integrate with existing Opportunities data
        </p>
      </div>
    </div>
  );
};

// Products Section Component (Placeholder)
const ProductsSection = () => {
  return (
    <div className="text-center py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-6xl mb-6">🛍️</div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Products Marketplace</h2>
        <p className="text-muted-foreground text-lg mb-6">
          A dedicated space for buying and selling products within the Black community.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
          <p className="text-amber-800 dark:text-amber-400 font-medium mb-2">🚧 Coming Soon</p>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            We're building a platform to showcase and purchase products from Black-owned businesses.
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </div>
  );
};

// Services Section Component (Placeholder)
const ServicesSection = () => {
  return (
    <div className="text-center py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-6xl mb-6">🔧</div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Services Marketplace</h2>
        <p className="text-muted-foreground text-lg mb-6">
          Find and offer professional services within the Black business community.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <p className="text-blue-800 dark:text-blue-400 font-medium mb-2">🚧 Coming Soon</p>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Connect with Black professionals offering consulting, design, marketing, legal services, and more.
            This section is under development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePortal;
