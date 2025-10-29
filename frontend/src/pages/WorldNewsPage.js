import React, { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateUtils';

const WorldNewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorldNews();
  }, []);

  const fetchWorldNews = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/news/category/world-news`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch world news');
      }
      
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching world news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        <main className="max-w-[1200px] mx-auto px-4 py-10">
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-400 mb-4">🌍 Loading World News...</div>
            <div className="text-gray-400">Fetching the latest global headlines</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        <main className="max-w-[1200px] mx-auto px-4 py-10">
          <div className="text-center">
            <div className="text-2xl font-semibold text-yellow-400 mb-4">🌍 World News</div>
            <div className="text-gray-400">Unable to load global news at this time.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <main className="max-w-[1200px] mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            World News
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            Global headlines curated from trusted sources: CNN, BBC, Reuters, Al Jazeera, The Guardian, and more.
          </p>
          <div className="text-sm text-yellow-300/70 mt-2">
            Updates automatically • {articles.length} stories available
          </div>
        </div>

        {/* Empty State */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              World news is loading...
            </h2>
            <p className="text-gray-400">
              Global RSS feeds are being synchronized. Check back in a few minutes.
            </p>
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <a
                key={article.id}
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-black/50 border border-yellow-400/20 rounded-xl overflow-hidden hover:border-yellow-400/40 hover:bg-black/70 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {/* Article Image */}
                <div className="w-full h-48 bg-black/40 border-b border-yellow-400/20 flex items-center justify-center overflow-hidden">
                  {article.imageUrl ? (
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-yellow-300/70 italic text-sm text-center px-4">
                      BANIBS • World News
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[0.7rem] uppercase text-yellow-300/80 font-semibold tracking-wide">
                      {article.sourceName}
                    </div>
                    <div className="text-[0.65rem] text-gray-400">
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>
                  
                  <h3 className="text-base font-semibold mb-3 leading-tight group-hover:text-yellow-200 transition-colors">
                    {article.title}
                  </h3>
                  
                  {article.summary && (
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {article.category}
                    </span>
                    <span className="text-yellow-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Read More →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            World news aggregated from international sources • Stories updated every 6 hours
          </p>
          <p className="text-xs text-gray-600 mt-2">
            All stories link to original source publications
          </p>
        </div>
      </main>
    </div>
  );
};

export default WorldNewsPage;