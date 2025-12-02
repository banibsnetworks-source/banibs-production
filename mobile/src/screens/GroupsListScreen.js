/**
 * BANIBS Mobile - Groups List Screen
 * Phase M5.3 - Mobile Groups Module
 * 
 * Displays user's groups with ability to:
 * - View joined groups
 * - Browse all public groups
 * - Navigate to group details
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {theme} from '../theme';
import groupsService from '../services/groupsService';

const GroupCard = ({group, onPress}) => {
  const getPrivacyIcon = (privacy) => {
    switch (privacy) {
      case 'PUBLIC':
        return '🌐';
      case 'PRIVATE':
        return '🔒';
      case 'SECRET':
        return '👁️';
      default:
        return '🌐';
    }
  };

  const getMembershipBadge = (membership) => {
    if (!membership) return null;
    
    const roleColors = {
      OWNER: '#9333EA',
      ADMIN: '#3B82F6',
      MODERATOR: '#10B981',
      MEMBER: '#6B7280',
    };
    
    const color = roleColors[membership.role] || roleColors.MEMBER;
    
    return (
      <View style={[styles.membershipBadge, {backgroundColor: color}]}>
        <Text style={styles.membershipBadgeText}>{membership.role}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.groupCard} onPress={() => onPress(group)}>
      {/* Header */}
      <View style={styles.groupCardHeader}>
        <Text style={styles.groupName} numberOfLines={1}>
          {group.name}
        </Text>
        <Text style={styles.privacyIcon}>
          {getPrivacyIcon(group.privacy)}
        </Text>
      </View>

      {/* Description */}
      <Text style={styles.groupDescription} numberOfLines={2}>
        {group.description}
      </Text>

      {/* Footer */}
      <View style={styles.groupCardFooter}>
        <Text style={styles.memberCount}>
          👥 {group.member_count || 0} members
        </Text>
        {getMembershipBadge(group.membership)}
      </View>
    </TouchableOpacity>
  );
};

const GroupsListScreen = () => {
  const navigation = useNavigation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch user's groups
      const data = await groupsService.getMyGroups(50);
      setGroups(data);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError(err.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupDetail', {groupId: group.id});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.gold} />
        <Text style={styles.loadingText}>Loading groups...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadGroups}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Groups</Text>
        <Text style={styles.subtitle}>{groups.length} groups</Text>
      </View>

      {/* Groups List */}
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No Groups Yet</Text>
          <Text style={styles.emptyText}>
            You haven't joined any groups yet. Explore and connect with communities!
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <GroupCard group={item} onPress={handleGroupPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary.gold}
            />
          }
        />
      )}
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
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  groupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  privacyIcon: {
    fontSize: 20,
  },
  groupDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  groupCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  membershipBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GroupsListScreen;
