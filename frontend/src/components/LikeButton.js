import React, { useState } from 'react';
import { reactionsAPI } from '../services/api';

const LikeButton = ({ opportunityId, initialCount = 0 }) => {
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await reactionsAPI.toggleLike(opportunityId);
      
      // Update count from response
      setLikeCount(response.data.like_count);
      
      // Toggle liked state
      setLiked(response.data.action === 'added');
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        liked
          ? 'bg-[#FFD700] text-black'
          : 'bg-[#1a1a1a] border border-[#FFD700]/30 text-[#FFD700]'
      } hover:bg-[#FFD700] hover:text-black disabled:opacity-50`}
    >
      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
      <span className="font-bold">{likeCount}</span>
    </button>
  );
};

export default LikeButton;
