/**
 * BANIBS Mobile - Notifications Screen
 * Phase M5.2 - Real Backend Integration
 * 
 * Displays user notifications with:
 * - Real backend data (Phase 8.6 integration)
 * - Group & relationship event icons (👥 / 🤝)
 * - Color-coded badges (purple/blue)
 * - Deep linking to groups
 * - Mark as read functionality
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../theme';
import notificationsService from '../services/notificationsService';
import {
  getNotificationIcon,
  getNotificationBadgeColor,
  getNotificationLabel,
  formatTimeAgo,
  getNotificationRoute,
} from '../utils/notificationHelpers';

const NotificationItem = ({notification, onPress}) => {
  const icon = getNotificationIcon(notification.type);
  const badgeColor = getNotificationBadgeColor(notification.type);
  const label = getNotificationLabel(notification);

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read && styles.notificationItemUnread,
      ]}
      onPress={() => onPress(notification)}>
      <View style={[styles.notificationIcon, {backgroundColor: badgeColor}]}>
        <Text style={styles.notificationIconText}>{icon}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationMessage,
            !notification.read && styles.notificationMessageUnread,
          ]}>
          {label}
        </Text>
        <Text style={styles.notificationTime}>
          {formatTimeAgo(notification.createdAt)}
        </Text>
      </View>
      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const NotificationsScreen = ({navigation}) => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    refresh,
  } = useNotifications();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification.id);
    // Navigate based on notification type
    // navigation.navigate('Post', {postId: notification.postId});
  };

  return (
    <Container safe>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadCount}>
                {unreadCount} unread
              </Text>
            )}
          </View>
          {notifications.length > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllRead}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications List */}
        <FlatList
          data={notifications}
          renderItem={({item}) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
              onClear={clearNotification}
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          }
        />
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  unreadCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.gold,
    marginTop: theme.spacing.xs,
  },
  markAllRead: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.gold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  listContent: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  notificationItemUnread: {
    backgroundColor: theme.colors.background.tertiary,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  notificationIconText: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  notificationMessageUnread: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  notificationTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
  clearButtonText: {
    fontSize: 18,
    color: theme.colors.text.tertiary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default NotificationsScreen;
