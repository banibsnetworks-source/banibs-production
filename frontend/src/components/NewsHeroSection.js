import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import SentimentBadge from './SentimentBadge';
import { useTheme } from '../contexts/ThemeContext';

/**
 * News Hero Section
 * Large featured story at the top of the homepage
 * Prominent image, headline, summary, and CTA
 * Theme-aware design
 */
const NewsHeroSection = ({ story }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!story) {
    return (
      <div className="bg-card rounded-lg p-8 text-center border border-border">
        <p className="text-muted-foreground">No featured story available</p>
      </div>
    );
  }

  const handleClick = () => {
    if (story.sourceUrl) {
      window.open(story.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffHours < 48) return 'Yesterday';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-xl border transition-all duration-300 group hover:border-yellow-500/30"
      style={{
        backgroundColor: isDark ? 'rgb(17, 24, 39)' : 'rgb(255, 255, 255)',
        borderColor: isDark ? 'rgb(31, 41, 55)' : 'rgb(229, 231, 235)'
      }}
    >
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Image Section */}
        <div
          onClick={handleClick}
          className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[400px] bg-muted overflow-hidden cursor-pointer"
        >
          <img
            src={story.imageUrl}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';
            }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 bg-yellow-500 text-gray-900 text-xs font-bold uppercase rounded-md shadow-lg">
              Featured Story
            </span>
          </div>

          {/* Sentiment Badge */}
          {story.sentiment_label && (
            <div className="absolute top-4 right-4">
              <SentimentBadge
                sentiment={story.sentiment_label}
                score={story.sentiment_score}
              />
            </div>
          )}
        </div>

        {/* Content Section - Theme Aware */}
        <div className={`p-8 lg:p-10 flex flex-col justify-center ${
          isDark 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
            : 'bg-gradient-to-br from-gray-50 to-white'
        }`}>
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
              {story.category || 'News'}
            </span>
            {story.sourceName && (
              <span className="text-muted-foreground text-sm font-medium">
                {story.sourceName}
              </span>
            )}
            <div className="flex items-center space-x-1.5 text-muted-foreground text-xs">
              <Clock size={14} />
              <span>{formatDate(story.publishedAt)}</span>
            </div>
          </div>

          {/* Headline */}
          <h1
            onClick={handleClick}
            className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight cursor-pointer hover:text-yellow-500 transition-colors line-clamp-3"
          >
            {story.title}
          </h1>

          {/* Summary */}
          <p className="text-card-foreground text-lg mb-6 line-clamp-4 leading-relaxed">
            {story.summary}
          </p>

          {/* CTA Button */}
          <button
            onClick={handleClick}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl w-fit"
          >
            <span>Read Full Story</span>
            <ExternalLink size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsHeroSection;
