/**
 * InternalPreviewPage - Private Read-Only Preview
 * 
 * Purpose: Allow trusted reviewers to see app layout and flow
 * without authentication or interaction capabilities.
 * 
 * SECURITY:
 * - noindex, nofollow meta tag
 * - All write actions disabled
 * - No sensitive/private data
 * - URL obscurity gate (V1)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeStyles } from '../utils/themeStyles';
import { handleResponse } from '../utils/fetchHelper';
import { 
  RefreshCw, AlertCircle, Sun, Moon, Home, Newspaper, 
  Users, Building2, ShoppingBag, Tv, BookOpen, Eye, EyeOff
} from 'lucide-react';

const InternalPreviewPage = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const styles = getThemeStyles(isDark);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsData, setNewsData] = useState(null);
  const [showPreviewBanner, setShowPreviewBanner] = useState(true);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${backendUrl}/api/news/homepage`);
      const data = await handleResponse(response);
      setNewsData(data);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Disabled action handler - shows toast/alert that action is disabled
  const handleDisabledAction = (actionName) => {
    // Silent - no action in preview mode
    console.log(`[Preview Mode] Action disabled: ${actionName}`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0C0C0C]' : 'bg-gray-50'}`}>
      {/* SEO - Prevent indexing */}
      <meta name="robots" content="noindex, nofollow" />
      
      {/* Preview Mode Banner */}
      {showPreviewBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span className="font-semibold text-sm">
                PREVIEW MODE — Read-only view for review purposes
              </span>
            </div>
            <button 
              onClick={() => setShowPreviewBanner(false)}
              className="p-1 hover:bg-amber-600 rounded transition-colors"
            >
              <EyeOff size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Header - Simplified, no auth */}
      <header className={`sticky ${showPreviewBanner ? 'top-10' : 'top-0'} z-40 ${isDark ? 'bg-[#0C0C0C]/95 border-b border-white/10' : 'bg-white/95 border-b border-gray-200'} backdrop-blur-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">B</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  BANIBS
                </h1>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Preview Mode
                </p>
              </div>
            </div>
            
            {/* Theme Toggle Only */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Navigation Bar - Visual only, no functional links */}
      <nav className={`${isDark ? 'bg-[#111] border-b border-white/5' : 'bg-gray-100 border-b border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {[
              { icon: Home, label: 'Home', active: true },
              { icon: Newspaper, label: 'News', active: false },
              { icon: Users, label: 'Social', active: false },
              { icon: Building2, label: 'Business', active: false },
              { icon: ShoppingBag, label: 'Marketplace', active: false },
              { icon: Tv, label: 'BANIBS TV', active: false },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleDisabledAction(`Navigate to ${item.label}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-default ${
                  item.active 
                    ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                    : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <RefreshCw className={`animate-spin ${isDark ? 'text-amber-400' : 'text-amber-600'}`} size={24} />
              <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading content...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className={`max-w-2xl mx-auto p-6 rounded-xl ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-500" size={24} />
              <h3 className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                Unable to Load Content
              </h3>
            </div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
            <button
              onClick={fetchNewsData}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Section */}
            {newsData?.hero && (
              <section className="mb-8">
                <div className={`relative rounded-2xl overflow-hidden ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-gray-100 to-gray-200'}`}>
                  {newsData.hero.image_url && (
                    <img 
                      src={newsData.hero.image_url} 
                      alt={newsData.hero.title}
                      className="w-full h-64 md:h-96 object-cover opacity-60"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <span className="inline-block px-3 py-1 bg-amber-500 text-black text-xs font-bold rounded-full mb-3">
                      {newsData.hero.category || 'FEATURED'}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                      {newsData.hero.title}
                    </h2>
                    <p className="text-gray-300 text-sm md:text-base line-clamp-2 max-w-2xl">
                      {newsData.hero.description}
                    </p>
                  </div>
                </div>
              </section>
            )}
            
            {/* Top Stories Grid */}
            <section>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Top Stories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsData?.top_stories?.slice(0, 6).map((story, idx) => (
                  <article 
                    key={story.id || idx}
                    className={`rounded-xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} transition-transform hover:scale-[1.02] cursor-default`}
                    onClick={() => handleDisabledAction('View story')}
                  >
                    {story.image_url && (
                      <img 
                        src={story.image_url} 
                        alt={story.title}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <span className={`text-xs font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        {story.category || 'News'}
                      </span>
                      <h4 className={`text-lg font-semibold mt-1 line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {story.title}
                      </h4>
                      <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {story.description}
                      </p>
                      <div className={`mt-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {story.source} • {story.published_at ? new Date(story.published_at).toLocaleDateString() : 'Recent'}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            
            {/* Section Blocks */}
            {newsData?.sections && Object.entries(newsData.sections).map(([sectionName, items], idx) => (
              <section key={sectionName || idx} className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {sectionName}
                  </h3>
                  <button
                    onClick={() => handleDisabledAction(`View all ${sectionName}`)}
                    className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'} cursor-default`}
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.isArray(items) && items.slice(0, 4).map((item, itemIdx) => (
                    <article 
                      key={item.id || itemIdx}
                      className={`rounded-lg overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} cursor-default`}
                      onClick={() => handleDisabledAction('View item')}
                    >
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-3">
                        <h4 className={`text-sm font-semibold line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {item.title}
                        </h4>
                        <div className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {item.source}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer - Minimal */}
      <footer className={`mt-16 border-t ${isDark ? 'border-white/10 bg-[#0C0C0C]' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <span className="text-sm font-bold text-white">B</span>
              </div>
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
                BANIBS — Preview Mode
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
              This is a read-only preview. All interactions are disabled.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InternalPreviewPage;
