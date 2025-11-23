import React from 'react';
import { BookHeart, ArrowRight, MapPin } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

/**
 * DiasporaStoryCard - Phase 12.0
 * Card component for displaying diaspora stories
 */
const DiasporaStoryCard = ({ story, onClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const author = story.anonymous ? 'Anonymous' : story.author_name || 'Community Member';
  const timeAgo = story.created_at 
    ? formatDistanceToNow(new Date(story.created_at), { addSuffix: true })
    : '';
  
  return (
    <div
      onClick={onClick}
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
      style={{
        background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
        border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
      }}
    >
      {/* Journey indicator */}
      {(story.origin_region_name || story.current_region_name) && (
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <MapPin size={12} className="text-amber-600" />
          {story.origin_region_name && (
            <span>From {story.origin_region_name}</span>
          )}
          {story.origin_region_name && story.current_region_name && (
            <ArrowRight size={12} />
          )}
          {story.current_region_name && (
            <span>In {story.current_region_name}</span>
          )}
        </div>
      )}
      
      {/* Story title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {story.title}
      </h3>
      
      {/* Story excerpt */}
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {story.content}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <BookHeart size={14} className="text-amber-600" />
          <span>{author}</span>
        </div>
        {timeAgo && <span>{timeAgo}</span>}
      </div>
    </div>
  );
};

export default DiasporaStoryCard;
