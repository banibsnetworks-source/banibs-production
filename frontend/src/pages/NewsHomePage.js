import React, { useState, useEffect } from 'react';
import GlobalNavBar from '../components/GlobalNavBar';
import NewsNavigationBar from '../components/NewsNavigationBar';
import NewsHeroSection from '../components/NewsHeroSection';
import TopStoriesGrid from '../components/TopStoriesGrid';
import NewsSectionBlock from '../components/NewsSectionBlock';
import BanibsTVCard from '../components/BanibsTVCard';
import TrendingPanel from '../components/TrendingPanel';
import SentimentSummaryBar from '../components/SentimentSummaryBar';
import BanibsTVTrendingRail from '../components/BanibsTVTrendingRail';
import SEO from '../components/SEO';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { handleResponse } from '../utils/fetchHelper';

/**
 * NewsHomePage - CNN-Style News Homepage
 * Main landing page for BANIBS with multi-column news layout
 * Uses /api/news/homepage endpoint for structured data
 */
const NewsHomePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getThemeStyles(isDark);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchNewsData();
  }, []);

  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/api/news/homepage`);
      
      if (!response.ok) {
        // Extract error message safely without consuming body twice
        let errorMessage = `Failed to fetch news: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setNewsData(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <GlobalNavBar />
        <NewsNavigationBar activeSection="top-stories" />
        
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center space-x-3 text-gray-400">
            <RefreshCw className="animate-spin" size={24} />
            <span className="text-lg">Loading latest news...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950">
        <GlobalNavBar />
        <NewsNavigationBar activeSection="top-stories" />
        
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Unable to Load News</h3>
            </div>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={fetchNewsData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { hero, top_stories, sections, banibs_tv, trending, sentiment_summary } = newsData || {};

  return (
    <div className="min-h-screen" style={styles.page}>
      <SEO
        title="BANIBS - Black America News Network"
        description="Your trusted source for Black and Indigenous community news, business, opportunities, and resources. Stay informed with BANIBS."
        keywords="Black news, Indigenous news, community news, Black business, opportunities, BANIBS"
      />

      <GlobalNavBar />
      <NewsNavigationBar activeSection="top-stories" />

      <main className="container mx-auto px-4 py-8">
        {/* 12-Column Grid Layout: 8 columns main + 4 columns sidebar */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content Area (8 columns) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Hero Story */}
            {hero && <NewsHeroSection story={hero} />}

            {/* Top Stories Grid */}
            {top_stories && top_stories.length > 0 && (
              <TopStoriesGrid stories={top_stories} />
            )}

            {/* Section Blocks */}
            {sections && (
              <div className="space-y-8">
                {sections.us && sections.us.length > 0 && (
                  <NewsSectionBlock
                    title="U.S. News"
                    stories={sections.us}
                    icon="🇺🇸"
                  />
                )}

                {sections.world && sections.world.length > 0 && (
                  <NewsSectionBlock
                    title="World News"
                    stories={sections.world}
                    icon="🌍"
                  />
                )}

                {sections.business && sections.business.length > 0 && (
                  <NewsSectionBlock
                    title="Business & MoneyWatch"
                    stories={sections.business}
                    icon="💼"
                  />
                )}

                {sections.tech && sections.tech.length > 0 && (
                  <NewsSectionBlock
                    title="Science & Technology"
                    stories={sections.tech}
                    icon="🔬"
                  />
                )}

                {sections.sports && sections.sports.length > 0 && (
                  <NewsSectionBlock
                    title="Sports"
                    stories={sections.sports}
                    icon="⚽"
                  />
                )}
              </div>
            )}

            {/* Empty State */}
            {(!hero && (!top_stories || top_stories.length === 0)) && (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg mb-4">
                  No news stories available at the moment.
                </p>
                <button
                  onClick={fetchNewsData}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* Right Rail (4 columns) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-32 space-y-6">
              {/* BANIBS TV Card */}
              <BanibsTVCard media={banibs_tv} />
              
              {/* Phase 7.6.4 - BANIBS TV Trending Rail */}
              {/* <BanibsTVTrendingRail items={tv_trending?.items || []} /> */}
              
              {/* Phase 7.6.4 - Trending Panel */}
              {trending && <TrendingPanel trending={trending} title="Trending Now" />}
              
              {/* Phase 7.6.4 - Sentiment Summary */}
              {sentiment_summary && (
                <SentimentSummaryBar summary={sentiment_summary} title="News Sentiment" />
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400 text-sm">
            <p>&copy; 2025 BANIBS. All rights reserved.</p>
            <p className="mt-2">Black America News, Information, Business & Social Network</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewsHomePage;
