import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import SentimentBadge from './SentimentBadge';
import ImageWithFallback from './ImageWithFallback';
import SafeHtmlRenderer from './SafeHtmlRenderer';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

// Black Focus Type Labels for display
const BLACK_FOCUS_LABELS = {
  'africa': 'Africa',
  'caribbean': 'Caribbean',
  'black_us': 'Black U.S.',
  'diaspora': 'Diaspora',
  'hbcu': 'HBCU',
  'civil_rights': 'Civil Rights',
  'culture': 'Culture',
  'business': 'Black Business',
};

/**
 * Top Stories Grid
 * Displays 4-6 top stories in a 2-column grid below hero
 * 
 * Props:
 *   stories: Array of story objects
 *   showBlackFocusType: If true, show black_focus_type badge instead of category (for Black News page)
 */
const TopStoriesGrid = ({ stories, showBlackFocusType = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getThemeStyles(isDark);
  
  if (!stories || stories.length === 0) {
    return null;
  }

  // Get display label for badge
  const getBadgeLabel = (story) => {
    if (showBlackFocusType && story.black_focus_type) {
      return BLACK_FOCUS_LABELS[story.black_focus_type] || story.black_focus_type;
    }
    return story.mapped_section || story.category || 'News';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const handleClick = (sourceUrl) => {
    if (sourceUrl) {
      window.open(sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Top Stories</h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500 to-transparent ml-4 rounded-full"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {stories.slice(0, 6).map((story) => (
          <div
            key={story.id}
            onClick={() => handleClick(story.sourceUrl)}
            className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group hover:border-yellow-500/50"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-muted">
              <ImageWithFallback
                src={story.imageUrl || story.image_url}
                alt={story.title}
                itemId={story.id || story.sourceUrl || story.title}
                category={story.mapped_section || story.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Category Badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded capitalize">
                  {getBadgeLabel(story)}
                </span>
              </div>

              {/* Sentiment Badge */}
              {story.sentiment_label && (
                <div className="absolute top-2 right-2 z-10">
                  <SentimentBadge
                    sentiment={story.sentiment_label}
                    score={story.sentiment_score}
                    compact
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Meta */}
              <div className="flex items-center space-x-2 mb-2 text-xs text-muted-foreground">
                {story.sourceName && (
                  <span className="font-medium">{story.sourceName}</span>
                )}
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatDate(story.publishedAt)}</span>
                </div>
              </div>

              {/* Headline */}
              <h3 className="text-card-foreground font-bold text-lg mb-2 line-clamp-3 group-hover:text-yellow-500 transition-colors leading-tight">
                {story.title}
              </h3>

              {/* Summary */}
              <SafeHtmlRenderer
                html={story.summary || story.description}
                className="text-muted-foreground text-sm line-clamp-2 mb-3"
                as="div"
              />

              {/* Read More Link */}
              <div className="flex items-center space-x-1 text-yellow-500 text-sm font-semibold group-hover:text-yellow-400 transition-colors">
                <span>Read more</span>
                <ExternalLink size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStoriesGrid;
