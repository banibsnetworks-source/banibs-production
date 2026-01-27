import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import MoodMeter from './MoodMeter';
import AuthModal from './AuthModal';
import AccountModeSwitcher from './common/AccountModeSwitcher';

/**
 * Global BANIBS Navigation Bar - Vertical Dropdown Design
 * Left-aligned command nav that drops down vertically
 * Same model for desktop and mobile
 */
const GlobalNavBar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Close nav when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setNavOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const navLinks = [
    { label: 'BANIBS News', path: '/', icon: '📰' },
    { label: 'Business Directory', path: '/business-directory', icon: '💼' },
    { label: 'BANIBS Social', path: '/social', icon: '🌐' },
    { label: 'Resources', path: '/resources', icon: '📚' },
    { label: 'Marketplace', path: '/portal/marketplace', icon: '🛍️' },
    { label: 'BANIBS TV', path: '/portal/tv', icon: '📺' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
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

  return (
    <>
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

              {/* Mood Meter - Desktop only */}
              <div className="hidden md:block">
                <MoodMeter />
              </div>

              {/* Auth / User */}
              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.location.href = '/auth/signin'}
                    className="btn-v2 btn-v2-ghost btn-v2-sm text-sm"
                    data-testid="sign-in-btn"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => window.location.href = '/auth/register'}
                    className="btn-v2 btn-v2-primary btn-v2-sm text-sm hidden sm:block"
                    data-testid="join-btn"
                  >
                    Join
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AccountModeSwitcher />
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-foreground hover:bg-muted transition-colors"
                      data-testid="user-menu-toggle"
                    >
                      {user?.profile?.avatar_url || user?.avatar_url ? (
                        <img 
                          src={user.profile?.avatar_url || user.avatar_url} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-v2 flex items-center justify-center text-white text-sm font-bold">
                          {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg border border-border py-2 z-50">
                        <div className="px-4 py-2 border-b border-border">
                          <p className="font-medium text-foreground truncate">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <Link
                          to="/settings/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <User size={16} />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors"
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

        {/* Vertical Dropdown Nav */}
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out border-t border-border
            ${navOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 border-t-0'}
          `}
          data-testid="nav-dropdown"
        >
          <div className="px-4 py-3 bg-muted/50">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={() => setNavOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                      ${isActive(link.path)
                        ? 'bg-primary-v2 text-white'
                        : 'text-foreground hover:bg-muted'
                      }
                    `}
                    data-testid={`nav-link-${link.path.replace(/\//g, '-') || 'home'}`}
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

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
