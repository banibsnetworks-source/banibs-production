import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import SentimentBadge from './SentimentBadge';
import ImageWithFallback from './ImageWithFallback';
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
      <div className="bg-card rounded-lg p-8 text-center border border-border" data-testid="hero-empty-state">
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

  // Generate category-specific gradient fallback
  const getCategoryGradient = () => {
    const category = story.mapped_section || story.category || 'news';
    const gradients = {
      'world': 'from-blue-600 to-blue-900',
      'us': 'from-red-600 to-red-900',
      'business': 'from-green-600 to-green-900',
      'moneywatch': 'from-emerald-600 to-emerald-900',
      'tech': 'from-purple-600 to-purple-900',
      'sports': 'from-orange-600 to-orange-900',
      'entertainment': 'from-pink-600 to-pink-900',
      'health': 'from-teal-600 to-teal-900',
      'crime': 'from-slate-700 to-slate-900',
      'politics': 'from-indigo-600 to-indigo-900',
      'civil_rights': 'from-amber-600 to-amber-900',
      'culture': 'from-rose-600 to-rose-900',
      'black': 'from-yellow-600 to-yellow-900',
      'global_diaspora': 'from-cyan-600 to-cyan-900',
    };
    return gradients[category?.toLowerCase()] || 'from-gray-700 to-gray-900';
  };

  const getCategoryIcon = () => {
    const category = story.mapped_section || story.category || 'news';
    const icons = {
      'world': '🌍',
      'us': '🇺🇸',
      'business': '💼',
      'moneywatch': '💰',
      'tech': '🔬',
      'sports': '⚽',
      'entertainment': '🎬',
      'health': '🏥',
      'crime': '🚨',
      'politics': '🏛️',
      'civil_rights': '✊',
      'culture': '🎭',
      'black': '💜',
      'global_diaspora': '🌐',
    };
    return icons[category?.toLowerCase()] || '📰';
  };

  // Check if image URL is valid (not a static fallback path)
  const hasValidImage = story.imageUrl && !story.imageUrl.includes('/static/');

  return (
    <div className="rounded-xl overflow-hidden shadow-xl border border-border bg-card transition-all duration-300 group hover:border-yellow-500/30" data-testid="news-hero-section">
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Image Section */}
        <div
          onClick={handleClick}
          className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[400px] bg-muted overflow-hidden cursor-pointer"
          data-testid="hero-image-container"
        >
          {hasValidImage ? (
            <img
              src={story.imageUrl}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Hide image and show gradient fallback
                e.target.style.display = 'none';
                const fallback = e.target.parentElement.querySelector('.hero-fallback-gradient');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Category-specific Gradient Fallback */}
          <div 
            className={`hero-fallback-gradient absolute inset-0 bg-gradient-to-br ${getCategoryGradient()} flex items-center justify-center`}
            style={{ display: hasValidImage ? 'none' : 'flex' }}
            data-testid="hero-fallback-gradient"
          >
            <div className="text-center p-8">
              <div className="text-white/90 text-7xl mb-4">{getCategoryIcon()}</div>
              <div className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                {story.mapped_section || story.category || 'Featured News'}
              </div>
            </div>
          </div>
          
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
        <div className="p-8 lg:p-10 flex flex-col justify-center bg-card">
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
