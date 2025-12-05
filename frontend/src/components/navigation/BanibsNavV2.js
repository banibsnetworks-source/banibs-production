import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BANIBS Navigation V2.0 - PREVIEW MODE
 * 
 * Black-glass aesthetic with gold active indicators
 * Perfect theme switching and alignment
 * 
 * DO NOT replace existing nav until Founder approval
 */
const BanibsNavV2 = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  const navItems = [
    { 
      label: 'News', 
      path: '/', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <path d="M18 14h-8"></path>
          <path d="M15 18h-5"></path>
          <path d="M10 6h8v4h-8V6Z"></path>
        </svg>
      )
    },
    { 
      label: 'Business', 
      path: '/business-directory', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      )
    },
    { 
      label: 'Social', 
      path: '/portal/social', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    { 
      label: 'Marketplace', 
      path: '/portal/marketplace', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      )
    },
    { 
      label: 'TV', 
      path: '/portal/tv', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
          <polyline points="17 2 12 7 7 2"></polyline>
        </svg>
      )
    },
    { 
      label: 'Resources', 
      path: '/resources', 
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      )
    },
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
  
  return (
    <>
      {/* Navigation V2 - Black Glass Design */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '68px',
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(247, 247, 247, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isDark ? 'rgba(200, 168, 87, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`,
        boxShadow: isDark 
          ? '0 1px 3px rgba(0, 0, 0, 0.5)' 
          : '0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <Link 
            to="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <span style={{
              fontSize: '28px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #C8A857 0%, #E8C878 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              BANIBS
            </span>
            <span style={{
              fontSize: '11px',
              color: isDark ? '#9CA3AF' : '#6B7280',
              borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              paddingLeft: '12px',
              fontWeight: '500',
              letterSpacing: '0.5px'
            }}>
              BLACK AMERICA NEWS
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }} className="hidden lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: active 
                      ? '#C8A857' 
                      : isDark ? '#D1D5DB' : '#4B5563',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: active 
                      ? isDark ? 'rgba(200, 168, 87, 0.12)' : 'rgba(200, 168, 87, 0.08)'
                      : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#C8A857';
                      e.currentTarget.style.backgroundColor = isDark 
                        ? 'rgba(200, 168, 87, 0.08)' 
                        : 'rgba(200, 168, 87, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = isDark ? '#D1D5DB' : '#4B5563';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <span style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: active ? '#C8A857' : 'currentColor'
                  }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  
                  {/* Active Indicator - Gold Underline */}
                  {active && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      left: '20px',
                      right: '20px',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #C8A857, transparent)',
                      borderRadius: '2px',
                      animation: 'slideIn 0.3s ease'
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Right Side - Theme Toggle + Auth */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }} className="hidden lg:flex">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: '#C8A857',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark 
                  ? 'rgba(200,168,87,0.15)' 
                  : 'rgba(200,168,87,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.05)';
              }}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Auth Section */}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate('/auth/signin')}
                  style={{
                    padding: '8px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDark ? '#F7F7F7' : '#1F2937',
                    backgroundColor: 'transparent',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C8A857';
                    e.currentTarget.style.color = '#C8A857';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                    e.currentTarget.style.color = isDark ? '#F7F7F7' : '#1F2937';
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth/register')}
                  style={{
                    padding: '8px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#000000',
                    background: 'linear-gradient(135deg, #C8A857 0%, #E8C878 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(200, 168, 87, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 168, 87, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(200, 168, 87, 0.25)';
                  }}
                >
                  Join BANIBS
                </button>
              </>
            ) : (
              /* User Menu */
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(200,168,87,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#C8A857';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(200,168,87,0.2)' : 'rgba(0,0,0,0.1)';
                  }}
                >
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.name}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #C8A857'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#C8A857',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#000',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDark ? '#F7F7F7' : '#1F2937'
                  }}>
                    {user?.name}
                  </span>
                  <ChevronDown size={16} style={{ 
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    transition: 'transform 0.2s',
                    transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)'
                  }} />
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${isDark ? 'rgba(200,168,87,0.3)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000
                  }}>
                    <Link
                      to="/portal/social/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isDark ? '#F7F7F7' : '#1F2937',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark 
                          ? 'rgba(200,168,87,0.15)' 
                          : 'rgba(200,168,87,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <User size={18} style={{ color: '#C8A857' }} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: isDark ? '#F7F7F7' : '#1F2937',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark 
                          ? 'rgba(200,168,87,0.15)' 
                          : 'rgba(200,168,87,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Settings size={18} style={{ color: '#C8A857' }} />
                      <span>Settings</span>
                    </Link>
                    <div style={{
                      height: '1px',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      margin: '8px 0'
                    }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#EF4444',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut size={18} />
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
            className="lg:hidden"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: '#C8A857',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu (Slide-in) */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden"
          style={{
            position: 'fixed',
            top: '68px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(247, 247, 247, 0.98)',
            backdropFilter: 'blur(12px)',
            zIndex: 40,
            padding: '24px',
            overflowY: 'auto'
          }}
        >
          {/* Mobile nav items would go here */}
          <div style={{ fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
            Mobile menu - to be implemented
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scaleX(0.8);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
      `}</style>
    </>
  );
};

export default BanibsNavV2;
