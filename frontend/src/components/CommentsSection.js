import React, { useState, useEffect } from 'react';
import { reactionsAPI } from '../services/api';

const CommentsSection = ({ opportunityId, isAdmin = false }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    body: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [opportunityId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await reactionsAPI.getComments(opportunityId);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.body.trim()) {
      alert('Please enter a comment');
      return;
    }

    setSubmitting(true);
    try {
      await reactionsAPI.postComment(opportunityId, {
        display_name: formData.display_name.trim() || 'Anonymous',
        body: formData.body.trim()
      });
      
      // Clear form
      setFormData({ display_name: '', body: '' });
      setShowForm(false);
      
      // Reload comments
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHideComment = async (commentId) => {
    if (!window.confirm('Hide this comment?')) return;
    
    try {
      await reactionsAPI.hideComment(commentId);
      // Remove from local state
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error hiding comment:', error);
      if (error.response?.status === 403) {
        alert('You don\'t have permission to hide comments');
      } else {
        alert('Failed to hide comment');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">
          Comments ({comments.length})
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all text-sm"
        >
          {showForm ? 'Cancel' : '💬 Add Comment'}
        </button>
      </div>

      {/* Comment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg p-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-[#FFD700] mb-1">
              Your Name (optional)
            </label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              className="w-full px-3 py-2 bg-black border border-[#FFD700]/30 rounded text-white focus:outline-none focus:border-[#FFD700] transition-all text-sm"
              placeholder="Leave blank for Anonymous"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-[#FFD700] mb-1">
              Comment *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              rows={3}
              required
              className="w-full px-3 py-2 bg-black border border-[#FFD700]/30 rounded text-white focus:outline-none focus:border-[#FFD700] transition-all resize-none text-sm"
              placeholder="Share your thoughts..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all disabled:opacity-50 text-sm"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FFD700] border-t-transparent"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-[#1a1a1a] border border-[#FFD700]/20 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-bold text-white">{comment.display_name}</span>
                  <span className="text-xs text-gray-400 ml-2">{formatDate(comment.timestamp)}</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleHideComment(comment.id)}
                    className="px-2 py-1 bg-red-900/50 text-red-300 text-xs rounded hover:bg-red-900 transition-all"
                  >
                    🗑️ Hide
                  </button>
                )}
              </div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
