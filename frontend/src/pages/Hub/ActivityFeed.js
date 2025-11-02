import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CONTENT_TYPES = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'news', label: 'News', icon: '📰' },
  { value: 'opportunity', label: 'Opportunities', icon: '💼' },
  { value: 'resource', label: 'Resources', icon: '📚' },
  { value: 'event', label: 'Events', icon: '📅' },
  { value: 'business', label: 'Business', icon: '🏢' }
];

const ActivityFeed = () => {
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchFeed();
  }, [selectedType, dateRange]);

  const fetchFeed = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${BACKEND_URL}/api/feed?type=${selectedType}&limit=20`;
      if (dateRange !== 'all') {
        url += `&date_range=${dateRange}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch feed');
      
      const data = await response.json();
      setFeedItems(data.items || []);
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleItemClick = (item) => {
    navigate(item.link);
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm">
        {/* Content Type Filters */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2 md:gap-3">
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm md:text-base ${
                  selectedType === type.value
                    ? 'bg-yellow-400 text-black shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                <span className="hidden sm:inline">{type.label}</span>
                <span className="sm:hidden">{type.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => setDateRange('all')}
            className={`px-3 py-1 rounded-lg transition ${
              dateRange === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateRange('today')}
            className={`px-3 py-1 rounded-lg transition ${
              dateRange === 'today' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateRange('week')}
            className={`px-3 py-1 rounded-lg transition ${
              dateRange === 'week' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setDateRange('month')}
            className={`px-3 py-1 rounded-lg transition ${
              dateRange === 'month' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
          <p className="text-gray-600 mt-2">Loading feed...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Feed Items */}
      {!loading && !error && (
        <>
          {feedItems.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 text-center">
              <p className="text-gray-500">No items found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedItems.map((item) => {
                const imgSrc = item.thumbnail || `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
                
                return (
                  <article
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={imgSrc}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
                          }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Type Badge + Date */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getTypeIcon(item.type)}</span>
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(item.created_at)}
                          </span>
                          {item.metadata?.category && (
                            <span className="text-xs text-gray-400">• {item.metadata.category}</span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-yellow-600 transition">
                          {item.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {item.summary}
                        </p>

                        {/* Metadata */}
                        {item.metadata && (
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
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
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Stories Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>📰</span>
          <span>Top Stories</span>
        </h2>
        
        {news.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No news items available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {news.map((item) => {
              const imgSrc = item.imageUrl || `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
              
              return (
                <article
                  key={item.id}
                  className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                >
                  {/* Image */}
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-black/40 border border-yellow-400/20 mb-3">
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
                      }}
                    />
                  </div>

                  {/* Category + Date */}
                  <div className="flex items-center text-xs text-gray-500 gap-2 mb-2">
                    {item.category && (
                      <span className="font-semibold text-gray-700">{item.category}</span>
                    )}
                    {item.publishedAt && (
                      <span className="text-gray-400">
                        {formatDate(item.publishedAt)}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-900 leading-snug mb-2">
                    {item.sourceUrl ? (
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>

                  {/* Summary */}
                  {item.summary && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {item.summary}
                    </p>
                  )}

                  {/* Read More */}
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-800 mt-2 inline-block hover:underline"
                    >
                      Read More →
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Featured Opportunities Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>💼</span>
          <span>Featured Opportunities</span>
        </h2>
        
        {opportunities.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 text-center">
            <p className="text-gray-500">No featured opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                {/* Type Badge */}
                <div className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-900 text-xs font-semibold rounded-full mb-3">
                  {opp.type || 'Opportunity'}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {opp.title}
                </h3>

                {/* Organization & Deadline */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  {opp.organization && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Organization:</span>
                      <span>{opp.organization}</span>
                    </div>
                  )}
                  {opp.deadline && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Deadline:</span>
                      <span>{formatDate(opp.deadline)}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {opp.description && (
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                    {opp.description}
                  </p>
                )}

                {/* Apply Button */}
                {opp.applicationUrl && (
                  <a
                    href={opp.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition"
                  >
                    Apply Now
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ActivityFeed;
