import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SentimentBadge from '../../components/SentimentBadge';
import HeavyContentBanner from '../../components/HeavyContentBanner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CONTENT_TYPES = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'news', label: 'News', icon: '📰' },
  { value: 'opportunity', label: 'Opportunities', icon: '💼' },
  { value: 'resource', label: 'Resources', icon: '📚' },
  { value: 'event', label: 'Events', icon: '📅' },
  { value: 'business', label: 'Business', icon: '🏢' }
];

const SENTIMENT_FILTERS = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'positive', label: 'Positive', icon: '🟢' },
  { value: 'neutral', label: 'Neutral', icon: '⚪' },
  { value: 'negative', label: 'Critical', icon: '🔴' }
];

const ActivityFeed = () => {
  const navigate = useNavigate();
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [featureFlags, setFeatureFlags] = useState({ ui: { heavyContentBanner: false } });

  useEffect(() => {
    fetchFeatureFlags();
    fetchFeed();
  }, [selectedType, dateRange]);

  const fetchFeatureFlags = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/config/features`);
      if (response.ok) {
        const data = await response.json();
        setFeatureFlags(data);
      }
    } catch (err) {
      console.error('Error fetching feature flags:', err);
    }
  };

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

  // Client-side sentiment filtering (as requested by Raymond)
  const filteredFeedItems = useMemo(() => {
    if (sentimentFilter === 'all') {
      return feedItems;
    }
    return feedItems.filter(item => {
      // Only filter items that have sentiment data
      if (item.metadata?.sentiment_label) {
        return item.metadata.sentiment_label.toLowerCase() === sentimentFilter;
      }
      return true; // Include items without sentiment when filtering
    });
  }, [feedItems, sentimentFilter]);

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

        {/* Sentiment Filter */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600">Filter by Sentiment:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SENTIMENT_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSentimentFilter(filter.value)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
                  sentimentFilter === filter.value
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{filter.icon}</span>
                <span>{filter.label}</span>
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
          {filteredFeedItems.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-8 text-center">
              <p className="text-gray-500">
                {feedItems.length === 0 
                  ? 'No items found for this filter.' 
                  : 'No items found with this sentiment. Try a different filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedItems.map((item) => {
                const imgSrc = item.thumbnail || `${BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
                
                return (
                  <article
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    {/* Phase 6.6 - Heavy Content Banner */}
                    {featureFlags.ui?.heavyContentBanner && item.heavy_content && (
                      <HeavyContentBanner
                        visible={true}
                        message={item.banner_message}
                        variant="inline"
                        showHideSimilar={false}
                      />
                    )}

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
                        {/* Type Badge + Sentiment + Date */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-lg">{getTypeIcon(item.type)}</span>
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          
                          {/* Sentiment Badge - only for News and Resources */}
                          {(item.type === 'news' || item.type === 'resource') && 
                           item.metadata?.sentiment_label && (
                            <SentimentBadge
                              label={item.metadata.sentiment_label}
                              score={item.metadata.sentiment_score}
                              size="sm"
                              showLabel={false}
                            />
                          )}
                          
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
};

export default ActivityFeed;
