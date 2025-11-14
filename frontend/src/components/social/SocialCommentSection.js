import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Smile } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EmojiPicker from '../emoji/EmojiPicker.jsx';
import { applySkinTone } from '../../utils/emojiToneUtils';
import PostTextWithEmojis from './PostTextWithEmojis';

/**
 * SocialCommentSection - Phase 8.3 + Emoji Support
 * Displays comments for a post and allows adding new comments with emoji support
 */

// Add styles for placeholder
const commentInputStyles = `
  [contenteditable][data-placeholder]:empty:before {
    content: attr(data-placeholder);
    color: hsl(var(--muted-foreground));
    pointer-events: none;
    position: absolute;
  }
`;

const SocialCommentSection = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Load comments
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${postId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load comments');
      }

      const data = await response.json();
      setComments(data.items || []);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            text: commentText.trim()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      
      // Add to local state
      setComments([...comments, newComment]);
      setCommentText('');
      
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="p-4 bg-muted/30">
      {/* Comments List */}
      <div className="space-y-3 mb-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="animate-spin text-muted-foreground" size={20} />
          </div>
        ) : error ? (
          <p className="text-red-400 text-xs text-center py-2">{error}</p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground text-xs text-center py-2">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2">
              {/* Commenter Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {comment.author.display_name.charAt(0).toUpperCase()}
              </div>
              
              {/* Comment Content */}
              <div className="flex-1">
                <div className="bg-background rounded-lg px-3 py-2 border border-border">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {comment.author.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(comment.created_at)}
                    </span>
                  </div>
                  <PostTextWithEmojis 
                    text={comment.text}
                    className="text-sm text-card-foreground"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex items-start space-x-2">
        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 text-xs font-bold flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>

        {/* Comment Input */}
        <div className="flex-1 relative">
          <div className="flex items-center space-x-1">
            <div className="flex-1 relative">
              {/* Hidden textarea for form submission */}
              <textarea
                ref={inputRef}
                value={commentText}
                onChange={() => {}} // Controlled by contenteditable
                className="hidden"
                disabled={isSubmitting}
              />
              
              {/* Contenteditable div with live emoji rendering */}
              <div
                contentEditable={!isSubmitting}
                suppressContentEditableWarning
                onInput={(e) => {
                  const text = e.currentTarget.textContent || '';
                  setCommentText(text);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment(e);
                  }
                }}
                className="w-full bg-background text-foreground rounded-lg px-3 py-2 text-sm border border-input focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all min-h-[38px] max-h-[120px] overflow-y-auto"
                style={{ 
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
                data-placeholder={commentText ? '' : 'Write a comment...'}
              >
                <PostTextWithEmojis 
                  text={commentText}
                  className=""
                />
              </div>
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Smile size={16} />
              </button>
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '8px', zIndex: 1000 }}>
                  <EmojiPicker
                    onSelect={(emoji) => {
                      let emojiContent = '';
                      
                      if (emoji.type === 'unicode') {
                        // Unicode emoji: apply user's skin tone
                        const userSkinTone = user?.emoji_identity?.skinTone || 'tone4';
                        const supportsSkinTone = emoji.supportsSkinTone !== undefined ? emoji.supportsSkinTone : false;
                        emojiContent = supportsSkinTone 
                          ? applySkinTone(emoji.char, userSkinTone, true)
                          : emoji.char;
                      } else if (emoji.type === 'image') {
                        // Image emoji: use placeholder format
                        emojiContent = `[emoji:${emoji.id}]`;
                      }
                      
                      const input = inputRef.current;
                      if (input && emojiContent) {
                        const start = input.selectionStart || 0;
                        const end = input.selectionEnd || 0;
                        const newText = commentText.substring(0, start) + emojiContent + commentText.substring(end);
                        setCommentText(newText);
                        setTimeout(() => {
                          input.focus();
                          input.selectionStart = input.selectionEnd = start + emojiContent.length;
                        }, 0);
                      }
                      setShowEmojiPicker(false);
                    }}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="p-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default SocialCommentSection;
