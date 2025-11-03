import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SentimentBadge from '../../components/SentimentBadge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch();
    } else {
      setResults(null);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}&limit=5`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      news: '📰',
      opportunity: '💼',
      resource: '📚',
      event: '📅',
      business: '🏢'
    };
    return icons[type] || '📄';
  };

  const highlightText = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <strong key={index} className="bg-yellow-200">{part}</strong> : part
    );
  };

  const categoryGroups = [
    { key: 'news', label: 'News', icon: '📰', route: '/world-news' },
    { key: 'opportunities', label: 'Opportunities', icon: '💼', route: '/opportunities' },
    { key: 'resources', label: 'Resources', icon: '📚', route: '/resources' },
    { key: 'events', label: 'Events', icon: '📅', route: '/events' },
    { key: 'businesses', label: 'Businesses', icon: '🏢', route: '/business/directory' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black border-b border-yellow-500/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/hub" className="text-yellow-500 hover:text-yellow-400 mb-4 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
          {query && (
            <p className="text-gray-400">
              Searching for: <span className="text-white font-semibold">"{query}"</span>
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Query Validation */}
        {query.length < 2 && (
          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-6 text-center">
            <p className="text-yellow-400">Please enter at least 2 characters to search.</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="text-gray-400 mt-4">Searching across all modules...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Results Summary */}
        {results && !loading && query.length >= 2 && (
          <>
            <div className="mb-8 text-center">
              <p className="text-gray-300 text-lg">
                Found <span className="text-yellow-500 font-bold">{results.total_results}</span> results across{' '}
                <span className="text-yellow-500 font-bold">
                  {Object.values(results.categories).filter(cat => cat.count > 0).length}
                </span>{' '}
                categories
              </p>
            </div>

            {/* Results by Category (Fixed Order: News → Opportunities → Resources → Events → Businesses) */}
            <div className="space-y-8">
              {categoryGroups.map(({ key, label, icon, route }) => {
                const categoryData = results.categories[key];
                const hasResults = categoryData && categoryData.count > 0;

                return (
                  <section key={key} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
                    {/* Category Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="text-3xl">{icon}</span>
                        <span>{label}</span>
                        <span className="text-yellow-500">({categoryData?.count || 0})</span>
                      </h2>
                      {hasResults && categoryData.has_more && (
                        <Link
                          to={`${route}?q=${encodeURIComponent(query)}`}
                          className="text-yellow-500 hover:text-yellow-400 text-sm font-semibold"
                        >
                          View All →
                        </Link>
                      )}
                    </div>

                    {/* Results or Empty State */}
                    {!hasResults ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No {label.toLowerCase()} found for "{query}"</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {categoryData.items.map((item) => (
                          <Link
                            key={item.id}
                            to={item.link}
                            className="block bg-black/50 border border-gray-800 rounded-lg p-4 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10"
                          >
                            <div className="flex gap-4">
                              {/* Thumbnail */}
                              {item.thumbnail && (
                                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800">
                                  <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.src = `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
                                    }}
                                  />
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                {/* Category Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-gray-400 bg-gray-800 px-2 py-1 rounded">
                                    {item.category || item.type}
                                  </span>
                                  {item.published_at && (
                                    <span className="text-xs text-gray-500">
                                      {new Date(item.published_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-white mb-2 hover:text-yellow-500 transition line-clamp-1">
                                  {highlightText(item.title, query)}
                                </h3>

                                {/* Summary */}
                                <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                                  {highlightText(item.summary, query)}
                                </p>

                                {/* Metadata - For businesses, show location only */}
                                {item.metadata && (
                                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                    {item.metadata.location && (
                                      <span className="flex items-center gap-1">
                                        <span>📍</span>
                                        <span>{item.metadata.location}</span>
                                      </span>
                                    )}
                                    {item.metadata.event_date && (
                                      <span className="flex items-center gap-1">
                                        <span>📅</span>
                                        <span>{new Date(item.metadata.event_date).toLocaleDateString()}</span>
                                      </span>
                                    )}
                                    {item.metadata.deadline && (
                                      <span className="flex items-center gap-1">
                                        <span>⏰</span>
                                        <span>Deadline: {new Date(item.metadata.deadline).toLocaleDateString()}</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}

                        {/* Show More Link */}
                        {categoryData.has_more && (
                          <div className="text-center pt-4">
                            <Link
                              to={`${route}?q=${encodeURIComponent(query)}`}
                              className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                            >
                              View All {categoryData.count} {label} →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* No Results Anywhere */}
            {results.total_results === 0 && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center mt-8">
                <p className="text-gray-400 text-lg mb-4">
                  No results found for "<span className="text-white font-semibold">{query}</span>"
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Try different keywords or browse our categories below
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {categoryGroups.map(({ route, label, icon }) => (
                    <Link
                      key={route}
                      to={route}
                      className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
