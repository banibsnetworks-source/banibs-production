import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import SentimentBadge from './SentimentBadge';
import ImageWithFallback from './ImageWithFallback';
import SafeHtmlRenderer from './SafeHtmlRenderer';

/**
 * News Section Block
 * Reusable component for section-specific news (US, World, Business, etc.)
 * Displays 3-5 stories in a list format
 */
const NewsSectionBlock = ({ title, stories, icon }) => {
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
      if (diffHours < 48) return 'Yesterday';
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

  // Featured item (first one, larger)
  const featuredItem = stories[0];
  // List items (remaining)
  const listItems = stories.slice(1, 5);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Section Header */}
      <div className="bg-muted px-6 py-4 border-b border-border">
        <h2 className="text-xl font-bold text-card-foreground flex items-center space-x-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <span>{title}</span>
        </h2>
      </div>

      <div className="p-6">
        {/* Featured Item */}
        <div
          onClick={() => handleClick(featuredItem.sourceUrl)}
          className="mb-6 pb-6 border-b border-border cursor-pointer group"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Thumbnail */}
            <div className="sm:col-span-1 relative aspect-video sm:aspect-square bg-muted rounded-lg overflow-hidden">
              <ImageWithFallback
                src={featuredItem.imageUrl || featuredItem.image_url}
                alt={featuredItem.title}
                itemId={featuredItem.id || featuredItem.sourceUrl || featuredItem.title}
                category={featuredItem.mapped_section || featuredItem.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {featuredItem.sentiment_label && (
                <div className="absolute top-2 right-2 z-10">
                  <SentimentBadge
                    sentiment={featuredItem.sentiment_label}
                    score={featuredItem.sentiment_score}
                    compact
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-2 mb-2 text-xs text-muted-foreground">
                {featuredItem.sourceName && (
                  <span className="font-medium">{featuredItem.sourceName}</span>
                )}
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatDate(featuredItem.publishedAt)}</span>
                </div>
              </div>

              <h3 className="text-card-foreground font-bold text-lg mb-2 line-clamp-3 group-hover:text-yellow-500 transition-colors">
                {featuredItem.title}
              </h3>

              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {featuredItem.summary}
              </p>

              <div className="flex items-center space-x-1 text-yellow-500 text-sm font-semibold">
                <span>Read more</span>
                <ExternalLink size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* List Items */}
        <div className="space-y-4">
          {listItems.map((story) => (
            <div
              key={story.id}
              onClick={() => handleClick(story.sourceUrl)}
              className="flex space-x-3 cursor-pointer group"
            >
              {/* Small Thumbnail */}
              <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
                <ImageWithFallback
                  src={story.imageUrl || story.image_url}
                  alt={story.title}
                  itemId={story.id || story.sourceUrl || story.title}
                  category={story.mapped_section || story.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1 text-xs text-muted-foreground">
                  {story.sourceName && (
                    <>
                      <span className="font-medium">{story.sourceName}</span>
                      <span>•</span>
                    </>
                  )}
                  <Clock size={12} />
                  <span>{formatDate(story.publishedAt)}</span>
                </div>
                <h4 className="text-card-foreground font-semibold text-sm mb-1 line-clamp-2 group-hover:text-yellow-500 transition-colors">
                  {story.title}
                </h4>
                {story.sentiment_label && (
                  <SentimentBadge
                    sentiment={story.sentiment_label}
                    score={story.sentiment_score}
                    compact
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsSectionBlock;
