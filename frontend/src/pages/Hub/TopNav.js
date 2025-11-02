import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TopNav = ({ user, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert('Unified search will be enabled in Phase 6.3.');
  };

  return (
    <nav className="bg-black border-b border-yellow-400/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/hub" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-yellow-400">BANIBS</span>
          </Link>

          {/* Search Bar (Center-Left) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search news, businesses, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-400"
              >
                🔍
              </button>
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-300 hover:text-yellow-400 transition"
              >
                <span className="text-xl">🔔</span>
                {/* Badge for unread count - stub for now */}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="text-gray-800 font-semibold mb-2">Notifications</div>
                  <div className="text-gray-500 text-sm text-center py-4">
                    Notifications will appear here (Phase 6.2+)
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="relative">
              <button
                onClick={() => setShowMessages(!showMessages)}
                className="relative p-2 text-gray-300 hover:text-yellow-400 transition"
              >
                <span className="text-xl">💬</span>
              </button>
              
              {showMessages && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                  <div className="text-gray-800 font-semibold mb-2">Messages</div>
                  <div className="text-gray-500 text-sm text-center py-4">
                    Messages will appear here (Phase 6.2+)
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-900 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-semibold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-white text-sm hidden lg:block">{user.name}</span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-semibold text-gray-800">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-yellow-600 mt-1">
                        {user.membership_level === 'free' ? 'Free Member' : user.membership_level}
                      </div>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/business/my-listings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      My Businesses
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-200 mt-2"></div>
                    
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
