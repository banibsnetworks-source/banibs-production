import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopStoriesGrid from '../components/TopStoriesGrid';
import NewsNavigationBar from '../components/NewsNavigationBar';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * BANIBS Black News Page
 * 
 * A first-class lens showing stories centering Black people, Black nations,
 * and the global Black diaspora across ALL topics (US, World, Business, Tech, Sports, etc.)
 * 
 * Stories are from:
 * - Black-owned/Black-focused sources, OR
 * - About Black people, communities, or issues
 */
const BlackNewsPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const pageSize = 20;

  useEffect(() => {
    fetchBlackNews();
  }, [page]);

  const fetchBlackNews = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${BACKEND_URL}/api/news/black`, {
        params: {
          page,
          page_size: pageSize
        }
      });
      
      setStories(response.data.items || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalItems(response.data.total_items || 0);
    } catch (err) {
      console.error('Error fetching Black News:', err);
      setError('Failed to load Black News. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <NewsNavigationBar activeSection="black" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <span>🖤</span>
            <span>Black News</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Stories centering Black people, Black nations, and the global Black diaspora
          </p>
          {totalItems > 0 && (
            <p className="text-muted-foreground text-sm mt-2">
              {totalItems} stories • Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && page === 1 && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-yellow-500" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <button
              onClick={fetchBlackNews}
              className="mt-4 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stories Grid */}
        {!loading && !error && stories.length > 0 && (
          <>
            <TopStoriesGrid stories={stories} />
            
            {/* Load More Button */}
            {page < totalPages && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      Loading...
                    </span>
                  ) : (
                    `Load More (${stories.length} of ${totalItems})`
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && stories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No Black News stories available at this time.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Check back soon for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlackNewsPage;
