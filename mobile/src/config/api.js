/**
 * BANIBS Mobile - API Configuration
 * Phase M5.1 - Environment & Auth Wiring
 * 
 * Centralized API configuration for all services
 */

// Use environment variable or default
// For production, set REACT_APP_BACKEND_URL in your .env or build config
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  
  // Notifications (Phase M5.2)
  NOTIFICATIONS: '/api/notifications',
  NOTIFICATION_READ: (id) => `/api/notifications/${id}/read`,
  NOTIFICATIONS_READ_ALL: '/api/notifications/read-all',
  
  // Groups (Phase M5.3)
  GROUPS: '/api/groups',
  MY_GROUPS: '/api/groups/my-groups',
  GROUP_DETAIL: (id) => `/api/groups/${id}`,
  GROUP_JOIN: (id) => `/api/groups/${id}/join`,
  GROUP_LEAVE: (id) => `/api/groups/${id}/leave`,
  GROUP_MEMBERS: (id) => `/api/groups/${id}/members`,
  
  // Social (existing)
  SOCIAL_FEED: '/api/social/posts',
  SOCIAL_POST: (id) => `/api/social/posts/${id}`,
  SOCIAL_COMMENTS: (postId) => `/api/social/posts/${postId}/comments`,
};

export default {
  API_BASE_URL,
  API_ENDPOINTS,
};
