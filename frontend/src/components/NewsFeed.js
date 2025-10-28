import React, { useState, useEffect } from 'react';

const NewsFeed = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/news/latest`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNewsItems(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-lg">📰</span>
          <span>Latest Stories</span>
        </h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500 text-base">Loading news...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-lg">📰</span>
          <span>Latest Stories</span>
        </h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-red-500 text-base">Error loading news: {error}</div>
        </div>
      </section>
    );
  }

  if (newsItems.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-lg">📰</span>
          <span>Latest Stories</span>
        </h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-500 text-base">No news items available yet. Check back soon!</div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-lg">📰</span>
        <span>Latest Stories</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition"
          >
            {/* Category pill */}
            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              {item.category}
            </div>
            
            {/* Title */}
            {item.sourceUrl ? (
              <a 
                href={item.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-lg font-bold text-gray-900 leading-tight hover:text-gray-700"
              >
                {item.title}
              </a>
            ) : (
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {item.title}
              </h3>
            )}
            
            {/* Summary */}
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">
              {item.summary}
            </p>
            
            {/* Date */}
            <div className="text-xs text-gray-500 mt-3">
              {formatDate(item.publishedAt)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewsFeed;
