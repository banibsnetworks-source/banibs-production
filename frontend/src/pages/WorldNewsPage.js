import React, { useEffect, useState } from 'react';
import { formatDate } from '../utils/dateUtils';
import { trackNewsClick } from '../utils/analytics';
import TrendingWidget from '../components/TrendingWidget';
import HeavyContentBanner from '../components/HeavyContentBanner';

const REGIONS = [
  "Global",
  "Africa", 
  "Americas",
  "Europe",
  "Asia",
  "Middle East",
];

// Image utility functions
const normalizeImageUrl = (url) => {
  if (!url) return null;
  
  // Ensure HTTPS
  if (url.startsWith('http://')) {
    url = url.replace('http://', 'https://');
  }
  
  // Convert CDN URLs to direct file access in development
  if (url.startsWith('https://cdn.banibs.com/news/')) {
    const filename = url.split('/').pop();
    return `/cdn/news/${filename}`;
  }
  
  // Convert fallback URLs
  if (url.startsWith('https://cdn.banibs.com/fallback/')) {
    const filename = url.split('/').pop();
    return `/cdn/fallback/${filename}`;
  }
  
  return url;
};

const ImageWithFallback = ({ src, alt, className, region }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const normalizedSrc = normalizeImageUrl(src);
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };
  
  // Enhanced fallback UI - always show this if no image or error
  if (!normalizedSrc || imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-black/60 to-gray-900/80 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-yellow-400 text-3xl mb-2">🌍</div>
          <div className="text-yellow-300/80 italic text-sm font-medium tracking-wide">
            BANIBS • {region || "World News"}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-gray-900/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-yellow-400 text-xl mb-1">🌍</div>
            <div className="text-yellow-300/70 text-xs">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={normalizedSrc}
        alt={alt}
        className={`${className} ${imageError ? 'hidden' : 'block'}`}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

const WorldNewsPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [region, setRegion] = useState("Global"); // default view
  const [featureFlags, setFeatureFlags] = useState({ ui: { heavyContentBanner: false } });

  useEffect(() => {
    fetchFeatureFlags();
    fetchWorldNews();
  }, [region]);

  const fetchFeatureFlags = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/config/features`);
      if (response.ok) {
        const data = await response.json();
        setFeatureFlags(data);
      }
    } catch (err) {
      console.error('Error fetching feature flags:', err);
    }
  };

  const fetchWorldNews = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const base = `${BACKEND_URL}/api/news/category/world-news`;
      const url = region && region !== "Global" 
        ? `${base}?region=${encodeURIComponent(region)}`
        : base;
        
      const response = await fetch(url);
      
      if (!response.ok) {
        // Extract error message safely without consuming body twice
        let errorMessage = 'Failed to fetch world news';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
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
            <div className="text-gray-400">Fetching {region === "Global" ? "global" : region} headlines</div>
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
            <div className="text-gray-400">Unable to load {region === "Global" ? "global" : region} news at this time.</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <main className="max-w-[1200px] mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4 flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            World News
            {region !== "Global" && (
              <span className="text-lg text-gray-300">• {region}</span>
            )}
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
            Global headlines curated from trusted sources: CNN, BBC, Reuters, Al Jazeera, The Guardian, Bloomberg, AP, and more.
          </p>
          <div className="text-sm text-yellow-300/70 mt-2">
            Updates automatically • {articles.length} {region !== "Global" ? region : "global"} stories available
          </div>

          {/* Region filter pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 
                  ${region === r
                    ? "bg-yellow-400 text-black border-yellow-400 shadow-lg"
                    : "bg-black/40 border-yellow-400/30 text-yellow-300/80 hover:border-yellow-400/60 hover:bg-black/60"
                  }`}
              >
                {r === "Global" ? "🌐 Global" : 
                 r === "Africa" ? "🌍 Africa" :
                 r === "Americas" ? "🌎 Americas" :
                 r === "Europe" ? "🌍 Europe" :
                 r === "Asia" ? "🌏 Asia" :
                 r === "Middle East" ? "🕌 Middle East" : r}
              </button>
            ))}
          </div>
        </header>

        {/* Empty State */}
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌐</div>
            <h2 className="text-xl font-semibold text-gray-300 mb-2">
              {region === "Global" ? "World news is loading..." : `No ${region} news available yet`}
            </h2>
            <p className="text-gray-400">
              {region === "Global" 
                ? "Global RSS feeds are being synchronized. Check back in a few minutes."
                : `Try selecting "Global" or check back later as we expand ${region} coverage.`
              }
            </p>
          </div>
        ) : (
          /* Main Content Area with Sidebar */
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Articles Grid */}
            <div className="flex-1">
              <section className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <div key={article.id} className="flex flex-col">
                {/* Phase 6.6 - Heavy Content Banner */}
                {featureFlags.ui?.heavyContentBanner && article.heavy_content && (
                  <div className="mb-3">
                    <HeavyContentBanner
                      visible={true}
                      message={article.banner_message}
                      variant="card"
                      showHideSimilar={false}
                    />
                  </div>
                )}
                
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackNewsClick(article.id, article.region || region)}
                  className="group bg-black/50 border border-yellow-400/20 rounded-xl overflow-hidden hover:border-yellow-400/40 hover:bg-black/70 transition-all duration-300 shadow-lg hover:shadow-xl flex flex-col flex-1"
                >
                  {/* Article Image */}
                  <div className="relative w-full h-48 bg-black/40 border-b border-yellow-400/20 overflow-hidden">
                    <ImageWithFallback
                      src={article.imageUrl}
                      alt={article.title}
                      region={article.region}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-300"
                    />
                  </div>

                  {/* Article Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[0.7rem] uppercase text-yellow-300/80 font-semibold tracking-wide">
                        {article.sourceName}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.65rem] text-gray-400">
                          {formatDate(article.publishedAt)}
                        </span>
                        {article.region && (
                          <span className="text-[0.6rem] bg-yellow-400/10 text-yellow-300/70 px-2 py-1 rounded">
                            {article.region}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-base font-semibold mb-3 leading-tight group-hover:text-yellow-200 transition-colors flex-1">
                      {article.title}
                    </h3>
                    
                    {article.summary && (
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-4">
                        {article.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-gray-500">
                        {article.category}
                      </span>
                      <span className="text-yellow-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read More →
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
              </section>
            </div>

            {/* Right Column - Trending Widget */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="sticky top-4">
                <TrendingWidget activeRegion={region} />
              </div>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            {region === "Global" ? "World news" : `${region} news`} aggregated from international sources • Stories updated every 6 hours
          </p>
          <p className="text-xs text-gray-600 mt-2">
            All stories link to original source publications • Regional filtering powered by BANIBS
          </p>
        </div>
      </main>
    </div>
  );
};

export default WorldNewsPage;
