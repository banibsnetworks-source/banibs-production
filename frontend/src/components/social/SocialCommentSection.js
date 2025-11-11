import React, { useState, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * SocialCommentSection - Phase 8.3
 * Displays comments for a post and allows adding new comments
 */
const SocialCommentSection = ({ postId, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    <div className="p-4 bg-gray-900/50">
      {/* Comments List */}
      <div className="space-y-3 mb-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="animate-spin text-gray-500" size={20} />
          </div>
        ) : error ? (
          <p className="text-red-400 text-xs text-center py-2">{error}</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-2">
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
                <div className="bg-gray-800 rounded-lg px-3 py-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-semibold text-white">
                      {comment.author.display_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {comment.text}
                  </p>
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
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength={500}
              disabled={isSubmitting}
              className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
            />
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
