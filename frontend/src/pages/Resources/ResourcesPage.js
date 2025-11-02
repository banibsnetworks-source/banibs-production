import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CATEGORIES = [
  'All',
  'Business Support',
  'Grants & Funding',
  'Education',
  'Health & Wellness',
  'Technology',
  'Community & Culture'
];

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchResources();
  }, [page, selectedCategory, showFeaturedOnly]);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${BACKEND_URL}/api/resources?page=${page}&limit=20`;
      
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      if (showFeaturedOnly) {
        url += '&featured=true';
      }
      
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch resources');
      
      const data = await response.json();
      setResources(data.resources || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const getTypeIcon = (type) => {
    const icons = {
      'Article': '📄',
      'Guide': '📖',
      'Video': '🎥',
      'Tool': '🛠️',
      'Download': '⬇️'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/hub" className="text-yellow-500 hover:text-yellow-400 mb-4 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Information & Resources</h1>
          <p className="text-gray-400">Education, culture, and language tools for the community</p>
          <div className="mt-4 text-sm text-gray-500">
            {total} {total === 1 ? 'resource' : 'resources'} available
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resources by title or description..."
                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filters */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={showFeaturedOnly}
              onChange={(e) => {
                setShowFeaturedOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="featured" className="text-gray-300 cursor-pointer">
              Show featured resources only
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="text-gray-400 mt-4">Loading resources...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Resources Grid */}
        {!loading && !error && (
          <>
            {resources.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No resources found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setShowFeaturedOnly(false);
                    setPage(1);
                    fetchResources();
                  }}
                  className="mt-4 text-yellow-500 hover:text-yellow-400 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {resources.map((resource) => (
                    <Link
                      key={resource.id}
                      to={`/resources/${resource.id}`}
                      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all hover:shadow-lg hover:shadow-yellow-500/10 group"
                    >
                      {/* Featured Badge */}
                      {resource.featured && (
                        <div className="mb-3">
                          <span className="inline-block bg-yellow-500/20 text-yellow-500 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-500/30">
                            ⭐ Featured
                          </span>
                        </div>
                      )}

                      {/* Type & Category */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{getTypeIcon(resource.type)}</span>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                          {resource.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors line-clamp-2">
                        {resource.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {resource.description}
                      </p>

                      {/* Tags */}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {resource.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-gray-800">
                        <span>{resource.type}</span>
                        <span>👁️ {resource.view_count || 0} views</span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === 1
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      ← Previous
                    </button>
                    
                    <span className="text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === totalPages
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ResourcesPage;
