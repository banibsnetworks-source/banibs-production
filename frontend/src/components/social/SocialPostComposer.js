import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, Video, Link2, Smile } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MediaComposerModal from './MediaComposerModal';
import EmojiPicker from '../emoji/EmojiPicker';

/**
 * SocialPostComposer - Phase 8.1 (Updated for Media Composer + Emoji Picker)
 * Component for creating new social posts with media support and emoji picker
 */
const SocialPostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [initialEmoji, setInitialEmoji] = useState('');
  const [error, setError] = useState(null);
  const emojiButtonRef = useRef(null);

  const handleSubmit = async (postData) => {
    setError(null);
    
    try {
      // Get token from localStorage
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
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(errorData.detail || 'Failed to create post');
      }
      
      const newPost = await response.json();
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      const errorMessage = err.message || 'Failed to create post. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          {/* User Info */}
          <div>
            <p className="text-sm font-semibold text-card-foreground">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">Share with the BANIBS community</p>
          </div>
        </div>

        {/* Quick Composer - Opens Modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-background text-left text-muted-foreground rounded-lg px-4 py-3 text-sm border border-input hover:border-yellow-500 focus:border-yellow-500 focus:outline-none transition-all"
        >
          What's on your mind?
        </button>

        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}

        {/* Media buttons */}
        <div className="flex items-center space-x-2 mt-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-sm"
          >
            <ImageIcon size={18} />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-sm"
          >
            <Video size={18} />
            <span>Video</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-sm"
          >
            <Link2 size={18} />
            <span>Link</span>
          </button>
          <div className="relative">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors text-sm"
            >
              <Smile size={18} />
              <span>Emoji</span>
            </button>
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <EmojiPicker
                onEmojiSelect={(emoji) => {
                  setInitialEmoji(emoji);
                  setShowEmojiPicker(false);
                  setIsModalOpen(true);
                }}
                onClose={() => setShowEmojiPicker(false)}
                position="top"
              />
            )}
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
