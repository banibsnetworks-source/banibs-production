import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TopNav = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (showNotifications && notifications.length === 0) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/api/notifications?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      const token = localStorage.getItem('accessToken');
      await fetch(`${BACKEND_URL}/api/notifications/${notification.id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local state
      setUnreadCount(prev => Math.max(0, prev - (notification.read ? 0 : 1)));
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );

      // Navigate if link exists
      if (notification.link) {
        setShowNotifications(false);
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system': return '🔔';
      case 'business': return '🏢';
      case 'opportunity': return '💼';
      case 'event': return '📅';
      default: return '📣';
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
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
                {/* Badge for unread count */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[500px] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                    <div className="text-gray-800 font-semibold">Notifications</div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {loadingNotifications ? (
                    <div className="p-8 text-center text-gray-500">
                      Loading...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notif) => (
                        <button
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                            !notif.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl flex-shrink-0">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-sm font-semibold text-gray-900">
                                  {notif.title}
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mb-1 line-clamp-2">
                                {notif.message}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatTimeAgo(notif.created_at)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {notifications.length > 0 && (
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="block px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 border-t border-gray-200"
                    >
                      View All Notifications
                    </Link>
                  )}
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
