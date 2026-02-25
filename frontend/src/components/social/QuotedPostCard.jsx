import React from 'react';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from './ProfileAvatar';

/**
 * QuotedPostCard - Displays embedded quoted post preview
 * Used in both composer (preview) and rendered posts
 */
const QuotedPostCard = ({ quotedPost, onRemove, isPreview = false }) => {
  if (!quotedPost) return null;

  const content = (
    <div 
      className={`border border-border rounded-xl overflow-hidden ${isPreview ? 'bg-muted/30' : 'bg-muted/20'}`}
      data-testid="quoted-post-card"
    >
      <div className="p-3">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-2">
          <ProfileAvatar 
            name={quotedPost.author_name}
            avatarUrl={quotedPost.author_avatar}
            size="xs"
          />
          <span className="text-sm font-medium text-card-foreground truncate">
            {quotedPost.author_name}
          </span>
          {quotedPost.created_at && (
            <span className="text-xs text-muted-foreground">
              · {new Date(quotedPost.created_at).toLocaleDateString()}
            </span>
          )}
          
          {/* Remove button for preview mode */}
          {isPreview && onRemove && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              className="ml-auto p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Remove quoted post"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
        
        {/* Post text preview */}
        {quotedPost.text && (
          <p className="text-sm text-card-foreground/80 line-clamp-3 mb-2">
            {quotedPost.text}
          </p>
        )}
        
        {/* Media thumbnail if present */}
        {quotedPost.media_url && (
          <div className="mt-2 rounded-lg overflow-hidden max-h-32">
            <img 
              src={quotedPost.media_url} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );

  // In non-preview mode, make it clickable to navigate to the original post
  if (!isPreview && quotedPost.id) {
    return (
      <Link 
        to={`/portal/social/post/${quotedPost.id}`}
        className="block hover:opacity-90 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default QuotedPostCard;
