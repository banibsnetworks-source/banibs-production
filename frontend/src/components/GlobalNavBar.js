import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MoodMeter from './MoodMeter';
import AuthModalPortal from './auth/AuthModalPortal';
import AccountModeSwitcher from './common/AccountModeSwitcher';

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
  const { theme, toggleTheme } = useTheme();

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
    { label: 'Business Directory', path: '/business-directory', icon: '💼' },
    { label: 'BANIBS Social', path: '/social', icon: '🌐' },
    { label: 'Resources', path: '/resources', icon: '📚' },  // Shortened for clarity (B.0)
    { label: 'Marketplace', path: '/portal/marketplace', icon: '🛍️' },
    { label: 'BANIBS TV', path: '/portal/tv', icon: '📺' },
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
    <nav className="nav-v2 bg-surface-v2 backdrop-blur-lg border-b border-surface-alt-v2 shadow-md-v2 sticky top-0 z-50 transition-all">
      <div className="container-v2 mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Tagline */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity group">
            <div className="flex items-center">
              <span className="text-2xl font-bold tracking-tight text-foreground">BANIBS</span>
            </div>
            <span className="hidden md:block text-xs text-muted-foreground border-l border-border pl-3 transition-colors group-hover:text-foreground">
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
                  nav-v2-item relative px-4 py-2 rounded-lg-v2 text-sm font-semibold transition-all
                  ${
                    isActive(link.path)
                      ? 'text-primary-v2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-v2 after:rounded-full'
                      : 'text-secondary-v2 hover:text-primary-v2 hover:bg-surface-hover-v2'
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
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-yellow-500 hover:bg-muted transition-colors"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-px h-6 bg-border"></div>
            
            <MoodMeter />
            <div className="w-px h-6 bg-border"></div>
            
            {!isAuthenticated ? (
              /* Signed Out */
              <>
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setAuthModalOpen(true);
                  }}
                  className="btn-v2 btn-v2-ghost btn-v2-sm"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setAuthModalOpen(true);
                  }}
                  className="btn-v2 btn-v2-primary btn-v2-sm"
                >
                  Join BANIBS
                </button>
              </>
            ) : (
              /* Signed In - Mode Switcher + User Menu */
              <div className="flex items-center gap-3">
                {/* Mode Switcher - Dual-Layout System */}
                <AccountModeSwitcher />
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                  >
                    {user?.profile?.avatar_url || user?.avatar_url ? (
                      <img 
                        src={user.profile?.avatar_url || user.avatar_url} 
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-sm">
                        <span className="text-base font-bold text-gray-900">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium hidden xl:inline">{user?.name}</span>
                    <ChevronDown size={16} />
                  </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-xl border border-border py-2 z-50">
                    <Link
                      to="/portal/social/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-card-foreground hover:bg-muted transition-colors"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-border my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-card/95 backdrop-blur-md">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive(link.path)
                        ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20'
                        : 'text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-border flex flex-col space-y-2">
                {/* Mobile Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg flex items-center justify-between"
                >
                  <span>Theme</span>
                  <span className="flex items-center">
                    {theme === 'dark' ? (
                      <>
                        <Sun size={18} className="mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon size={18} className="mr-2" />
                        Dark Mode
                      </>
                    )}
                  </span>
                </button>
                
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalMode('signin');
                        setAuthModalOpen(true);
                      }}
                      className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg text-left"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthModalMode('register');
                        setAuthModalOpen(true);
                      }}
                      className="px-4 py-3 text-sm font-bold bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 text-center"
                    >
                      Join BANIBS
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/portal/social/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg flex items-center space-x-2"
                    >
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-lg flex items-center space-x-2"
                    >
                      <Settings size={18} />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-muted rounded-lg text-left flex items-center space-x-2"
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Phase 8.1 - Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        defaultTab={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </nav>
  );
};

export default GlobalNavBar;
