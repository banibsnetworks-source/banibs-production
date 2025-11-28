import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * BANIBS NewsBeat Component - Dual-Layout System
 * 
 * Raymond's Specs:
 * 
 * DESKTOP - Right Rail Block:
 * - Card title: "BANIBS NewsBeat"
 * - Subtitle: "Headlines moving our people right now."
 * - Vertical list of headlines
 * - Footer link: "View all news →"
 * 
 * MOBILE - Strip Under Header:
 * - Horizontal scrolling bar
 * - Format: "NewsBeat: Atlanta small business grants • DOJ review • Markets..."
 * - Tap → Takes to News portal
 */

const NewsBeat = ({ variant = 'desktop', limit = 5 }) => {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeadlines();
  }, []);

  const fetchHeadlines = async () => {
    try {
      // Fetch latest headlines from news API
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/news/homepage`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Get featured stories or latest stories
        const stories = data.featured_stories || data.latest_stories || [];
        setHeadlines(stories.slice(0, limit));
      } else {
        // Handle non-ok response without consuming body twice
        console.error('Failed to fetch news headlines:', response.status);
        throw new Error('Failed to fetch headlines');
      }
    } catch (error) {
      console.error('Failed to fetch news headlines:', error);
      // Fallback to placeholder headlines
      setHeadlines([
        { id: 1, title: 'Atlanta: New small business grant program for Black founders opens', url: '/news' },
        { id: 2, title: 'DC: DOJ announces review on policing practices', url: '/news' },
        { id: 3, title: 'Wall Street: Rates hold steady, markets react positively', url: '/news' },
        { id: 4, title: 'Tech: Major AI investment announced by Black-owned startup', url: '/news' },
        { id: 5, title: 'Community: HBCU receives record $100M donation', url: '/news' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Desktop variant - Right rail card
  if (variant === 'desktop') {
    return (
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-yellow-500/10 to-yellow-600/10">
          <h3 className="text-lg font-bold text-foreground">BANIBS NewsBeat</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Headlines moving our people right now.
          </p>
        </div>

        {/* Headlines */}
        <div className="divide-y divide-border">
          {loading ? (
            // Loading skeleton
            [...Array(3)].map((_, i) => (
              <div key={i} className="px-4 py-3 animate-pulse">
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))
          ) : (
            headlines.map((headline) => (
              <Link
                key={headline.id}
                to={headline.url || '/news'}
                className="block px-4 py-3 hover:bg-muted transition-colors group"
              >
                <p className="text-sm text-foreground leading-snug group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  {headline.title}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {headline.source || 'BANIBS News'}
                  </span>
                  {headline.is_breaking && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                      BREAKING
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Footer */}
        <Link
          to="/news"
          className="flex items-center justify-between px-4 py-3 bg-muted hover:bg-muted/80 transition-colors group"
        >
          <span className="text-sm font-medium text-foreground">View all news</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
        </Link>
      </div>
    );
  }

  // Mobile variant - Horizontal strip
  if (variant === 'mobile') {
    return (
      <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-b border-border">
        <Link
          to="/news"
          className="block px-4 py-2 overflow-x-auto whitespace-nowrap scrollbar-hide hover:bg-yellow-500/5 transition-colors"
        >
          <span className="text-xs font-bold text-foreground">NewsBeat:</span>
          <span className="text-xs text-muted-foreground ml-2">
            {loading ? (
              'Loading latest headlines...'
            ) : (
              headlines.map((headline, index) => (
                <React.Fragment key={headline.id}>
                  {headline.title}
                  {index < headlines.length - 1 && ' • '}
                </React.Fragment>
              ))
            )}
          </span>
        </Link>
      </div>
    );
  }

  return null;
};

export default NewsBeat;
