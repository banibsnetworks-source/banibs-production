import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * BANIBS Network Global Navigation
 * 
 * The primary navigation bar for the entire BANIBS ecosystem.
 * Appears at the top of EVERY page.
 * 
 * Layout: [BANIBS Network ▾] [Search 🔍] [Notifications 🔔] [Profile ⬤]
 */
const BanibsNetworkNav = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const networkRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (networkRef.current && !networkRef.current.contains(event.target)) {
        setNetworkDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // BANIBS Network modules - Updated core ordering per Raymond's spec
  const primaryModules = [
    { name: 'BANIBS Social', path: '/portal/social', icon: '💬', description: 'Connect with community' },
    { name: 'BANIBS Information', path: '/', icon: '📰', description: 'News & insights' },
    { name: 'BANIBS Marketplace', path: '/marketplace', icon: '🛍️', description: 'Shop Black-owned' },
    { name: 'BANIBS Business Directory', path: '/business-directory', icon: '📋', description: 'Find businesses' },
    { name: 'BANIBS Business', path: '/portal/business', icon: '🏢', description: 'Network & opportunities' },
    { name: 'BANIBS Education', path: '/education', icon: '🎓', description: 'Learning resources' },
    { name: 'BANIBS Youth', path: '/youth', icon: '🌟', description: 'Youth programs' },
  ];

  const secondaryModules = [
    { name: 'BANIBS TV', path: '/tv', icon: '📺', description: 'Interviews & spotlights' },
    { name: 'Recognition', path: '/recognition', icon: '🏆', description: 'Community honors' },
    { name: 'Resources', path: '/resources', icon: '📚', description: 'Grants & funding' },
    { name: 'Voice', path: '/voice', icon: '✍️', description: 'Op-eds & perspectives' },
    { name: 'Opportunities', path: '/opportunities', icon: '💼', description: 'Jobs & grants' },
    { name: 'Events', path: '/events', icon: '📅', description: 'Community events' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setNetworkDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          
          {/* Left: Logo + BANIBS Network Dropdown */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* BANIBS Logo/Wordmark */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-lg">
                <span className="text-gray-900 font-bold text-lg">B</span>
              </div>
              <span className="hidden sm:block text-white font-semibold text-sm">BANIBS</span>
            </Link>

            {/* BANIBS Network Dropdown */}
            <div className="relative" ref={networkRef}>
              <button
                onClick={() => setNetworkDropdownOpen(!networkDropdownOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <span>BANIBS Network</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${networkDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {networkDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 z-50">
                  {/* Primary Modules */}
                  <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Core Modules
                    </div>
                    <div className="space-y-1">
                      {primaryModules.map((module) => (
                        <button
                          key={module.path}
                          onClick={() => handleNavigation(module.path)}
                          className="w-full flex items-start space-x-3 px-3 py-2 rounded-md text-left hover:bg-gray-700 transition-colors group"
                        >
                          <span className="text-2xl flex-shrink-0">{module.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white group-hover:text-yellow-400">
                              {module.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {module.description}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700 my-2"></div>

                  {/* Secondary Modules */}
                  <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Additional Resources
                    </div>
                    <div className="space-y-1">
                      {secondaryModules.map((module) => (
                        <button
                          key={module.path}
                          onClick={() => handleNavigation(module.path)}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-gray-700 transition-colors group"
                        >
                          <span className="text-lg flex-shrink-0">{module.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-300 group-hover:text-yellow-400">
                              {module.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl"
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search BANIBS (people, businesses, news...)"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  <span className="text-lg">×</span>
                </button>
              )}
            </div>
          </form>

          {/* Right: Notifications, Profile */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Mobile Search Icon */}
            <button
              onClick={() => navigate('/search')}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            {isAuthenticated && (
              <button
                onClick={() => navigate('/notifications')}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {/* Badge for unread notifications (can be wired to real data) */}
                {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
              </button>
            )}

            {/* Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                    <span className="text-gray-900 font-semibold text-sm">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <div className="text-sm font-medium text-white">
                        {user?.name || user?.email || 'User'}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                    </div>

                    <div className="border-t border-gray-700 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="px-4 py-2 text-sm font-medium bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BanibsNetworkNav;
