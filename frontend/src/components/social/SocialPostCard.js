import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, MoreHorizontal, Trash2, Flag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SocialCommentSection from './SocialCommentSection';
import ReportPostModal from './ReportPostModal';
import { ProfileAvatar } from './ProfileAvatar';
import HighFiveButton from '../emoji/HighFiveButton';
import PostTextWithEmojis from './PostTextWithEmojis';
import DropdownMenu, { DropdownMenuItem } from '../common/DropdownMenu';
import ConfirmModal from '../common/ConfirmModal';

/**
 * SocialPostCard - Phase 8.3 + Phase 3.3 (Delete functionality)
 * Component for displaying a single social post with engagement actions
 * 
 * @param {boolean} compact - When true, hides author header (for profile pages)
 */
const SocialPostCard = ({ post, onUpdate, onDelete, compact = false }) => {
  const { user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${localPost.id}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
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

  const handleHighFive = async (postId, isHighFiving) => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${postId}/highfive`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle high five');
      }

      const result = await response.json();
      
      // Update local state
      const updatedPost = {
        ...localPost,
        viewer_has_highfived: result.highfived,
        highfive_count: result.highfive_count
      };
      
      setLocalPost(updatedPost);
      
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (err) {
      console.error('Error toggling high five:', err);
      throw err; // Re-throw for HighFiveButton to handle rollback
    }
  };

  const isAuthor = user?.id === localPost.author.id;

  // Determine profile path (handle or ID fallback)
  const profilePath = localPost.author.handle 
    ? `/portal/social/u/${localPost.author.handle}`
    : `/portal/social/id/${localPost.author.id}`;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Post Header */}
      <div className="p-4">
        {!compact && (
          <div className="flex items-start justify-between mb-3">
            <Link 
              to={profilePath}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity flex-1"
            >
              {/* Author Avatar */}
              <ProfileAvatar 
                name={localPost.author.display_name}
                avatarUrl={localPost.author.avatar_url}
                size="md"
              />
              
              {/* Author Info */}
              <div>
                <p className="text-sm font-semibold text-card-foreground">
                  {localPost.author.display_name}
                </p>
                {localPost.author.handle && (
                  <p className="text-xs text-amber-500">
                    @{localPost.author.handle}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(localPost.created_at)}
                </p>
              </div>
            </Link>

            {/* More Options */}
            <div className="flex items-center space-x-1">
              {/* Report button for non-authors */}
              {!isAuthor && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-red-400 transition-colors"
                  title="Report post"
                >
                  <Flag size={16} />
                </button>
              )}
              
              {/* More options for authors */}
              {isAuthor && (
                <button
                  type="button"
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  title="Options"
                >
                  <MoreHorizontal size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Compact mode: Just show timestamp and options */}
        {compact && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">
              {formatTimestamp(localPost.created_at)}
            </p>
            
            {/* More Options */}
            <div className="flex items-center space-x-1">
              {/* Report button for non-authors */}
              {!isAuthor && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-red-400 transition-colors"
                  title="Report post"
                >
                  <Flag size={16} />
                </button>
              )}
              
              {/* More options for authors */}
              {isAuthor && (
                <button
                  type="button"
                  className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  title="Options"
                >
                  <MoreHorizontal size={18} />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Post Content */}
        <PostTextWithEmojis 
          text={localPost.text}
          className="text-card-foreground text-sm leading-relaxed whitespace-pre-wrap"
        />

        {/* Media Grid (Phase 8.1) */}
        {localPost.media && localPost.media.length > 0 && (
          <div className={`mt-3 grid gap-1 rounded-lg overflow-hidden ${
            localPost.media.length === 1 ? 'grid-cols-1' :
            localPost.media.length === 2 ? 'grid-cols-2' :
            localPost.media.length === 3 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {localPost.media.map((item, index) => (
              <div 
                key={index} 
                className={`relative ${
                  localPost.media.length === 3 && index === 0 ? 'col-span-2' : ''
                }`}
              >
                {item.type === 'image' ? (
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                    alt={`Post media ${index + 1}`}
                    className="w-full h-full object-cover aspect-video"
                  />
                ) : (
                  <video
                    src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                    controls
                    className="w-full h-full object-cover aspect-video"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Link Preview (Phase 8.1) */}
        {localPost.link_meta && (
          <a
            href={localPost.link_meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block border border-border rounded-lg overflow-hidden hover:border-yellow-500 transition-colors"
          >
            {localPost.link_meta.image && (
              <div className="w-full aspect-[2/1] bg-muted">
                <img
                  src={localPost.link_meta.image}
                  alt={localPost.link_meta.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3 bg-muted">
              <p className="text-xs text-muted-foreground mb-1">{localPost.link_meta.site}</p>
              <p className="text-sm font-semibold text-card-foreground mb-1 line-clamp-2">
                {localPost.link_meta.title}
              </p>
              {localPost.link_meta.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {localPost.link_meta.description}
                </p>
              )}
            </div>
          </a>
        )}

        {/* Legacy media_url support (Phase 8.0 backwards compatibility) */}
        {!localPost.media && localPost.media_url && (
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
      <div className="px-4 py-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-3">
          <span>{localPost.like_count} {localPost.like_count === 1 ? 'like' : 'likes'}</span>
          <span>{localPost.highfive_count || 0} {localPost.highfive_count === 1 ? 'high five' : 'high fives'}</span>
        </div>
        <span>{localPost.comment_count} {localPost.comment_count === 1 ? 'comment' : 'comments'}</span>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-border flex items-center space-x-2">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleLike}
          disabled={isLiking}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg transition-all ${
            localPost.viewer_has_liked
              ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
              : 'text-muted-foreground hover:bg-muted'
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

        {/* High Five Button */}
        <div className="flex-1 flex items-center justify-center">
          <HighFiveButton
            postId={localPost.id}
            hasHighFived={localPost.viewer_has_highfived || false}
            highFiveCount={localPost.highfive_count || 0}
            userTier={user?.subscription_tier || 'free'}
            onHighFive={handleHighFive}
            size={24}
            showCount={false}
          />
        </div>

        {/* Comment Button */}
        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-muted-foreground hover:bg-muted transition-all"
        >
          <MessageCircle size={18} />
          <span className="text-sm font-medium">Comment</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-border">
          <SocialCommentSection
            postId={localPost.id}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}

      {/* Report Modal (Phase 8.3.1) */}
      {showReportModal && (
        <ReportPostModal
          postId={localPost.id}
          onClose={() => setShowReportModal(false)}
          onReported={() => {
            setShowReportModal(false);
            // Optionally show a toast notification here
          }}
        />
      )}
    </div>
  );
};

export default SocialPostCard;
