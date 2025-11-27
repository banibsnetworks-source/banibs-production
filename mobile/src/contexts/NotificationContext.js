/**
 * BANIBS Mobile - Notification Context
 * Phase M4 - Real-time Notifications
 */

import React, {createContext, useContext, useState, useEffect} from 'react';
import {useAuth} from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider',
    );
  }
  return context;
};

export const NotificationProvider = ({children}) => {
  const {isAuthenticated} = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      // In production, set up WebSocket or polling here
      const interval = setInterval(pollNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      // API call would go here
      // const data = await notificationService.getNotifications();
      // setNotifications(data.notifications);
      // setUnreadCount(data.unread_count);
      
      // Mock notifications for demo
      const mockNotifications = [
        {
          id: '1',
          type: 'like',
          message: 'Marcus liked your post',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
        {
          id: '2',
          type: 'comment',
          message: 'Aisha commented on your post',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false,
        },
        {
          id: '3',
          type: 'follow',
          message: 'Sarah started following you',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          read: true,
        },
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const pollNotifications = async () => {
    // Check for new notifications
    try {
      // API call for new notifications
      // const newNotifications = await notificationService.getNew();
      // if (newNotifications.length > 0) {
      //   setNotifications(prev => [...newNotifications, ...prev]);
      //   setUnreadCount(prev => prev + newNotifications.length);
      // }
    } catch (error) {
      console.error('Failed to poll notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // API call would go here
      // await notificationService.markAsRead(notificationId);
      
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? {...n, read: true} : n)),
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // API call would go here
      // await notificationService.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({...n, read: true})));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const clearNotification = async (notificationId) => {
    try {
      // API call would go here
      // await notificationService.delete(notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to clear notification:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    refresh: loadNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
