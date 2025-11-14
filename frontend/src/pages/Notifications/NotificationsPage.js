import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import TopNav from '../Hub/TopNav';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, system, business, opportunity, event
  const [user, setUser] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserAndNotifications();
  }, [navigate, filter]);

  const fetchUserAndNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const [userRes, notifsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}/api/notifications?limit=100${filter === 'unread' ? '&unread_only=true' : ''}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!userRes.ok) {
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }

      const userData = await userRes.json();
      const notifsData = await notifsRes.json();

      setUser(userData);

      // Apply client-side type filter
      let filtered = notifsData;
      if (filter !== 'all' && filter !== 'unread') {
        filtered = notifsData.filter(n => n.type === filter);
      }

      setNotifications(filtered);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      const token = localStorage.getItem('accessToken');

      // Mark as read
      if (!notification.read) {
        await fetch(`${BACKEND_URL}/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Update local state
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
      }

      // Navigate if link exists
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-gray-600 mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'unread', 'system', 'business', 'opportunity', 'event'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ${
                filter === f
                  ? 'bg-yellow-400 text-black'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl divide-y divide-gray-100 shadow-sm">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition ${
                  !notif.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{formatTimeAgo(notif.created_at)}</span>
                      <span className="capitalize">{notif.type}</span>
                      {notif.link && (
                        <span className="text-yellow-600 font-semibold">
                          Click to view →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Back to Hub */}
        <div className="mt-8 text-center">
          <Link
            to="/hub"
            className="text-gray-600 hover:text-gray-900 font-semibold"
          >
            ← Back to Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
