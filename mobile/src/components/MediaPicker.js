/**
 * BANIBS Mobile - Media Picker Component
 * Phase M4 - Media Upload
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import {theme} from '../theme';

const MediaPicker = ({onMediaSelected, onClose, visible}) => {
  const [selectedMedia, setSelectedMedia] = useState(null);

  const handlePickImage = () => {
    // In production, this would use react-native-image-picker
    // For now, showing UI flow
    Alert.alert(
      'Select Image',
      'Choose image source',
      [
        {
          text: 'Camera',
          onPress: () => handleMediaSource('camera', 'image'),
        },
        {
          text: 'Photo Library',
          onPress: () => handleMediaSource('library', 'image'),
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const handlePickVideo = () => {
    Alert.alert(
      'Select Video',
      'Choose video source',
      [
        {
          text: 'Camera',
          onPress: () => handleMediaSource('camera', 'video'),
        },
        {
          text: 'Video Library',
          onPress: () => handleMediaSource('library', 'video'),
        },
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  const handleMediaSource = (source, type) => {
    // Mock media selection
    const mockMedia = {
      uri: 'https://via.placeholder.com/400',
      type: type,
      source: source,
      timestamp: Date.now(),
    };
    
    setSelectedMedia(mockMedia);
    onMediaSelected?.(mockMedia);
    
    Alert.alert(
      'Media Selected',
      `${type} from ${source} selected successfully!`,
      [{text: 'OK', onPress: onClose}],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Media</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handlePickImage}>
              <Text style={styles.optionIcon}>📷</Text>
              <Text style={styles.optionLabel}>Photo</Text>
              <Text style={styles.optionSubtext}>Take or choose photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handlePickVideo}>
              <Text style={styles.optionIcon}>🎥</Text>
              <Text style={styles.optionLabel}>Video</Text>
              <Text style={styles.optionSubtext}>Record or choose video</Text>
            </TouchableOpacity>
          </View>

          {selectedMedia && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Selected:</Text>
              <Image
                source={{uri: selectedMedia.uri}}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  optionButton: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  optionLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  optionSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  previewContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
  },
  previewLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.md,
  },
});

export default MediaPicker;
