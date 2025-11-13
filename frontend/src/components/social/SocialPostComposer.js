import React, { useState } from 'react';
import { Send, Image as ImageIcon, Video, Link2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import MediaComposerModal from './MediaComposerModal';

/**
 * SocialPostComposer - Phase 8.1 (Updated for Media Composer)
 * Component for creating new social posts with media support
 */
const SocialPostComposer = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (postData) => {
    setError(null);
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/social/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create post');
      }
      
      const newPost = await response.json();
      
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
      throw err;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 font-bold">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        
        {/* User Info */}
        <div>
          <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-400">Share with the BANIBS community</p>
        </div>
      </div>

      {/* Composer Form */}
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={maxChars}
          disabled={isSubmitting}
          className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 text-sm placeholder-gray-500 border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all resize-none"
          rows={3}
        />

        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            {/* Media upload placeholder */}
            <button
              type="button"
              disabled
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Image upload (coming soon)"
            >
              <ImageIcon size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Character count */}
            <span className={`text-xs ${
              remaining < 50 ? 'text-red-400' : 'text-gray-500'
            }`}>
              {remaining}
            </span>

            {/* Submit button */}
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="text-sm">Posting...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span className="text-sm">Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SocialPostComposer;
