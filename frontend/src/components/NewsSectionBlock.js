import React from 'react';
import { ExternalLink, Clock } from 'lucide-react';
import SentimentBadge from './SentimentBadge';

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
    <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          {icon && <span className="text-2xl">{icon}</span>}
          <span>{title}</span>
        </h2>
      </div>

      <div className="p-6">
        {/* Featured Item */}
        <div
          onClick={() => handleClick(featuredItem.sourceUrl)}
          className="mb-6 pb-6 border-b border-gray-800 cursor-pointer group"
        >
          <div className="grid sm:grid-cols-3 gap-4">
            {/* Thumbnail */}
            <div className="sm:col-span-1 relative aspect-video sm:aspect-square bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={featuredItem.imageUrl}
                alt={featuredItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80';
                }}
              />
              {featuredItem.sentiment_label && (
                <div className="absolute top-2 right-2">
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
              <div className="flex items-center space-x-2 mb-2 text-xs text-gray-400">
                {featuredItem.sourceName && (
                  <span className="font-medium">{featuredItem.sourceName}</span>
                )}
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{formatDate(featuredItem.publishedAt)}</span>
                </div>
              </div>

              <h3 className="text-white font-bold text-lg mb-2 line-clamp-3 group-hover:text-yellow-400 transition-colors">
                {featuredItem.title}
              </h3>

              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {featuredItem.summary}
              </p>

              <div className="flex items-center space-x-1 text-yellow-400 text-sm font-semibold">
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
              <div className="relative w-24 h-24 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&q=80';
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <span>{formatDate(story.publishedAt)}</span>
                </div>
                <h4 className="text-white font-semibold text-sm mb-1 line-clamp-2 group-hover:text-yellow-400 transition-colors">
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
