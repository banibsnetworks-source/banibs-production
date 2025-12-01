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
        localStorage.removeItem('access_token');
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
      const token = localStorage.getItem('access_token');

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

      // Navigate if link exists (Phase 8.6 - Deep linking with graceful fallback)
      if (notification.link) {
        try {
          navigate(notification.link);
        } catch (navError) {
          console.error('Navigation error, falling back to safe route:', navError);
          
          // Graceful fallback based on notification type
          if (notification.type === 'group_event') {
            navigate('/portal/social/groups');
          } else if (notification.type === 'relationship_event') {
            navigate('/portal/social/connections');
          } else {
            navigate('/hub');
          }
        }
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
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

  // Phase 8.6 - Get notification badge color based on type
  const getNotificationBadgeColor = (type) => {
    switch (type) {
      case 'group_event': return 'bg-purple-100 text-purple-700';
      case 'relationship_event': return 'bg-blue-100 text-blue-700';
      case 'system': return 'bg-gray-100 text-gray-700';
      case 'business': return 'bg-green-100 text-green-700';
      case 'opportunity': return 'bg-yellow-100 text-yellow-700';
      case 'event': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Phase 8.6 - Get user-friendly type label
  const getTypeLabel = (type, event_type) => {
    if (type === 'group_event') {
      if (event_type) {
        const labels = {
          'GROUP_CREATED': 'Group Created',
          'GROUP_INVITE': 'Group Invitation',
          'GROUP_JOIN_REQUEST': 'Join Request',
          'GROUP_JOIN_APPROVED': 'Join Approved',
          'GROUP_JOIN_REJECTED': 'Join Declined',
          'GROUP_MEMBER_ADDED': 'Added to Group',
          'GROUP_ROLE_CHANGE': 'Role Changed',
          'GROUP_MEMBER_REMOVED': 'Removed from Group',
          'GROUP_UPDATED': 'Group Updated'
        };
        return labels[event_type] || 'Group';
      }
      return 'Group';
    }
    
    if (type === 'relationship_event') {
      if (event_type) {
        const labels = {
          'RELATIONSHIP_REQUEST': 'Connection Request',
          'RELATIONSHIP_ACCEPTED': 'Connection Accepted',
          'RELATIONSHIP_TIER_CHANGE': 'Circle Updated',
          'RELATIONSHIP_UNBLOCKED': 'Connection Restored'
        };
        return labels[event_type] || 'Connection';
      }
      return 'Connection';
    }
    
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system': return '🔔';
      case 'business': return '🏢';
      case 'opportunity': return '💼';
      case 'event': return '📅';
      case 'group_event': return '👥'; // Phase 8.6 - Group icon
      case 'relationship_event': return '🤝'; // Phase 8.6 - Relationship icon
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

      <div className="container-v2 section-v2 page-enter">
        {/* Header */}
        <div className="flex items-center justify-between breathing-room-lg">
          <div>
            <h1 className="text-3xl font-bold text-foreground-v2">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-secondary-v2 breathing-room-xs">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="btn-v2 btn-v2-ghost btn-v2-sm"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 breathing-room-lg overflow-x-auto">
          {['all', 'unread', 'system', 'business', 'opportunity', 'event', 'group_event', 'relationship_event'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-v2 ${
                filter === f
                  ? 'btn-v2-primary'
                  : 'btn-v2-secondary'
              } btn-v2-sm whitespace-nowrap`}
            >
              {f === 'group_event' ? 'Groups' : f === 'relationship_event' ? 'Connections' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12 text-secondary-v2">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state-v2">
            <div className="empty-state-icon">
              🔔
            </div>
            <h3 className="empty-state-title">
              No notifications
            </h3>
            <p className="empty-state-description">
              {filter === 'unread' ? 'All caught up!' : 'You have no notifications yet.'}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="btn-v2 btn-v2-primary btn-v2-md"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="card-v2 divide-y divide-gray-100">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full text-left clean-spacing-md hover-lift transition ${
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
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className="text-gray-500">{formatTimeAgo(notif.created_at)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationBadgeColor(notif.type)}`}>
                        {getTypeLabel(notif.type, notif.event_type)}
                      </span>
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
        <div className="breathing-room-xl text-center">
          <Link
            to="/hub"
            className="btn-v2 btn-v2-ghost btn-v2-sm"
          >
            ← Back to Hub
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
