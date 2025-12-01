/**
 * BANIBS Mobile - Notifications Service
 * Phase M5.2 - Mobile Notifications Center
 * 
 * API calls for notifications (Phase 8.6 backend integration)
 */

import axiosInstance from '../utils/axiosInstance';
import {API_ENDPOINTS} from '../config/api';

export const notificationsService = {
  /**
   * Get all notifications for the current user
   * @param {Object} options - Query options
   * @param {number} options.limit - Max notifications to fetch
   * @param {boolean} options.unreadOnly - Only fetch unread notifications
   */
  async getNotifications({limit = 100, unreadOnly = false} = {}) {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      if (unreadOnly) {
        params.append('unread_only', 'true');
      }
      
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to load notifications'
      );
    }
  },

  /**
   * Mark a single notification as read
   * @param {string} notificationId
   */
  async markAsRead(notificationId) {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.NOTIFICATION_READ(notificationId)
      );
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to mark as read'
      );
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await axiosInstance.patch(
        API_ENDPOINTS.NOTIFICATIONS_READ_ALL
      );
      return response.data;
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      throw new Error(
        error.response?.data?.detail || 'Failed to mark all as read'
      );
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const response = await axiosInstance.get(
        `${API_ENDPOINTS.NOTIFICATIONS}/unread-count`
      );
      return response.data.unread_count || 0;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  },
};

export default notificationsService;
