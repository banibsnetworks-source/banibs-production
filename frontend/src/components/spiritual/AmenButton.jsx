import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * AmenButton - Phase 11.0
 * Button for adding Amen/support to prayer posts
 */
const AmenButton = ({ post, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [isAmening, setIsAmening] = useState(false);
  
  const hasAmened = post.user_has_amened;
  
  const handleAmen = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to show your support');
      return;
    }
    
    setIsAmening(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/prayer/amen`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            post_id: post.id
          })
        }
      );
      
      if (response.ok) {
        const amened = response.data.amened;
        onUpdate(post.id, amened);
      }
    } catch (err) {
      console.error('Error toggling amen:', err);
    } finally {
      setIsAmening(false);
    }
  };
  
  return (
    <button
      onClick={handleAmen}
      disabled={isAmening}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all disabled:opacity-50 ${
        hasAmened 
          ? 'border-purple-500 bg-purple-500/10 text-purple-500' 
          : 'border-border text-muted-foreground hover:border-purple-500 hover:text-purple-500'
      }`}
    >
      <Heart 
        size={16} 
        className={hasAmened ? 'fill-current' : ''}
      />
      <span className="text-sm font-medium">
        {post.amen_count > 0 ? post.amen_count : ''}
        {post.amen_count === 0 ? 'Amen' : post.amen_count === 1 ? 'Amen' : 'Amens'}
      </span>
    </button>
  );
};

export default AmenButton;