import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MoodMeter from './MoodMeter';

/**
 * Global BANIBS Navigation Bar
 * Top-level ecosystem navigation (blue bar)
 * Links to all BANIBS sections: News, Business, Social, Resources, Jobs, TV
 */
const GlobalNavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'BANIBS News', path: '/', icon: '📰' },
    { label: 'Business Directory', path: '/business', icon: '💼' },
    { label: 'Social', path: '/social', icon: '🌐' },
    { label: 'Information & Resources', path: '/resources', icon: '📚' },
    { label: 'Jobs Marketplace', path: '/opportunities', icon: '💼' },
    { label: 'BANIBS TV', path: '/tv', icon: '📺' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Tagline */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="flex items-center">
              <span className="text-2xl font-bold tracking-tight text-white">BANIBS</span>
            </div>
            <span className="hidden md:block text-xs text-blue-200 border-l border-blue-400 pl-3">
              Black America News Network
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                  ${
                    isActive(link.path)
                      ? 'bg-blue-700 text-yellow-400'
                      : 'text-white hover:bg-blue-700 hover:text-yellow-300'
                  }
                `}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Phase 7.6.5 - Mood Meter & Auth Links */}
          <div className="hidden lg:flex items-center space-x-3">
            <MoodMeter />
            <div className="w-px h-6 bg-blue-700"></div>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white hover:text-yellow-300 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-bold bg-yellow-500 text-blue-900 rounded-md hover:bg-yellow-400 transition-colors"
            >
              Subscribe
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-blue-700 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-blue-700">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-md text-sm font-medium transition-all
                    ${
                      isActive(link.path)
                        ? 'bg-blue-700 text-yellow-400'
                        : 'text-white hover:bg-blue-700'
                    }
                  `}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-blue-700 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-sm font-bold bg-yellow-500 text-blue-900 rounded-md hover:bg-yellow-400 text-center"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default GlobalNavBar;
