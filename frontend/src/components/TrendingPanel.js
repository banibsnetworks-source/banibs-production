import React from 'react';
import { ExternalLink, TrendingUp } from 'lucide-react';
import SentimentBadge from './SentimentBadge';

/**
 * TrendingPanel - Phase 7.6.4
 * Displays trending news stories with sentiment chips and trending scores
 */
const TrendingPanel = ({ trending, title, compact }) => {
  if (!trending || !trending.items || trending.items.length === 0) {
    return null;
  }

  const headerTitle = title || (trending.section === 'all' ? 'Trending Now' : `Trending in ${trending.section}`);

  const handleClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card backdrop-blur-md px-4 py-4 shadow-lg">
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500/20">
            <TrendingUp className="text-red-400" size={14} />
          </div>
          <h2 className="text-xs font-bold tracking-wide text-card-foreground uppercase">
            {headerTitle}
          </h2>
        </div>
        {trending.updated_at && (
          <span className="text-[10px] text-muted-foreground">
            Updated recently
          </span>
        )}
      </header>

      {/* Trending List */}
      <ul className="space-y-3">
        {trending.items.map((item, index) => (
          <li
            key={item.id}
            onClick={() => handleClick(item.sourceUrl)}
            className="group cursor-pointer"
          >
            <div className="flex items-start space-x-2">
              {/* Rank Number */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-yellow-400">{index + 1}</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title */}
                <p className="text-sm font-semibold leading-snug text-card-foreground group-hover:text-yellow-400 transition-colors line-clamp-2 mb-1">
                  {item.title}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {item.category && (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                        {item.category}
                      </span>
                    )}
                    {item.sentiment_label && (
                      <SentimentBadge
                        sentiment={item.sentiment_label}
                        score={item.sentiment_score}
                        compact
                      />
                    )}
                  </div>
                  
                  {/* Trending Score */}
                  {typeof item.trending_score === 'number' && (
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-muted-foreground">
                        {(item.trending_score * 100).toFixed(0)}%
                      </span>
                      <TrendingUp size={10} className="text-red-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* View All Link */}
      <div className="mt-3 pt-3 border-t border-border">
        <button
          onClick={() => window.location.href = '/'}
          className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition-colors flex items-center space-x-1"
        >
          <span>View all trending</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
};

export default TrendingPanel;
