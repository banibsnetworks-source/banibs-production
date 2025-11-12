import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MoodMeter from './MoodMeter';
import AuthModal from './AuthModal';

/**
 * Global BANIBS Navigation Bar
 * Top-level ecosystem navigation (blue bar)
 * Links to all BANIBS sections: News, Business, Social, Resources, Jobs, TV
 */
const GlobalNavBar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Phase 8.3.1: Listen for global auth modal events
  React.useEffect(() => {
    const handleOpenAuthModal = (event) => {
      console.log('🎯 Global auth modal event received:', event.detail);
      setAuthModalMode(event.detail?.mode || 'signin');
      setAuthModalOpen(true);
    };

    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    
    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuthModal);
    };
  }, []);

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

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleAuthSuccess = (userData) => {
    setAuthModalOpen(false);
    // Redirect to preferred portal (Phase 8.1.C)
    const portalMap = {
      'news': '/portal/news',
      'social': '/portal/social',
      'business': '/portal/business',
      'tv': '/portal/tv',
      'search': '/portal/search',
    };
    const portalRoute = portalMap[userData?.preferred_portal] || '/portal/news';
    navigate(portalRoute);
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

          {/* Phase 7.6.5 - Mood Meter & Phase 8.1 - Auth Links/User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            <MoodMeter />
            <div className="w-px h-6 bg-blue-700"></div>
            
            {!isAuthenticated ? (
              /* Signed Out */
              <>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-yellow-300 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 text-sm font-bold bg-yellow-500 text-blue-900 rounded-md hover:bg-yellow-400 transition-colors"
                >
                  Join BANIBS
                </button>
              </>
            ) : (
              /* Signed In - User Menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-white hover:bg-blue-700 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-900">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <ChevronDown size={16} />
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
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

      {/* Phase 8.1 - Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </nav>
  );
};

export default GlobalNavBar;
