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
    <>
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

        {/* Quick Composer - Opens Modal */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-gray-900 text-left text-gray-500 rounded-lg px-4 py-3 text-sm border border-gray-700 hover:border-yellow-500 focus:border-yellow-500 focus:outline-none transition-all"
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
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors text-sm"
          >
            <ImageIcon size={18} />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors text-sm"
          >
            <Video size={18} />
            <span>Video</span>
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors text-sm"
          >
            <Link2 size={18} />
            <span>Link</span>
          </button>
        </div>
      </div>

      {/* Media Composer Modal */}
      <MediaComposerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default SocialPostComposer;
