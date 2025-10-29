import React, { useState, useEffect } from 'react';
import { fetchTrendingStories } from '../utils/analytics';
import { formatDate } from '../utils/dateUtils';

const TrendingWidget = ({ activeRegion = "Global" }) => {
  const [trendingData, setTrendingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingStories();
  }, [activeRegion]);

  const loadTrendingStories = async () => {
    try {
      setLoading(true);
      const data = await fetchTrendingStories(activeRegion, 5);
      setTrendingData(data);
    } catch (error) {
      console.error('Error loading trending stories:', error);
      setTrendingData({ region: activeRegion, stories: [] });
    } finally {
      setLoading(false);
    }
  };

  const getRegionEmoji = (region) => {
    switch (region) {
      case "Global": return "🌐";
      case "Africa": return "🌍";
      case "Americas": return "🌎";
      case "Europe": return "🌍";
      case "Asia": return "🌏";
      case "Middle East": return "🕌";
      default: return "📈";
    }
  };

  const ImageWithFallback = ({ src, alt, region }) => {
    const [imageError, setImageError] = useState(false);
    
    // Same URL normalization as main page
    const normalizeImageUrl = (url) => {
      if (!url) return null;
      if (url.startsWith('https://cdn.banibs.com/news/')) {
        const filename = url.split('/').pop();
        return `/cdn/news/${filename}`;
      }
      return url;
    };

    const normalizedSrc = normalizeImageUrl(src);

    if (!normalizedSrc || imageError) {
      return (
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-black/60 to-gray-900/80 flex items-center justify-center">
          <div className="text-yellow-400 text-xs">🌍</div>
        </div>
      );
    }

    return (
      <img
        src={normalizedSrc}
        alt={alt}
        className="w-16 h-16 rounded-lg object-cover opacity-90"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    );
  };

  if (loading) {
    return (
      <div className="bg-black/30 border border-yellow-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
          <span className="text-base">{getRegionEmoji(activeRegion)}</span>
          Trending in {activeRegion}
        </h3>
        <div className="text-center text-gray-400 py-8">
          <div className="text-sm">Loading trending stories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 border border-yellow-400/20 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
        <span className="text-base">{getRegionEmoji(activeRegion)}</span>
        Trending in {activeRegion}
      </h3>

      {!trendingData?.stories || trendingData.stories.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">{getRegionEmoji(activeRegion)}</div>
          <div className="text-sm text-gray-300 mb-2">
            Be first to shape what trends in {activeRegion}.
          </div>
          <div className="text-xs text-gray-500">
            Click stories to start tracking engagement
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trendingData.stories.map((story, index) => (
            <a
              key={story.storyId}
              href={story.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 p-3 rounded-lg border border-yellow-400/10 hover:border-yellow-400/30 hover:bg-black/40 transition-all duration-200"
            >
              {/* Mini thumbnail */}
              <div className="flex-shrink-0">
                <ImageWithFallback 
                  src={story.imageUrl}
                  alt={story.title}
                  region={story.region}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white leading-tight mb-1 line-clamp-2 group-hover:text-yellow-200 transition-colors">
                  {story.title}
                </h4>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="truncate">{story.sourceName}</span>
                  <span className="flex items-center gap-1 text-yellow-300/70">
                    <span>🔥</span>
                    <span>{story.clicks}</span>
                  </span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {story.region}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-yellow-400/10">
        <div className="text-xs text-gray-500 text-center">
          Real-time engagement from the BANIBS community
        </div>
      </div>
    </div>
  );
};

export default TrendingWidget;