import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import GlobalNavBar from '../components/GlobalNavBar';
import NewsNavigationBar from '../components/NewsNavigationBar';
import NewsHeroSection from '../components/NewsHeroSection';
import TopStoriesGrid from '../components/TopStoriesGrid';
import NewsSectionBlock from '../components/NewsSectionBlock';
import BanibsTVCard from '../components/BanibsTVCard';
import TrendingPanel from '../components/TrendingPanel';
import SentimentSummaryBar from '../components/SentimentSummaryBar';
import MoodFilterBar from '../components/MoodFilterBar';
import SEO from '../components/SEO';
import { AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { isValidSection, getSectionLabel, getSectionIcon } from '../constants/sectionKeys';
import { useTheme } from '../contexts/ThemeContext';

/**
 * NewsSectionPage - Section-Specific News Feed
 * Phase 7.6.3 - Displays filtered news for specific sections
 * Routes: /news/us, /news/world, /news/business, etc.
 */
const NewsSectionPage = () => {
  const { section } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sectionData, setSectionData] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Get page and mood filter from URL params
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentMood = searchParams.get('sentiment') || 'all';

  useEffect(() => {
    // Validate section
    if (!isValidSection(section)) {
      setError(`Invalid section: ${section}`);
      setLoading(false);
      return;
    }

    fetchSectionData();
  }, [section, currentPage, currentMood]);

  const fetchSectionData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Build URL with optional sentiment filter (Phase 7.6.5)
      let url = `${backendUrl}/api/news/section?section=${section}&page=${currentPage}&page_size=20`;
      if (currentMood && currentMood !== 'all') {
        url += `&sentiment=${currentMood}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch section news: ${response.status}`);
      }

      const data = await response.json();
      setSectionData(data);
    } catch (err) {
      console.error('Error fetching section news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodChange = (mood) => {
    const params = { page: '1' }; // Reset to page 1 when changing mood
    if (mood !== 'all') {
      params.sentiment = mood;
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNavBar />
        <NewsNavigationBar activeSection={section} />

        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center space-x-3 text-muted-foreground">
            <RefreshCw className="animate-spin" size={24} />
            <span className="text-lg">Loading {getSectionLabel(section)} news...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <GlobalNavBar />
        <NewsNavigationBar activeSection={section} />

        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 text-red-400 mb-4">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Unable to Load Section</h3>
            </div>
            <p className="text-card-foreground mb-4">{error}</p>
            <button
              onClick={fetchSectionData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    label,
    lead_story,
    featured,
    items,
    page,
    page_size,
    total_items,
    total_pages,
    trending,
    sentiment_summary,
  } = sectionData || {};

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${label} - BANIBS News`}
        description={`Latest ${label} news from BANIBS. Stay informed with comprehensive coverage of Black and Indigenous community news.`}
        keywords={`${label}, Black news, Indigenous news, BANIBS, community news`}
      />

      <GlobalNavBar />
      <NewsNavigationBar activeSection={section} />

      <main className="container mx-auto px-4 py-8">
        {/* Section Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-4xl">{getSectionIcon(section)}</span>
            <h1 className="text-4xl font-bold text-foreground">{label}</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Page {page} of {total_pages} • {total_items} stories
          </p>
        </header>

        {/* 12-Column Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Content Area (8 columns) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Phase 7.6.5 - Mood Filter Bar */}
            <MoodFilterBar
              activeMood={currentMood}
              onMoodChange={handleMoodChange}
              itemCount={total_items}
            />

            {/* Lead Story (Hero) */}
            {lead_story && <NewsHeroSection story={lead_story} />}

            {/* Featured Stories Grid */}
            {featured && featured.length > 0 && page === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span>Featured in {label}</span>
                  <div className="h-1 flex-1 bg-gradient-to-r from-yellow-500 to-transparent ml-4 rounded-full"></div>
                </h2>
                <TopStoriesGrid stories={featured} />
              </div>
            )}

            {/* Section Stories List */}
            {items && items.length > 0 && (
              <NewsSectionBlock
                title={`Latest ${label} Stories`}
                stories={items}
                icon={getSectionIcon(section)}
              />
            )}

            {/* Empty State */}
            {(!items || items.length === 0) && (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg mb-4">
                  No stories available in this section at the moment.
                </p>
                <Link
                  to="/"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block"
                >
                  Back to Homepage
                </Link>
              </div>
            )}

            {/* Pagination */}
            {total_pages > 1 && (
              <div className="flex items-center justify-center space-x-2 py-8">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors
                    ${
                      page === 1
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }
                  `}
                >
                  <ChevronLeft size={20} />
                  <span>Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-2">
                  {[...Array(Math.min(total_pages, 5))].map((_, idx) => {
                    let pageNum;
                    if (total_pages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= total_pages - 2) {
                      pageNum = total_pages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`
                          px-4 py-2 rounded-md font-medium transition-colors
                          ${
                            page === pageNum
                              ? 'bg-yellow-500 text-gray-900'
                              : 'bg-gray-700 text-white hover:bg-gray-600'
                          }
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === total_pages}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors
                    ${
                      page === total_pages
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }
                  `}
                >
                  <span>Next</span>
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Right Rail (4 columns) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-32 space-y-6">
              {/* BANIBS TV Card */}
              <BanibsTVCard />

              {/* Phase 7.6.4 - Trending in This Section */}
              {trending && (
                <TrendingPanel
                  trending={trending}
                  title={`Trending in ${label}`}
                  compact
                />
              )}

              {/* Phase 7.6.4 - Section Sentiment Summary */}
              {sentiment_summary && (
                <SentimentSummaryBar
                  summary={sentiment_summary}
                  title={`Sentiment in ${label}`}
                />
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

export default NewsSectionPage;
