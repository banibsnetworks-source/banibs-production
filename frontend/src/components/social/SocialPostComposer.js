import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Video, Link2, Smile } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import MediaComposerModal from './MediaComposerModal';
import EmojiPicker from '../emoji/EmojiPicker.jsx';
import { applySkinTone } from '../../utils/emojiToneUtils';
import { ProfileAvatar } from './ProfileAvatar';

/**
 * SocialPostComposer - Polished UI v2
 * Clean, premium composer with clear visual hierarchy
 * 
 * UI Improvements:
 * - Better placeholder/guiding copy
 * - Improved spacing and padding
 * - Primary Post button styling
 * - Clear disabled state messaging
 * - No layout shift/jumps
 */
const SocialPostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [initialEmoji, setInitialEmoji] = useState('');
  const [error, setError] = useState(null);
  const emojiButtonRef = useRef(null);

  const handleSubmit = async (postData) => {
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/social/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(postData)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(responseData.detail || 'Failed to create post');
      }
      
      const newPost = responseData;
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
      
      toast.success('Post created successfully!');
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err.message || 'Failed to create post. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  const displayName = user?.name || user?.display_name || 'User';

  return (
    <>
      <div 
        className="bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-sm"
        data-testid="social-composer"
      >
        {/* Header with Avatar and User Info */}
        <div className="p-4 pb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <ProfileAvatar 
              name={displayName}
              avatarUrl={user?.profile?.avatar_url || user?.avatar_url}
              size="md"
            />
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-card-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                Posting to BANIBS Community
              </p>
            </div>
          </div>
        </div>

        {/* Composer Input - Opens Modal */}
        <div className="px-4 pb-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full text-left bg-muted/50 hover:bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground border border-transparent hover:border-amber-500/30 focus:border-amber-500 focus:outline-none transition-all"
            data-testid="composer-input"
          >
            Share a thought, story, or update...
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="px-4 pb-3">
            <p className="text-destructive text-xs bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons - Divider + Row */}
        <div className="border-t border-border/50">
          <div className="flex items-center px-2 py-2">
            {/* Photo */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors text-sm font-medium"
              data-testid="composer-photo-btn"
            >
              <ImageIcon size={18} className="text-green-500" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            {/* Video */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors text-sm font-medium"
              data-testid="composer-video-btn"
            >
              <Video size={18} className="text-blue-500" />
              <span className="hidden sm:inline">Video</span>
            </button>

            {/* Link */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors text-sm font-medium"
              data-testid="composer-link-btn"
            >
              <Link2 size={18} className="text-purple-500" />
              <span className="hidden sm:inline">Link</span>
            </button>

            {/* Emoji */}
            <div className="flex-1 relative">
              <button
                ref={emojiButtonRef}
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors text-sm font-medium"
                data-testid="composer-emoji-btn"
              >
                <Smile size={18} className="text-amber-500" />
                <span className="hidden sm:inline">Emoji</span>
              </button>
              
              {/* Emoji Picker Dropdown */}
              {showEmojiPicker && (
                <div 
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50"
                  style={{ minWidth: '320px' }}
                >
                  <EmojiPicker
                    onSelect={(emoji) => {
                      // Get the unicode character from the emoji object
                      // Priority: emoji.char (native unicode), then fallback options
                      let emojiContent = emoji.char || emoji.native || emoji.emoji || '';
                      
                      // Apply skin tone if supported
                      if (emojiContent && emoji.supportsSkinTone) {
                        const userSkinTone = user?.emoji_identity?.skinTone || 'tone4';
                        emojiContent = applySkinTone(emojiContent, userSkinTone, true);
                      }
                      
                      // Only proceed if we have actual emoji content
                      if (emojiContent) {
                        setInitialEmoji(emojiContent);
                        setShowEmojiPicker(false);
                        setIsModalOpen(true);
                      }
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Composer Modal */}
      <MediaComposerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInitialEmoji('');
        }}
        onSubmit={handleSubmit}
        initialText={initialEmoji}
      />
    </>
  );
};

export default SocialPostComposer;
