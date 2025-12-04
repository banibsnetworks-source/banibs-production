import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import SentimentBadge from './SentimentBadge';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';

/**
 * Top Stories Grid
 * Displays 4-6 top stories in a 2-column grid below hero
 */
const TopStoriesGrid = ({ stories }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getThemeStyles(isDark);
  
  if (!stories || stories.length === 0) {
    return null;
  }

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

  // Generate fallback placeholder based on category
  const getCategoryFallback = (category) => {
    const categoryColors = {
      'world': 'from-blue-600 to-blue-800',
      'us': 'from-red-600 to-red-800',
      'business': 'from-green-600 to-green-800',
      'tech': 'from-purple-600 to-purple-800',
      'sports': 'from-orange-600 to-orange-800',
      'entertainment': 'from-pink-600 to-pink-800',
      'health': 'from-teal-600 to-teal-800',
      'civil_rights': 'from-indigo-600 to-indigo-800',
    };
    return categoryColors[category?.toLowerCase()] || 'from-gray-600 to-gray-800';
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
              {story.imageUrl && !story.imageUrl.includes('/static/') ? (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Hide broken image and show gradient fallback
                    e.target.style.display = 'none';
                    e.target.parentElement.querySelector('.fallback-gradient').style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Gradient Fallback */}
              <div 
                className={`fallback-gradient absolute inset-0 bg-gradient-to-br ${getCategoryFallback(story.category)} ${story.imageUrl && !story.imageUrl.includes('/static/') ? 'hidden' : 'flex'} items-center justify-center`}
                style={{ display: story.imageUrl && !story.imageUrl.includes('/static/') ? 'none' : 'flex' }}
              >
                <div className="text-center p-6">
                  <div className="text-white/90 text-5xl mb-2">📰</div>
                  <div className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    {story.category || 'News'}
                  </div>
                </div>
              </div>
              
              {/* Category Badge */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold rounded capitalize">
                  {story.mapped_section || story.category || 'News'}
                </span>
              </div>

              {/* Sentiment Badge */}
              {story.sentiment_label && (
                <div className="absolute top-2 right-2">
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
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {story.summary}
              </p>

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
