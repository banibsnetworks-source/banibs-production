/**
 * BANIBS Mobile - Create Post Card
 * Phase M2 - Social Feed
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {theme} from '../theme';

const CreatePostCard = ({onPress, userName}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.inputPlaceholder}>
          <Text style={styles.placeholderText}>
            What's on your mind, {userName?.split(' ')[0] || 'there'}?
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Photo</Text>
        </View>
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>🎥</Text>
          <Text style={styles.actionLabel}>Video</Text>
        </View>
        <View style={styles.actionItem}>
          <Text style={styles.actionIcon}>📍</Text>
          <Text style={styles.actionLabel}>Location</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#000000',
  },
  inputPlaceholder: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    paddingVertical: theme.spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  actionLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default CreatePostCard;
