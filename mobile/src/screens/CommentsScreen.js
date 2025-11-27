/**
 * BANIBS Mobile - Comments Screen
 * Phase M3 - Comments & Threading
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Container from '../components/Container';
import {useAuth} from '../contexts/AuthContext';
import {socialService} from '../services/socialService';
import {theme} from '../theme';

const CommentItem = ({comment, onReply}) => {
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {comment.author_name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.commentInfo}>
          <Text style={styles.commentAuthor}>{comment.author_name}</Text>
          <Text style={styles.commentTime}>
            {formatTimeAgo(comment.created_at)}
          </Text>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
      <TouchableOpacity
        style={styles.replyButton}
        onPress={() => onReply(comment)}>
        <Text style={styles.replyButtonText}>Reply</Text>
      </TouchableOpacity>
    </View>
  );
};

const CommentsScreen = ({route, navigation}) => {
  const {postId} = route.params;
  const {user} = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await socialService.getComments(postId);
      setComments(data.comments || data || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
      // Mock data for demo
      setComments(getMockComments());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const newComment = await socialService.createComment(
        postId,
        commentText.trim(),
      );
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      // Optimistically add comment
      const optimisticComment = {
        id: Date.now().toString(),
        author_name: `${user?.first_name} ${user?.last_name}`,
        text: commentText.trim(),
        created_at: new Date().toISOString(),
      };
      setComments([optimisticComment, ...comments]);
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (comment) => {
    setCommentText(`@${comment.author_name} `);
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Comments</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Comments List */}
        <FlatList
          data={comments}
          renderItem={({item}) => (
            <CommentItem comment={item} onReply={handleReply} />
          )}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>
                Be the first to share your thoughts!
              </Text>
            </View>
          }
        />

        {/* Comment Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Write a comment..."
              placeholderTextColor={theme.colors.text.tertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!commentText.trim() || submitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}>
              {submitting ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Text style={styles.sendIcon}>➤</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};

const getMockComments = () => [
  {
    id: '1',
    author_name: 'Marcus Johnson',
    text: 'This is exactly what our community needs! 💯',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    author_name: 'Aisha Williams',
    text: 'Love this initiative. Count me in!',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  commentItem: {
    marginBottom: theme.spacing.lg,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  commentAvatarText: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#000000',
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  commentTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  commentText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight:
      theme.typography.fontSize.base * theme.typography.lineHeight.normal,
    marginBottom: theme.spacing.sm,
  },
  replyButton: {
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary.gold,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    padding: theme.spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    maxHeight: 100,
    marginRight: theme.spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: '#000000',
  },
});

export default CommentsScreen;
