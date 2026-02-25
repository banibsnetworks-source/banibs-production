import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader, Smile, MoreVertical, Trash2, Image as ImageIcon, X, Reply, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import EmojiPicker from '../emoji/EmojiPicker.jsx';
import { applySkinTone } from '../../utils/emojiToneUtils';
import PostTextWithEmojis from './PostTextWithEmojis';
import DropdownMenu, { DropdownMenuItem } from '../common/DropdownMenu';
import ConfirmModal from '../common/ConfirmModal';

/**
 * SocialCommentSection - Phase 8.3 + Emoji Support + Image Support
 * Displays comments for a post and allows adding new comments with emoji and image support
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
  const fileInputRef = useRef(null);
  
  // Media state for comment
  const [commentMedia, setCommentMedia] = useState([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState(null); // { id, authorName }
  
  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    
    if ((!commentText.trim() && commentMedia.length === 0) || isSubmitting) return;
    
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
            text: commentText.trim() || ' ',
            media: commentMedia.map(m => ({
              url: m.url,
              type: m.type,
              width: m.width,
              height: m.height
            })),
            parent_id: replyingTo?.id || null
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const newComment = await response.json();
      
      // Add to local state - if reply, add to parent's replies array
      if (replyingTo) {
        setComments(comments.map(c => 
          c.id === replyingTo.id 
            ? { ...c, replies: [...(c.replies || []), newComment] }
            : c
        ));
      } else {
        setComments([...comments, { ...newComment, replies: [] }]);
      }
      
      setCommentText('');
      setCommentMedia([]);
      setReplyingTo(null);
      
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
  
  // Handle reply click
  const handleReplyClick = (comment) => {
    setReplyingTo({ id: comment.id, authorName: comment.author.display_name });
    inputRef.current?.focus();
  };
  
  // Cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Handle image upload for comment
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only allow images for comments
    if (!file.type.startsWith('image/')) {
      setError('Only images are allowed in comments');
      return;
    }
    
    setIsUploadingMedia(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/media/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const uploadedMedia = await response.json();
      setCommentMedia([uploadedMedia]); // Only 1 image per comment for v1
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setIsUploadingMedia(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = () => {
    setCommentMedia([]);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/comments/${commentToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Remove from local state
      setComments(comments.filter(c => c.id !== commentToDelete.id));
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    } finally {
      setIsDeleting(false);
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
      {/* Inject placeholder styles */}
      <style>{commentInputStyles}</style>
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
            <div key={comment.id} className="flex space-x-2 group">
              {/* Commenter Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {comment.author.display_name.charAt(0).toUpperCase()}
              </div>
              
              {/* Comment Content */}
              <div className="flex-1">
                <div className="bg-background rounded-lg px-3 py-2 border border-border relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-foreground">
                        {comment.author.display_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(comment.created_at)}
                      </span>
                    </div>
                    
                    {/* Delete menu - only show for comment author */}
                    {user && comment.author.id === user.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu
                          trigger={
                            <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <MoreVertical size={14} />
                            </button>
                          }
                          align="right"
                        >
                          <DropdownMenuItem
                            icon={Trash2}
                            label="Delete Comment"
                            destructive
                            onClick={() => {
                              setCommentToDelete(comment);
                              setDeleteModalOpen(true);
                            }}
                          />
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  <PostTextWithEmojis 
                    text={comment.text}
                    className="text-sm text-card-foreground"
                  />
                  {/* Comment media */}
                  {comment.media && comment.media.length > 0 && (
                    <div className="mt-2">
                      <img 
                        src={comment.media[0].url}
                        alt=""
                        className="max-h-48 rounded-lg border border-border"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
                
                {/* Reply button */}
                {user && (
                  <button
                    type="button"
                    onClick={() => handleReplyClick(comment)}
                    className="flex items-center gap-1 mt-1 ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`reply-btn-${comment.id}`}
                  >
                    <Reply size={12} />
                    <span>Reply</span>
                  </button>
                )}
                
                {/* Nested Replies (1-level) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-2 ml-4 pl-3 border-l-2 border-border space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start space-x-2 group">
                        {/* Reply Author Avatar */}
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 text-xs font-bold flex-shrink-0">
                          {reply.author.display_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        
                        {/* Reply Content */}
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-lg px-3 py-2 relative">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-semibold text-foreground">
                                {reply.author.display_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(reply.created_at)}
                              </span>
                            </div>
                            <PostTextWithEmojis 
                              text={reply.text}
                              className="text-sm text-card-foreground"
                            />
                            {/* Reply media */}
                            {reply.media && reply.media.length > 0 && (
                              <div className="mt-2">
                                <img 
                                  src={reply.media[0].url}
                                  alt=""
                                  className="max-h-32 rounded-lg border border-border"
                                  loading="lazy"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-t-lg border border-b-0 border-border">
          <span className="text-xs text-muted-foreground">
            Replying to <span className="font-medium text-foreground">{replyingTo.authorName}</span>
          </span>
          <button
            type="button"
            onClick={handleCancelReply}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className={`flex items-start space-x-2 ${replyingTo ? 'rounded-t-none' : ''}`}>
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
            
            {/* Image upload button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingMedia || commentMedia.length > 0}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              title="Add image"
            >
              {isUploadingMedia ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <ImageIcon size={16} />
              )}
            </button>
            
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
                      // Get the unicode character from the emoji object
                      // Priority: emoji.char (native unicode), then fallback options
                      let emojiContent = emoji.char || emoji.native || emoji.emoji || '';
                      
                      // Apply skin tone if supported
                      if (emojiContent && emoji.supportsSkinTone) {
                        const userSkinTone = user?.emoji_identity?.skinTone || 'tone4';
                        emojiContent = applySkinTone(emojiContent, userSkinTone, true);
                      }
                      
                      // Append emoji to comment text
                      if (emojiContent) {
                        setCommentText(commentText + emojiContent);
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
              disabled={(!commentText.trim() && commentMedia.length === 0) || isSubmitting}
              className="p-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          
          {/* Comment media preview */}
          {commentMedia.length > 0 && (
            <div className="mt-2 relative inline-block">
              <img 
                src={commentMedia[0].url} 
                alt="Upload preview" 
                className="max-h-24 rounded-lg border border-border"
              />
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          {error && (
            <p className="text-red-400 text-xs mt-1">{error}</p>
          )}
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setCommentToDelete(null);
        }}
        onConfirm={handleDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        isLoading={isDeleting}
      />
    </div>
  );
};

export default SocialCommentSection;
