/**
 * BANIBS Mobile - Notification Helpers
 * Phase M5.2 - Shared notification mapping
 * 
 * Keeps mobile + web notification semantics aligned
 */

/**
 * Get notification icon based on type and event_type
 * @param {string} type - Notification type (group_event, relationship_event, etc.)
 * @param {string} event_type - Specific event type
 * @returns {string} Emoji icon
 */
export const getNotificationIcon = (type, event_type) => {
  // Phase 8.6 - Group & Relationship events
  if (type === 'group_event') {
    return '👥'; // Groups icon
  }
  
  if (type === 'relationship_event') {
    return '🤝'; // Relationships icon
  }
  
  // Legacy types
  switch (type) {
    case 'system':
      return '🔔';
    case 'business':
      return '🏢';
    case 'opportunity':
      return '💼';
    case 'event':
      return '📅';
    case 'like':
      return '❤️';
    case 'comment':
      return '💬';
    case 'follow':
      return '👤';
    case 'mention':
      return '@';
    default:
      return '📣';
  }
};

/**
 * Get notification badge color based on type
 * @param {string} type - Notification type
 * @returns {string} Color hex code
 */
export const getNotificationBadgeColor = (type) => {
  const colors = {
    group_event: '#9333EA', // Purple (matches web: bg-purple-100)
    relationship_event: '#3B82F6', // Blue (matches web: bg-blue-100)
    system: '#6B7280', // Gray
    business: '#10B981', // Green
    opportunity: '#F59E0B', // Yellow/Gold
    event: '#EC4899', // Pink
  };
  
  return colors[type] || colors.system;
};

/**
 * Get human-readable label for event type
 * @param {string} type - Notification type
 * @param {string} event_type - Specific event type
 * @returns {string} Human-readable label
 */
export const getNotificationLabel = (type, event_type) => {
  // Group event labels
  if (type === 'group_event' && event_type) {
    const labels = {
      GROUP_CREATED: 'Group Created',
      GROUP_INVITE: 'Group Invitation',
      GROUP_JOIN_REQUEST: 'Join Request',
      GROUP_JOIN_APPROVED: 'Join Approved',
      GROUP_JOIN_REJECTED: 'Join Declined',
      GROUP_MEMBER_ADDED: 'Added to Group',
      GROUP_ROLE_CHANGE: 'Role Changed',
      GROUP_MEMBER_REMOVED: 'Removed from Group',
      GROUP_UPDATED: 'Group Updated',
    };
    return labels[event_type] || 'Group';
  }
  
  // Relationship event labels
  if (type === 'relationship_event' && event_type) {
    const labels = {
      RELATIONSHIP_REQUEST: 'Connection Request',
      RELATIONSHIP_ACCEPTED: 'Connection Accepted',
      RELATIONSHIP_TIER_CHANGE: 'Circle Updated',
      RELATIONSHIP_UNBLOCKED: 'Connection Restored',
    };
    return labels[event_type] || 'Connection';
  }
  
  // Legacy types
  const typeLabels = {
    system: 'System',
    business: 'Business',
    opportunity: 'Opportunity',
    event: 'Event',
    group_event: 'Group',
    relationship_event: 'Connection',
  };
  
  return typeLabels[type] || 'Notification';
};

/**
 * Format timestamp to relative time (e.g., "5m ago")
 * @param {string|Date} timestamp
 * @returns {string} Formatted time
 */
export const formatTimeAgo = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  // Format as date if older than a week
  return date.toLocaleDateString();
};

/**
 * Get deep link route from notification
 * @param {Object} notification
 * @returns {Object} Navigation params {screen, params}
 */
export const getNotificationRoute = (notification) => {
  const {type, event_type, link, group_id} = notification;
  
  // Group events - navigate to GroupDetail
  if (type === 'group_event' && group_id) {
    return {
      screen: 'GroupDetail',
      params: {groupId: group_id},
    };
  }
  
  // Relationship events - navigate to Connections (when implemented)
  if (type === 'relationship_event') {
    return {
      screen: 'Social', // Or 'Connections' when that screen exists
      params: {},
    };
  }
  
  // Fallback: use link if provided
  if (link) {
    // Parse link and determine screen
    if (link.includes('/groups/')) {
      const groupId = link.split('/groups/')[1];
      return {
        screen: 'GroupDetail',
        params: {groupId},
      };
    }
  }
  
  // Default: return to Social/Home
  return {
    screen: 'Social',
    params: {},
  };
};

export default {
  getNotificationIcon,
  getNotificationBadgeColor,
  getNotificationLabel,
  formatTimeAgo,
  getNotificationRoute,
};
