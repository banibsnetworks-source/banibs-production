import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, User, Building2, FileText, TrendingUp } from 'lucide-react';
import SEO from '../components/SEO';

/**
 * BANIBS Global Search Page
 * Phase 1: Placeholder implementation with future structure
 * 
 * Future categories to support:
 * - People (users, profiles)
 * - Businesses (directory)
 * - News / Posts
 * - Rooms (Peoples Rooms)
 * - Opportunities (jobs, grants, etc.)
 */
const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // TODO: When backend search endpoint is ready, call it here
    // Example: fetchSearchResults(query)
    if (query) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => setIsSearching(false), 500);
    }
  }, [query]);

  // Quick access links for manual navigation
  const quickAccessLinks = [
    { 
      name: 'Business Directory', 
      path: '/business-directory', 
      icon: Building2,
      description: 'Browse Black and Indigenous-owned businesses'
    },
    { 
      name: 'BANIBS Social', 
      path: '/portal/social', 
      icon: User,
      description: 'Connect with community members'
    },
    { 
      name: 'News & Information', 
      path: '/', 
      icon: FileText,
      description: 'Latest news and stories'
    },
    { 
      name: 'Opportunities', 
      path: '/opportunities', 
      icon: TrendingUp,
      description: 'Jobs, grants, and scholarships'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={query ? `Search: ${query} - BANIBS` : 'Search - BANIBS'}
        description="Search across the entire BANIBS ecosystem - people, businesses, news, and opportunities."
      />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Search className="w-6 h-6 text-gray-400" />
            <h1 className="text-3xl font-bold text-gray-900">
              {query ? 'Search Results' : 'BANIBS Global Search'}
            </h1>
          </div>
          
          {query && (
            <p className="text-lg text-gray-600">
              Showing results for: <span className="font-semibold text-gray-900">"{query}"</span>
            </p>
          )}
        </div>

        {/* Phase 1: Coming Soon Message */}
        {query ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Global Search is In Development
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                We're building a powerful search engine that will let you find people, businesses, 
                news, opportunities, and more across the entire BANIBS ecosystem. In the meantime, 
                use the quick access links below to explore specific areas.
              </p>
              
              {/* Search query display */}
              <div className="bg-gray-50 rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-500 mb-1">Your search:</p>
                <p className="text-lg font-mono text-gray-900">{query}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Start Your Search
              </h2>
              <p className="text-gray-600">
                Use the search bar at the top to find anything across BANIBS
              </p>
            </div>
          </div>
        )}

        {/* Quick Access Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Access
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {quickAccessLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:border-yellow-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
                        <Icon className="w-6 h-6 text-gray-600 group-hover:text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
                        {link.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Future Search Categories Preview */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-8 text-white">
          <h3 className="text-xl font-semibold mb-4">
            Coming Soon: Unified Search Across
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5" />
              </div>
              <span className="text-sm">People & Profiles</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-sm">Businesses</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-sm">News & Posts</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-sm">Opportunities</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🏠</span>
              </div>
              <span className="text-sm">Peoples Rooms</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">📚</span>
              </div>
              <span className="text-sm">Resources</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
