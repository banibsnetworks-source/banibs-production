import React, { useState } from 'react';
import { Trash2, User } from 'lucide-react';
import AmenButton from './AmenButton';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * PrayerPostCard - Phase 11.0
 * Card component for displaying prayer posts
 */
const PrayerPostCard = ({ post, currentUserId, onAmenUpdate, onPostDeleted }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [deleting, setDeleting] = useState(false);
  
  const isOwnPost = currentUserId && post.user_id === currentUserId;
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this prayer?')) {
      return;
    }
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/prayer/post/${post.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        onPostDeleted(post.id);
      } else {
        alert('Failed to delete prayer');
      }
    } catch (err) {
      console.error('Error deleting prayer:', err);
      alert('Failed to delete prayer');
    } finally {
      setDeleting(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div 
      className="p-6 rounded-lg border bg-card"
      style={{
        borderColor: isDark ? 'rgba(229, 231, 235, 0.1)' : '#E5E7EB'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.anonymous ? (
            <>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'
                }}
              >
                <User size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="font-medium text-foreground">Anonymous</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </p>
              </div>
            </>
          ) : (
            <>
              {post.author_avatar ? (
                <img 
                  src={post.author_avatar} 
                  alt={post.author_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white"
                  style={{ background: '#8B5CF6' }}
                >
                  {post.author_name?.charAt(0) || 'U'}
                </div>
              )}
              <div>
                <p className="font-medium text-foreground">{post.author_name || 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </p>
              </div>
            </>
          )}
        </div>
        
        {isOwnPost && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
            title="Delete prayer"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      {/* Content */}
      <p className="text-foreground whitespace-pre-wrap mb-4">
        {post.content}
      </p>
      
      {/* Actions */}
      <div className="flex items-center gap-4">
        <AmenButton
          post={post}
          onUpdate={onAmenUpdate}
        />
      </div>
    </div>
  );
};

export default PrayerPostCard;