import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  ArrowLeft, Plus, Search, Filter, MapPin, 
  Package, X, ChevronDown, Grid3X3, List
} from 'lucide-react';
import FullWidthLayout from '../../../components/layouts/FullWidthLayout';

/**
 * Local Exchange - Browse Listings
 * Facebook Marketplace style local pickup listings
 * 
 * Constraints:
 * - No payments
 * - No shipping
 * - Approximate location only
 * - Message seller via ChatSphere
 */

const CATEGORY_ICONS = {
  furniture: '🛋️',
  electronics: '📱',
  clothing: '👕',
  vehicles: '🚗',
  home: '🏠',
  sports: '⚽',
  toys: '🎮',
  books: '📚',
  baby: '👶',
  free: '🎁',
  services: '🔧',
  other: '📦',
};

const LocalExchangeHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFreeOnly, setShowFreeOnly] = useState(searchParams.get('free') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/local-exchange/categories`);
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, [API_URL]);

  // Fetch listings
  const fetchListings = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (showFreeOnly) params.append('is_free', 'true');
      params.append('sort', sortBy);
      params.append('limit', '20');

      const token = localStorage.getItem('access_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/api/local-exchange/listings?${params}`, { headers });
      
      if (!res.ok) throw new Error('Failed to fetch listings');
      
      const data = await res.json();
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setHasMore(data.has_more || false);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Unable to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL, searchQuery, selectedCategory, showFreeOnly, sortBy]);

  useEffect(() => {
    fetchListings(true);
  }, [fetchListings]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (showFreeOnly) params.set('free', 'true');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, showFreeOnly, sortBy, setSearchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setShowFreeOnly(false);
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery || selectedCategory || showFreeOnly || sortBy !== 'newest';

  return (
    <FullWidthLayout>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
          color: isDark ? '#e5e5e5' : '#1a1a1a'
        }}
      >
        {/* Header */}
        <header 
          className="sticky top-0 z-50 border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Back button */}
              <button
                onClick={() => navigate('/socialworld')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                }}
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline text-sm">Social World</span>
              </button>

              {/* Title */}
              <div className="flex-1">
                <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  <Package size={24} className="text-amber-500" />
                  Local Exchange
                </h1>
                <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                  Buy, sell, and trade locally
                </p>
              </div>

              {/* Create Listing Button */}
              {user && (
                <Link
                  to="/socialworld/local/new"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'rgb(245, 158, 11)',
                    color: '#000'
                  }}
                  data-testid="create-listing-btn"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">List Item</span>
                </Link>
              )}
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
              <div 
                className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                <Search size={18} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search local listings..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: isDark ? '#fff' : '#111' }}
                  data-testid="search-input"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')}>
                    <X size={16} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
                  </button>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  hasActiveFilters ? 'ring-2 ring-amber-500/50' : ''
                }`}
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
                data-testid="filter-btn"
              >
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            </form>

            {/* Filters Panel */}
            {showFilters && (
              <div 
                className="mt-4 p-4 rounded-xl"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                {/* Category Filter */}
                <div className="mb-4">
                  <label className="text-xs font-medium mb-2 block" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        !selectedCategory ? 'bg-amber-500 text-black' : ''
                      }`}
                      style={!selectedCategory ? {} : {
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                      }}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                          selectedCategory === cat.id ? 'bg-amber-500 text-black' : ''
                        }`}
                        style={selectedCategory === cat.id ? {} : {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                        }}
                      >
                        <span>{CATEGORY_ICONS[cat.id] || '📦'}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Other Filters */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* Free Only */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showFreeOnly}
                      onChange={(e) => setShowFreeOnly(e.target.checked)}
                      className="w-4 h-4 rounded accent-amber-500"
                    />
                    <span className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                      🎁 Free items only
                    </span>
                  </label>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm outline-none"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        color: isDark ? '#fff' : '#111',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-amber-500 hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
              {loading ? 'Loading...' : `${total} listing${total !== 1 ? 's' : ''} found`}
            </p>
            
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-black' : ''}`}
                style={viewMode === 'grid' ? {} : { color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-amber-500 text-black' : ''}`}
                style={viewMode === 'list' ? {} : { color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div 
              className="text-center py-12 rounded-xl"
              style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }}
            >
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => fetchListings(true)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-16">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              >
                <Package size={40} style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                {hasActiveFilters ? 'No listings match your filters' : 'No listings yet'}
              </h3>
              <p className="text-sm mb-6" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                {hasActiveFilters 
                  ? 'Try adjusting your filters or search terms'
                  : 'Be the first to list something in your area'
                }
              </p>
              {hasActiveFilters ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111'
                  }}
                >
                  Clear filters
                </button>
              ) : user ? (
                <Link
                  to="/socialworld/local/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black"
                >
                  <Plus size={18} />
                  Create Listing
                </Link>
              ) : (
                <Link
                  to="/auth/signin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black"
                >
                  Sign in to list items
                </Link>
              )}
            </div>
          )}

          {/* Listings Grid */}
          {!loading && !error && listings.length > 0 && (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-4'
            }>
              {listings.map(listing => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  viewMode={viewMode}
                  isDark={isDark}
                />
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="rounded-xl overflow-hidden animate-pulse"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                >
                  <div className="aspect-square" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
                  <div className="p-3 space-y-2">
                    <div className="h-4 rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', width: '60%' }} />
                    <div className="h-3 rounded" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Sign-in prompt for guests */}
        {!user && (
          <div 
            className="fixed bottom-0 left-0 right-0 p-4 border-t"
            style={{
              backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <p className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                Sign in to list items or message sellers
              </p>
              <Link
                to="/auth/signin"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </FullWidthLayout>
  );
};

// Listing Card Component
const ListingCard = ({ listing, viewMode, isDark }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/socialworld/local/${listing.id}`);
  };

  const formatPrice = (price, isFree) => {
    if (isFree || price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  };

  const getConditionLabel = (condition) => {
    const labels = {
      new: 'New',
      like_new: 'Like New',
      good: 'Good',
      fair: 'Fair',
      for_parts: 'For Parts'
    };
    return labels[condition] || condition;
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="flex gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
        }}
        data-testid={`listing-card-${listing.id}`}
      >
        {/* Image */}
        <div 
          className="w-32 h-32 rounded-lg flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
        >
          {listing.photos && listing.photos.length > 0 ? (
            <img 
              src={listing.photos[0]} 
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={32} style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate mb-1" style={{ color: isDark ? '#fff' : '#111' }}>
            {listing.title}
          </h3>
          <p 
            className="text-lg font-bold mb-2"
            style={{ color: listing.is_free ? 'rgb(34, 197, 94)' : 'rgb(245, 158, 11)' }}
          >
            {formatPrice(listing.price, listing.is_free)}
          </p>
          <div className="flex items-center gap-3 text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {listing.location_city}{listing.location_state && `, ${listing.location_state}`}
            </span>
            <span>{getConditionLabel(listing.condition)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
      }}
      data-testid={`listing-card-${listing.id}`}
    >
      {/* Image */}
      <div 
        className="aspect-square relative overflow-hidden"
        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
      >
        {listing.photos && listing.photos.length > 0 ? (
          <img 
            src={listing.photos[0]} 
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }} />
          </div>
        )}
        
        {/* Free badge */}
        {listing.is_free && (
          <span className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
            Free
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <p 
          className="text-lg font-bold mb-1"
          style={{ color: listing.is_free ? 'rgb(34, 197, 94)' : 'rgb(245, 158, 11)' }}
        >
          {formatPrice(listing.price, listing.is_free)}
        </p>
        <h3 
          className="text-sm font-medium truncate mb-1"
          style={{ color: isDark ? '#fff' : '#111' }}
        >
          {listing.title}
        </h3>
        <p 
          className="text-xs flex items-center gap-1"
          style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
        >
          <MapPin size={12} />
          {listing.location_city}
        </p>
      </div>
    </div>
  );
};

export default LocalExchangeHome;
