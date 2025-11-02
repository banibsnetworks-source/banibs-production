import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/dateUtils';

const FeaturedStory = () => {
  const [featuredStory, setFeaturedStory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedStory();
  }, []);

  const fetchFeaturedStory = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/news/featured`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch featured story');
      }
      
      const data = await response.json();
      
      // Check if we got an empty object (no featured story)
      if (Object.keys(data).length === 0) {
        setFeaturedStory(null);
      } else {
        setFeaturedStory(data);
      }
    } catch (err) {
      console.error('Error fetching featured story:', err);
      setFeaturedStory(null);
    } finally {
      setLoading(false);
    }
  };

  // Fallback content if no featured story exists
  const fallbackStory = {
    title: "Building the Future: Indigenous Tech Leaders Breaking Ground",
    summary: "Meet the entrepreneurs and innovators from Black communities who are shaping the next generation of technology and business leadership.",
    category: "Community & Innovation",
    imageUrl: null,
    sourceUrl: "#"
  };

  const story = featuredStory || fallbackStory;
  const isFallback = !featuredStory;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-lg">🌟</span>
        <span>Featured Story</span>
      </h2>
      
      <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 md:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-start gap-6">

          {/* Image Block */}
          <div className="w-full md:w-1/3 rounded-xl overflow-hidden shadow-sm bg-black/40 border border-yellow-400/20">
            <img
              src={story.imageUrl || `${process.env.REACT_APP_BACKEND_URL}/static/img/fallbacks/news_default.jpg`}
              alt={story.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.target.src = `${process.env.REACT_APP_BACKEND_URL}/static/img/fallbacks/news_default.jpg`;
              }}
            />
          </div>

          {/* Text Content */}
          <div className="w-full md:w-2/3">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {story.title}
            </h3>

            <p className="text-gray-700 mt-3 text-base leading-relaxed">
              {story.summary}
            </p>

            {/* CTA Row */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
              <a
                href={story.sourceUrl}
                className="inline-block text-center text-white bg-gray-900 hover:bg-black rounded-lg px-4 py-2 text-sm font-semibold shadow"
              >
                Read Full Story
              </a>

              <div className="text-xs text-gray-500 sm:ml-2">
                {isFallback ? (
                  "Editorial • Community & Innovation"
                ) : (
                  <>
                    {story.category}
                    {featuredStory?.publishedAt && (
                      <> • {formatDate(featuredStory.publishedAt)}</>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedStory;
