/**
 * BANIBS Mobile - Create Post Screen
 * Phase M2 - Social Feed
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import Container from '../components/Container';
import Button from '../components/Button';
import MediaPicker from '../components/MediaPicker';
import {useAuth} from '../contexts/AuthContext';
import {socialService} from '../services/socialService';
import {theme} from '../theme';

const CreatePostScreen = ({navigation}) => {
  const {user} = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mediaPickerVisible, setMediaPickerVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handleCreatePost = async () => {
    if (!text.trim()) {
      Alert.alert('Empty Post', 'Please write something to share.');
      return;
    }

    setLoading(true);
    try {
      await socialService.createPost(text.trim());
      Alert.alert('Success', 'Your post has been shared!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Create Post</Text>
          <View style={styles.placeholder} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user?.first_name} {user?.last_name}
          </Text>
        </View>

        {/* Post Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor={theme.colors.text.tertiary}
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            maxLength={1000}
          />
          <Text style={styles.charCount}>{text.length}/1000</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Text style={styles.actionsTitle}>Add to your post</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>📷</Text>
              <Text style={styles.actionButtonLabel}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>🎥</Text>
              <Text style={styles.actionButtonLabel}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>📍</Text>
              <Text style={styles.actionButtonLabel}>Location</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <Button
            title="Post"
            onPress={handleCreatePost}
            loading={loading}
            disabled={!text.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </Container>
  );
};

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
  userInfo: {
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
  userName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  inputContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
    marginTop: theme.spacing.sm,
  },
  actions: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
  },
  actionsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  actionButtonLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  footer: {
    padding: theme.spacing.md,
  },
});

export default CreatePostScreen;
