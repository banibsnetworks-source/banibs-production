/**
 * BANIBS Mobile - Social Feed Screen (Enhanced)
 * Phase M2 - Social Feed
 */

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import Container from '../components/Container';
import PostCard from '../components/PostCard';
import CreatePostCard from '../components/CreatePostCard';
import {useAuth} from '../contexts/AuthContext';
import {socialService} from '../services/socialService';
import {theme} from '../theme';

const SocialFeedScreen = ({navigation}) => {
  const {user} = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setError(null);
      const feedData = await socialService.getFeed();
      setPosts(feedData.posts || feedData || []);
    } catch (err) {
      setError(err.message);
      // Use mock data if API fails
      setPosts(getMockPosts());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed();
  }, []);

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleLike = async (postId, liked) => {
    try {
      if (liked) {
        await socialService.likePost(postId);
      } else {
        await socialService.unlikePost(postId);
      }
    } catch (error) {
      console.error('Like action failed:', error);
    }
  };

  const handleComment = (postId) => {
    navigation.navigate('Comments', {postId});
  };

  const handleProfile = (userId) => {
    navigation.navigate('UserProfile', {userId});
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <CreatePostCard
        onPress={handleCreatePost}
        userName={`${user?.first_name} ${user?.last_name}`}
      />
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>
            ⚠️ Using demo data - {error}
          </Text>
        </View>
      )}
    </View>
  );

  const renderPost = ({item}) => (
    <PostCard
      post={item}
      onLike={handleLike}
      onComment={handleComment}
      onProfile={handleProfile}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptyText}>
        Be the first to share something with your community!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.gold} />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary.gold}
          />
        }
      />
    </Container>
  );
};

// Mock data for development/demo
const getMockPosts = () => [
  {
    id: '1',
    author_id: 'user1',
    author_name: 'Sarah Johnson',
    text: 'Excited to announce the launch of my new business venture! Supporting Black-owned businesses is more important than ever. 🚀✨',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    like_count: 24,
    comment_count: 8,
    share_count: 3,
    isLiked: false,
  },
  {
    id: '2',
    author_id: 'user2',
    author_name: 'Marcus Williams',
    text: 'Just finished an amazing networking event with fellow entrepreneurs. The BANIBS community is truly special! 🙌',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    like_count: 42,
    comment_count: 15,
    share_count: 7,
    isLiked: true,
  },
  {
    id: '3',
    author_id: 'user3',
    author_name: 'Aisha Thompson',
    text: 'Looking for recommendations for Black-owned coffee shops in the area. Drop your favorites below! ☕📍',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    like_count: 18,
    comment_count: 23,
    share_count: 2,
    isLiked: false,
  },
];

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.sm,
  },
  errorBanner: {
    backgroundColor: theme.colors.status.warning + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.status.warning,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
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

export default SocialFeedScreen;
