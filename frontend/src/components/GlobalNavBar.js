import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, ChevronDown, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MoodMeter from './MoodMeter';
import AuthModal from './AuthModal';
import AccountModeSwitcher from './common/AccountModeSwitcher';

/**
 * Global BANIBS Navigation Bar - Overlay Drawer Design
 * Fixed position overlay that doesn't push content
 * P0 UI Fix: Menu overlays content instead of pushing it down
 * Supports both solid and glass drawer styles (user toggle)
 */
const GlobalNavBar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  // Glass drawer preference: 'solid' (default) or 'glass'
  const [drawerStyle, setDrawerStyle] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('navDrawerStyle') || 'solid';
    }
    return 'solid';
  });
  const navRef = useRef(null);
  const drawerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Toggle drawer style and persist to localStorage
  const toggleDrawerStyle = () => {
    const newStyle = drawerStyle === 'solid' ? 'glass' : 'solid';
    setDrawerStyle(newStyle);
    localStorage.setItem('navDrawerStyle', newStyle);
  };

  // Lock body scroll when drawer is open (prevent layout shift from scrollbar)
  useEffect(() => {
    if (navOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [navOpen]);

  // Close drawer on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && navOpen) {
        setNavOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [navOpen]);

  // Close nav on route change
  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname]);

  // Listen for global auth modal events
  useEffect(() => {
    const handleOpenAuthModal = (event) => {
      setAuthModalMode(event.detail?.mode || 'signin');
      setAuthModalOpen(true);
    };

    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuthModal);
  }, []);

  // Check if user has super_admin role (supports both 'role' string and 'roles' array)
  const isSuperAdmin = user?.role === 'super_admin' || 
                       user?.roles?.includes('super_admin');
  
  // Check if user has any admin role
  const isAdmin = isSuperAdmin || 
                  user?.role === 'admin' || 
                  user?.role === 'moderator' ||
                  user?.roles?.includes('admin') ||
                  user?.roles?.includes('moderator');

  // Navigation IA: Left drawer = Primary BANIBS modules only
  // News categories moved to top bar (NewsNavigationBar)
  const navLinks = [
    { label: 'News', path: '/', icon: '📰' },
    { label: 'Directory', path: '/business-directory', icon: '🏢' },
    { label: 'Social', path: '/portal/social', icon: '🌐' },
    { label: 'Resources', path: '/resources', icon: '📚' },
    { label: 'Marketplace', path: '/portal/marketplace', icon: '🛍️' },
    { label: 'TV', path: '/portal/tv', icon: '📺' },
    { label: 'Wallet', path: '/portal/wallet', icon: '💰' },
    { label: 'Community', path: '/portal/community', icon: '🏠' },
  ];

  // Control plane links - visible based on role
  const controlPlaneLinks = [
    { 
      label: 'Founder Command Center', 
      path: '/founder/command', 
      icon: '🎯',
      visible: isSuperAdmin,
      requiresAuth: true
    },
    { 
      label: 'Admin Dashboard', 
      path: '/admin/opportunities', 
      icon: '⚙️',
      visible: isAdmin,
      requiresAuth: true
    },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Handle control plane navigation with auth redirect
  const handleControlPlaneClick = (link) => {
    closeDrawer();
    if (!isAuthenticated && link.requiresAuth) {
      // Redirect to signin with return URL
      navigate(`/auth/signin?redirect=${encodeURIComponent(link.path)}`);
    } else {
      navigate(link.path);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const handleAuthSuccess = (userData) => {
    setAuthModalOpen(false);
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

  const closeDrawer = () => setNavOpen(false);

  return (
    <>
      {/* Fixed Header Bar */}
      <nav 
        ref={navRef}
        className="bg-surface-v2 backdrop-blur-lg border-b border-surface-alt-v2 shadow-md-v2 sticky top-0 z-50"
        data-testid="global-nav"
      >
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Nav Toggle + Logo */}
            <div className="flex items-center gap-3">
              {/* Nav Toggle Button */}
              <button
                onClick={() => setNavOpen(!navOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle navigation"
                aria-expanded={navOpen}
                data-testid="nav-toggle"
              >
                <div className="relative w-5 h-5">
                  <Menu 
                    size={20} 
                    className={`absolute transition-all duration-200 ${navOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}
                  />
                  <X 
                    size={20} 
                    className={`absolute transition-all duration-200 ${navOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}
                  />
                </div>
                <ChevronDown 
                  size={16} 
                  className={`transition-transform duration-200 ${navOpen ? 'rotate-180' : 'rotate-0'}`}
                />
              </button>

              {/* Logo */}
              <Link 
                to="/" 
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                data-testid="nav-logo"
              >
                <span className="text-xl font-bold tracking-tight text-foreground">BANIBS</span>
                <span className="hidden sm:block text-[10px] text-muted-foreground border-l border-border pl-2 leading-tight">
                  Black America News<br/>Information & Business System
                </span>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-yellow-500 hover:bg-muted transition-colors"
                aria-label="Toggle theme"
                data-testid="theme-toggle"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* MoodMeter - desktop only */}
              <div className="hidden md:block">
                <MoodMeter />
              </div>

              {/* Sign In - visible for unauthenticated users */}
              {!isAuthenticated && (
                <Link
                  to="/auth/signin"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-v2 text-white hover:bg-primary-v2/90 transition-colors text-sm font-medium"
                  data-testid="nav-signin"
                >
                  <User size={16} />
                  Sign In
                </Link>
              )}

              {/* User menu for authenticated users */}
              {isAuthenticated && (
                <div className="flex items-center gap-2">
                  <AccountModeSwitcher />
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-foreground hover:bg-muted transition-colors"
                      data-testid="user-menu-toggle"
                    >
                      {user?.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.name || 'User'} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-v2 flex items-center justify-center text-white text-sm font-medium">
                          {(user?.name || user?.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : 'rotate-0'}`}
                      />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-surface-v2 rounded-lg shadow-lg border border-border py-2 z-50">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="text-sm font-medium text-foreground truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors w-full text-left"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Invisible Backdrop - click to close drawer (no dimming) */}
      <div 
        className={`
          fixed inset-0 z-[999] transition-opacity duration-300
          ${navOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeDrawer}
        data-testid="nav-backdrop"
        aria-hidden="true"
      />

      {/* Slide-in Drawer - Fixed position overlay */}
      <div 
        ref={drawerRef}
        className={`
          fixed top-0 left-0 h-full w-[300px] max-w-[80vw] z-[1000]
          border-r
          transition-all duration-300 ease-out
          ${navOpen ? 'translate-x-0' : '-translate-x-full'}
          ${drawerStyle === 'glass' ? 'border-white/20' : 'border-border'}
        `}
        style={{ 
          backgroundColor: drawerStyle === 'glass'
            ? (theme === 'dark' ? 'rgba(13, 13, 13, 0.15)' : 'rgba(255, 255, 255, 0.18)')
            : (theme === 'dark' ? '#0D0D0D' : '#FFFFFF'),
          backdropFilter: drawerStyle === 'glass' ? 'blur(16px) saturate(180%)' : 'none',
          WebkitBackdropFilter: drawerStyle === 'glass' ? 'blur(16px) saturate(180%)' : 'none',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.15), 1px 0 0 rgba(0, 0, 0, 0.05)',
        }}
        data-testid="nav-drawer"
        data-drawer-style={drawerStyle}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer Header */}
        <div 
          className="flex items-center justify-between h-16 px-4 border-b"
          style={{ 
            borderColor: drawerStyle === 'glass' 
              ? (theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') 
              : undefined 
          }}
        >
          <span 
            className="text-lg font-bold"
            style={{ 
              color: theme === 'dark' ? '#FFFFFF' : '#111111',
              textShadow: drawerStyle === 'glass' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            Menu
          </span>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              color: theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#374151',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close menu"
            data-testid="nav-drawer-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Navigation Links */}
        <div className="overflow-y-auto h-[calc(100vh-4rem)] py-4 px-3">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const textColor = theme === 'dark' ? '#FFFFFF' : '#111111';
              const hoverBg = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
              const activeBg = 'var(--banibs-primary, #D4A017)';
              const activeText = theme === 'dark' ? '#111111' : '#FFFFFF';
              
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={closeDrawer}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
                    style={isActive(link.path) 
                      ? { backgroundColor: activeBg, color: activeText }
                      : { color: textColor, backgroundColor: 'transparent' }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive(link.path)) {
                        e.currentTarget.style.backgroundColor = hoverBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(link.path)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    data-testid={`nav-link-${link.path.replace(/\//g, '-') || 'home'}`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Control Plane Section - Founder/Admin */}
          {controlPlaneLinks.some(link => link.visible) && (
            <div 
              className="mt-4 pt-4 border-t"
              style={{ 
                borderColor: drawerStyle === 'glass' 
                  ? (theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') 
                  : undefined 
              }}
            >
              <p 
                className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider"
                style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
              >
                Control Plane
              </p>
              <ul className="space-y-1">
                {controlPlaneLinks.filter(link => link.visible).map((link) => (
                  <li key={link.path}>
                    <button
                      onClick={() => handleControlPlaneClick(link)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                        ${isActive(link.path)
                          ? 'bg-amber-600 text-white'
                          : 'text-amber-600 hover:bg-amber-500/10 border border-amber-500/30'
                        }
                      `}
                      data-testid={`nav-control-${link.path.replace(/\//g, '-')}`}
                    >
                      <span className="text-lg">{link.icon}</span>
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Drawer Footer - Foundation + Version info */}
          <div 
            className="mt-6 pt-4 border-t px-4"
            style={{ 
              borderColor: drawerStyle === 'glass' 
                ? (theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)') 
                : undefined 
            }}
          >
            <Link
              to="/about"
              onClick={closeDrawer}
              className="block text-sm transition-colors mb-3"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
              data-testid="nav-foundation-link"
            >
              About BANIBS & HDOS
            </Link>
            <Link
              to="/foundation"
              onClick={closeDrawer}
              className="block text-sm transition-colors mb-3"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#6B7280' }}
              data-testid="nav-foundation-full-link"
            >
              Read the Foundation
            </Link>
            
            {/* Glass Drawer Toggle */}
            <button
              onClick={toggleDrawerStyle}
              className={`
                flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all mb-3
                ${drawerStyle === 'glass' 
                  ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                  : 'bg-gray-500/10 text-gray-500 border border-gray-500/20 hover:bg-gray-500/20'
                }
              `}
              data-testid="nav-glass-toggle"
            >
              <Sparkles size={14} />
              <span>Glass Drawer: {drawerStyle === 'glass' ? 'ON' : 'OFF'}</span>
            </button>
            
            <p 
              className="text-xs"
              style={{ color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }}
            >
              BANIBS v1.0 • Internal Build
            </p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
      />
    </>
  );
};

export default GlobalNavBar;
