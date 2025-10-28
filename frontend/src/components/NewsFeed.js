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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-[#FFD700] mb-8">Latest Stories</h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-400 text-lg">Loading news...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-[#FFD700] mb-8">Latest Stories</h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-red-400 text-lg">Error loading news: {error}</div>
        </div>
      </div>
    );
  }

  if (newsItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-[#FFD700] mb-8">Latest Stories</h2>
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-400 text-lg">No news items available yet. Check back soon!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-[#FFD700] mb-8">Latest Stories</h2>
      <div className="grid md:grid-cols-3 gap-8">
        
        {newsItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg overflow-hidden hover:border-[#FFD700] transition-all"
          >
            {/* Image or placeholder */}
            {item.imageUrl ? (
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
            ) : (
              <div className="bg-gradient-to-br from-[#FFD700]/20 to-black h-48 flex items-center justify-center">
                <div className="text-4xl">📰</div>
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {/* Category */}
              <span className="text-[#FFD700] text-xs font-semibold uppercase">
                {item.category}
              </span>
              
              {/* Title */}
              <h3 className="text-xl font-bold text-white mt-2 mb-3">
                {item.title}
              </h3>
              
              {/* Summary */}
              <p className="text-gray-400 text-sm mb-4">
                {item.summary}
              </p>
              
              {/* Date and Link */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">
                  {formatDate(item.publishedAt)}
                </span>
                {item.sourceUrl ? (
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#FFD700] text-sm font-semibold hover:underline"
                  >
                    Read More →
                  </a>
                ) : (
                  <button className="text-[#FFD700] text-sm font-semibold hover:underline">
                    Read More →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default NewsFeed;
