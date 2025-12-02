/**
 * BANIBS Mobile - Group Detail Screen
 * Phase M5.3 - Mobile Groups Module
 * 
 * Displays group details with ability to:
 * - View group information
 * - Join/leave group
 * - View members
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {theme} from '../theme';
import groupsService from '../services/groupsService';

const GroupDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {groupId} = route.params;

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroupDetail();
  }, [groupId]);

  const loadGroupDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await groupsService.getGroupDetail(groupId);
      setGroup(data);
    } catch (err) {
      console.error('Failed to load group detail:', err);
      setError(err.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      setActionLoading(true);
      
      await groupsService.joinGroup(groupId);
      
      // Reload group to get updated membership
      await loadGroupDetail();
      
      Alert.alert('Success', 'You have joined the group!');
    } catch (err) {
      console.error('Failed to join group:', err);
      Alert.alert('Error', err.message || 'Failed to join group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              
              await groupsService.leaveGroup(groupId);
              
              Alert.alert('Success', 'You have left the group');
              navigation.goBack();
            } catch (err) {
              console.error('Failed to leave group:', err);
              Alert.alert('Error', err.message || 'Failed to leave group');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const getPrivacyBadge = (privacy) => {
    const badges = {
      PUBLIC: {icon: '🌐', label: 'Public', color: '#10B981'},
      PRIVATE: {icon: '🔒', label: 'Private', color: '#F59E0B'},
      SECRET: {icon: '👁️', label: 'Secret', color: '#EF4444'},
    };
    
    const badge = badges[privacy] || badges.PUBLIC;
    
    return (
      <View style={[styles.privacyBadge, {backgroundColor: badge.color + '20'}]}>
        <Text style={styles.privacyIcon}>{badge.icon}</Text>
        <Text style={[styles.privacyLabel, {color: badge.color}]}>
          {badge.label}
        </Text>
      </View>
    );
  };

  const getMembershipStatus = () => {
    if (!group?.membership) {
      return {text: 'Not a member', color: theme.colors.text.secondary};
    }
    
    const status = group.membership.status;
    const role = group.membership.role;
    
    if (status === 'PENDING') {
      return {text: 'Request Pending', color: '#F59E0B'};
    }
    
    if (status === 'ACTIVE') {
      const roleColors = {
        OWNER: '#9333EA',
        ADMIN: '#3B82F6',
        MODERATOR: '#10B981',
        MEMBER: '#6B7280',
      };
      return {text: role, color: roleColors[role] || roleColors.MEMBER};
    }
    
    return {text: status, color: theme.colors.text.secondary};
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.gold} />
        <Text style={styles.loadingText}>Loading group...</Text>
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>{error || 'Group not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadGroupDetail}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const membershipStatus = getMembershipStatus();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>{group.name}</Text>
          
          <View style={styles.headerMeta}>
            {getPrivacyBadge(group.privacy)}
            <Text style={styles.memberCount}>
              👥 {group.member_count || 0} members
            </Text>
          </View>
        </View>

        {/* Membership Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Your Status:</Text>
          <Text style={[styles.statusValue, {color: membershipStatus.color}]}>
            {membershipStatus.text}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{group.description}</Text>
        </View>

        {/* Rules */}
        {group.rules && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rules</Text>
            <Text style={styles.rules}>{group.rules}</Text>
          </View>
        )}

        {/* Tags */}
        {group.tags && group.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {group.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {group.membership ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.leaveButton]}
            onPress={handleLeaveGroup}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.leaveButtonText}>Leave Group</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={handleJoinGroup}
            disabled={actionLoading}>
            {actionLoading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.joinButtonText}>
                {group.privacy === 'PRIVATE' ? 'Request to Join' : 'Join Group'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    marginBottom: 12,
  },
  backBtnText: {
    fontSize: 16,
    color: theme.colors.primary.gold,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  privacyIcon: {
    fontSize: 16,
  },
  privacyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginRight: 8,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  rules: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: theme.colors.primary.gold,
  },
  joinButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
  },
  leaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupDetailScreen;
