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
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        <div className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm border border-gray-100 rounded-xl p-5 shadow-sm">
          No news items available yet. Check back soon!
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {newsItems.map((item) => (
          <article
            key={item.id}
            className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            {/* Category + Date */}
            <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2 mb-2">
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
            <h3 className="text-lg font-semibold text-gray-900 leading-snug">
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
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                {item.summary}
              </p>
            )}

            {/* Read more link */}
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-gray-800 mt-3 inline-block hover:underline"
              >
                Read More →
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default NewsFeed;
