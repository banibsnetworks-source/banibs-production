/**
 * BANIBS Mobile - Notification Badge Component
 * Phase M4 - Real-time Notifications
 */

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {theme} from '../theme';

const NotificationBadge = ({count, style, size = 'medium'}) => {
  if (!count || count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();
  
  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
    },
  };

  return (
    <View style={[styles.container, sizeStyles[size].container, style]}>
      <Text style={[styles.text, sizeStyles[size].text]}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.status.error,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  containerSmall: {
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
  },
  containerMedium: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
  },
  containerLarge: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: 8,
  },
  text: {
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.bold,
  },
  textSmall: {
    fontSize: 10,
  },
  textMedium: {
    fontSize: 11,
  },
  textLarge: {
    fontSize: 12,
  },
});

export default NotificationBadge;
