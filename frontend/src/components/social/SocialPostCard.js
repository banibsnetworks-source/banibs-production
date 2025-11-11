import React, { useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SocialCommentSection from './SocialCommentSection';

/**
 * SocialPostCard - Phase 8.3
 * Component for displaying a single social post with engagement actions
 */
const SocialPostCard = ({ post, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [localPost, setLocalPost] = useState(post);

  const formatTimestamp = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return '';
    }
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${localPost.id}/like`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      const result = await response.json();
      
      // Update local state
      const updatedPost = {
        ...localPost,
        viewer_has_liked: result.liked,
        like_count: result.like_count
      };
      
      setLocalPost(updatedPost);
      
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCommentAdded = (comment) => {
    // Update comment count
    const updatedPost = {
      ...localPost,
      comment_count: localPost.comment_count + 1
    };
    
    setLocalPost(updatedPost);
    
    if (onUpdate) {
      onUpdate(updatedPost);
    }
  };

  const isAuthor = user?.id === localPost.author.id;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Author Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {localPost.author.display_name.charAt(0).toUpperCase()}
            </div>
            
            {/* Author Info */}
            <div>
              <p className="text-sm font-semibold text-white">
                {localPost.author.display_name}
              </p>
              <p className="text-xs text-gray-400">
                {formatTimestamp(localPost.created_at)}
              </p>
            </div>
          </div>

          {/* More Options */}
          {isAuthor && (
            <button
              type="button"
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
              title="Options"
            >
              <MoreHorizontal size={18} />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
          {localPost.text}
        </div>

        {/* Media (if present) */}
        {localPost.media_url && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img
              src={localPost.media_url}
              alt="Post media"
              className="w-full h-auto"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <span>{localPost.like_count} {localPost.like_count === 1 ? 'like' : 'likes'}</span>
        <span>{localPost.comment_count} {localPost.comment_count === 1 ? 'comment' : 'comments'}</span>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-700 flex items-center space-x-2">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
            localPost.viewer_has_liked
              ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
              : 'text-gray-400 hover:bg-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Heart
            size={18}
            fill={localPost.viewer_has_liked ? 'currentColor' : 'none'}
          />
          <span className="text-sm font-medium">
            {localPost.viewer_has_liked ? 'Liked' : 'Like'}
          </span>
        </button>

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-all"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">Comment</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-700">
          <SocialCommentSection
            postId={localPost.id}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
};

export default SocialPostCard;
