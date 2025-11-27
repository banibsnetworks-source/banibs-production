/**
 * BANIBS Mobile - User Profile Screen
 * Phase M3 - User Profiles
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Container from '../components/Container';
import PostCard from '../components/PostCard';
import {theme} from '../theme';

const UserProfileScreen = ({route, navigation}) => {
  const {userId} = route.params;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      // API call would go here
      // const data = await userService.getProfile(userId);
      // setProfile(data);
      
      // Mock data for demo
      setProfile(getMockProfile());
      setPosts(getMockPosts());
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.gold} />
        </View>
      </Container>
    );
  }

  return (
    <Container safe>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.profileHandle}>@{profile?.handle}</Text>
          {profile?.bio && (
            <Text style={styles.profileBio}>{profile.bio}</Text>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.posts_count || 0}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.followers_count || 0}
              </Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {profile?.following_count || 0}
              </Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'posts' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('posts')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'posts' && styles.tabTextActive,
              ]}>
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'media' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('media')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'media' && styles.tabTextActive,
              ]}>
              Media
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'likes' && styles.tabActive,
            ]}
            onPress={() => setActiveTab('likes')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'likes' && styles.tabTextActive,
              ]}>
              Likes
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'posts' &&
            posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          {activeTab === 'media' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No media yet</Text>
            </View>
          )}
          {activeTab === 'likes' && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No likes yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Container>
  );
};

const getMockProfile = () => ({
  name: 'Sarah Johnson',
  handle: 'sarahj',
  bio: 'Entrepreneur | Community Builder | Tech Enthusiast 🚀',
  posts_count: 127,
  followers_count: 1845,
  following_count: 432,
});

const getMockPosts = () => [
  {
    id: '1',
    author_id: 'user1',
    author_name: 'Sarah Johnson',
    text: 'Excited about the future of Black-owned businesses! 🚀',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    like_count: 42,
    comment_count: 8,
    share_count: 3,
  },
];

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: theme.spacing.md,
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  profileSection: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#000000',
  },
  profileName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  profileHandle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  profileBio: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  followButton: {
    flex: 1,
    backgroundColor: theme.colors.primary.gold,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#000000',
  },
  messageButton: {
    flex: 1,
    backgroundColor: theme.colors.background.tertiary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  messageButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary.gold,
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  tabTextActive: {
    color: theme.colors.primary.gold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  content: {
    padding: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
});

export default UserProfileScreen;
