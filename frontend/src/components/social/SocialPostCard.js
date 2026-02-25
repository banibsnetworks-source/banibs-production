import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MoreHorizontal, Trash2, Flag, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SocialCommentSection from './SocialCommentSection';
import ReportPostModal from './ReportPostModal';
import { ProfileAvatar } from './ProfileAvatar';
import PostTextWithEmojis from './PostTextWithEmojis';
import DropdownMenu, { DropdownMenuItem } from '../common/DropdownMenu';
import ConfirmModal from '../common/ConfirmModal';
import { SocialPostMediaGrid } from './SocialPostMediaGrid';
import { ReactionButton, getReactionData } from './ReactionButton';
import ShareButton from './ShareButton';

/**
 * SocialPostCard - Polished UI v2 + Multi-Reaction System v2.0
 * Clean, readable social post with clear visual hierarchy
 * 
 * UI Improvements:
 * - Clear author + timestamp header with better spacing
 * - Improved post body readability (line-height, max-width)
 * - BANIBS Multi-Reaction System (Love, High Five, Peace, Like, Cool)
 * - Clean link/media previews
 * 
 * @param {boolean} compact - When true, hides author header (for profile pages)
 */
const SocialPostCard = ({ post, onUpdate, onDelete, compact = false }) => {
  const { user } = useAuth();
  const [isReacting, setIsReacting] = useState(false);
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

  // Handle reaction (multi-reaction system v2.0)
  const handleReact = async (reactionType) => {
    if (isReacting || !user) return;

    setIsReacting(true);
    
    // Optimistic update
    const wasReacted = localPost.viewer_reaction_type === reactionType;
    const optimisticPost = {
      ...localPost,
      viewer_reaction_type: wasReacted ? null : reactionType,
      viewer_has_liked: !wasReacted,
      like_count: wasReacted ? Math.max(0, localPost.like_count - 1) : localPost.like_count + (localPost.viewer_has_liked ? 0 : 1)
    };
    setLocalPost(optimisticPost);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${localPost.id}/react`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type: reactionType }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle reaction');
      }

      const result = await response.json();
      
      const updatedPost = {
        ...localPost,
        viewer_reaction_type: result.viewer_reaction_type,
        viewer_has_liked: result.liked,
        like_count: result.like_count,
        reactions_by_type: result.reactions_by_type
      };
      
      setLocalPost(updatedPost);
      
      if (onUpdate) {
        onUpdate(updatedPost);
      }
    } catch (err) {
      console.error('Error toggling reaction:', err);
      // Revert optimistic update on error
      setLocalPost(localPost);
    } finally {
      setIsReacting(false);
    }
  };

  // Legacy handleLike for backwards compatibility
  const handleLike = async () => {
    await handleReact('love');
  };

  const handleCommentAdded = (comment) => {
    const updatedPost = {
      ...localPost,
      comment_count: localPost.comment_count + 1
    };
    
    setLocalPost(updatedPost);
    
    if (onUpdate) {
      onUpdate(updatedPost);
    }
  };

  const handleDeletePost = async () => {
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/posts/${localPost.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }

      if (onDelete) {
        onDelete(localPost.id);
      }
      
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isAuthor = user?.id === localPost.author.id;

  const profilePath = localPost.author.handle 
    ? `/portal/social/u/${localPost.author.handle}`
    : `/portal/social/id/${localPost.author.id}`;

  return (
    <article 
      className="bg-card rounded-xl border border-border transition-shadow hover:shadow-sm"
      data-testid={`post-card-${localPost.id}`}
    >
      {/* ===== Post Header ===== */}
      <header className="px-4 pt-4 pb-3">
        {!compact && (
          <div className="flex items-start gap-3">
            {/* Author Avatar */}
            <Link to={profilePath} className="flex-shrink-0">
              <ProfileAvatar 
                name={localPost.author.display_name}
                avatarUrl={localPost.author.avatar_url}
                size="md"
              />
            </Link>
            
            {/* Author Info + Timestamp */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link 
                  to={profilePath}
                  className="font-semibold text-card-foreground hover:underline truncate"
                >
                  {localPost.author.display_name}
                </Link>
                {localPost.author.handle && (
                  <span className="text-sm text-amber-500 truncate">
                    @{localPost.author.handle}
                  </span>
                )}
              </div>
              <time className="text-xs text-muted-foreground mt-0.5 block">
                {formatTimestamp(localPost.created_at)}
              </time>
            </div>

            {/* Options Menu */}
            <div className="flex-shrink-0 flex items-center gap-1">
              {!isAuthor && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-red-400 transition-colors"
                  title="Report post"
                  aria-label="Report post"
                >
                  <Flag size={16} />
                </button>
              )}
              
              {isAuthor && (
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  }
                >
                  <DropdownMenuItem
                    icon={Trash2}
                    label="Delete post"
                    destructive
                    onClick={() => setShowDeleteModal(true)}
                  />
                </DropdownMenu>
              )}
            </div>
          </div>
        )}

        {/* Compact mode header */}
        {compact && (
          <div className="flex items-center justify-between">
            <time className="text-xs text-muted-foreground">
              {formatTimestamp(localPost.created_at)}
            </time>
            
            <div className="flex items-center gap-1">
              {!isAuthor && (
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-red-400 transition-colors"
                  title="Report post"
                >
                  <Flag size={16} />
                </button>
              )}
              
              {isAuthor && (
                <DropdownMenu
                  trigger={
                    <button
                      type="button"
                      className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
                      title="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  }
                >
                  <DropdownMenuItem
                    icon={Trash2}
                    label="Delete post"
                    destructive
                    onClick={() => setShowDeleteModal(true)}
                  />
                </DropdownMenu>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===== Post Body ===== */}
      <div className="px-4 pb-3">
        {/* Post Text - improved readability */}
        {localPost.text && (
          <div className="max-w-prose">
            <PostTextWithEmojis 
              text={localPost.text}
              className="text-card-foreground text-[15px] leading-[1.6] whitespace-pre-wrap break-words"
            />
          </div>
        )}

        {/* Media Grid */}
        {localPost.media_urls && localPost.media_urls.length > 0 && (
          <div className="mt-3">
            <SocialPostMediaGrid mediaUrls={localPost.media_urls} />
          </div>
        )}

        {/* Link Preview */}
        {localPost.link_meta && (
          <a
            href={localPost.link_meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block border border-border rounded-lg overflow-hidden hover:border-amber-500/50 transition-colors"
          >
            {localPost.link_meta.image && (
              <div className="aspect-[2/1] bg-muted overflow-hidden">
                <img
                  src={localPost.link_meta.image}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-3 bg-muted/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {localPost.link_meta.site}
              </p>
              <p className="text-sm font-medium text-card-foreground line-clamp-2">
                {localPost.link_meta.title}
              </p>
              {localPost.link_meta.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {localPost.link_meta.description}
                </p>
              )}
            </div>
          </a>
        )}

        {/* Plain URL fallback */}
        {!localPost.link_meta && localPost.link_url && (
          <a
            href={localPost.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm text-blue-500 hover:text-blue-400 hover:underline break-all"
          >
            {localPost.link_url}
          </a>
        )}

        {/* Legacy media_url support - PORTRAIT-SAFE DISPLAY (Image or Video) */}
        {!localPost.media_urls?.length && localPost.media_url && (() => {
          const url = localPost.media_url;
          const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)(\?|$)/);
          
          return (
            <div 
              className="mt-3 rounded-xl overflow-hidden"
              style={{ 
                display: 'block',
                width: '100%',
                aspectRatio: '4 / 5',
                backgroundColor: '#0b0b0b',
              }}
              ref={(el) => {
                if (el) {
                  const media = el.querySelector('img, video');
                  if (media) {
                    media.onerror = () => { el.style.display = 'none'; };
                  }
                }
              }}
            >
              {isVideo ? (
                <video
                  src={url}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    background: '#000',
                  }}
                  controls
                  playsInline
                  preload="metadata"
                  onError={(e) => { 
                    e.target.parentElement.style.display = 'none'; 
                  }}
                />
              ) : (
                <img
                  src={url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                  loading="lazy"
                  onError={(e) => { 
                    e.target.parentElement.style.display = 'none'; 
                  }}
                />
              )}
            </div>
          );
        })()}
      </div>

      {/* ===== Engagement Stats ===== */}
      <div className="px-4 py-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            {localPost.like_count > 0 && (
              <span className="flex items-center gap-1">
                {localPost.viewer_reaction_type && (
                  <span>{getReactionData(localPost.viewer_reaction_type).emoji}</span>
                )}
                {localPost.like_count} {localPost.like_count === 1 ? 'reaction' : 'reactions'}
              </span>
            )}
          </div>
          {localPost.comment_count > 0 && (
            <span>{localPost.comment_count} {localPost.comment_count === 1 ? 'comment' : 'comments'}</span>
          )}
        </div>
      </div>

      {/* ===== Action Bar (Multi-Reaction System v2.0) ===== */}
      <div className="px-2 py-1 border-t border-border/50">
        <div className="flex items-center">
          {/* React Button (BANIBS Multi-Reaction) */}
          <div className="flex-1 flex items-center justify-center">
            <ReactionButton
              postId={localPost.id}
              viewerReaction={localPost.viewer_reaction_type}
              reactionCount={localPost.like_count}
              onReact={handleReact}
              disabled={isReacting || !user}
              showCount={false}
            />
          </div>

          {/* Comment Button */}
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
              showComments
                ? 'text-amber-500 hover:bg-amber-500/10'
                : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
            }`}
            aria-label="Comment"
            aria-expanded={showComments}
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Comment</span>
          </button>

          {/* Share Button (Platform-Neutral NEO v1) */}
          <ShareButton
            contentType="post"
            contentId={localPost.id}
            contentTitle={localPost.text?.substring(0, 50) || `Post by ${localPost.author.display_name}`}
            className="flex-1"
          />
        </div>
      </div>

      {/* ===== Comments Section ===== */}
      {showComments && (
        <div className="border-t border-border">
          <SocialCommentSection
            postId={localPost.id}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}

      {/* ===== Modals ===== */}
      {showReportModal && (
        <ReportPostModal
          postId={localPost.id}
          onClose={() => setShowReportModal(false)}
          onReported={() => {
            setShowReportModal(false);
          }}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeletePost}
          title="Delete Post"
          message="Are you sure you want to delete this post? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          isLoading={isDeleting}
        />
      )}
    </article>
  );
};

export default SocialPostCard;
