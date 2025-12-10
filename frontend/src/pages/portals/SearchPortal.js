import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/SEO';
import { Search, Lock, Zap } from 'lucide-react';

/**
 * SearchPortal - Phase 8.2
 * BANIBS Search Portal (Subscriber-only, Phase 8.3)
 */
const SearchPortal = () => {
  const { user, isAuthenticated } = useAuth();
  const isSubscriber = false; // TODO: Check subscription tier in Phase 8.3

  return (
    <div className="min-h-screen bg-gray-950">
      <SEO
        title="BANIBS Search - Private Search Engine"
        description="Access the BANIBS private search engine for members and subscribers."
      />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          {/* Lock Icon */}
          <div className="w-24 h-24 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-blue-800">
            <Lock className="text-blue-400" size={48} />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            BANIBS Search Portal
          </h1>

          {!isAuthenticated ? (
            <>
              <p className="text-xl text-gray-300 mb-8">
                Private search engine for BANIBS subscribers
              </p>
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-8">
                <p className="text-gray-400 mb-6">
                  Sign in to learn more about BANIBS Search and how to access this subscriber-exclusive feature.
                </p>
                <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors">
                  Sign In to Learn More
                </button>
              </div>
            </>
          ) : !isSubscriber ? (
            <>
              <p className="text-xl text-gray-300 mb-8">
                Upgrade to access BANIBS Search
              </p>
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-8">
                <div className="flex items-start space-x-4 mb-6">
                  <Zap className="text-yellow-400 flex-shrink-0" size={24} />
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white mb-2">Premium Search Features</h3>
                    <ul className="text-gray-400 space-y-2 text-sm">
                      <li>• Private, ad-free search engine</li>
                      <li>• Advanced filters and saved searches</li>
                      <li>• Community-curated results</li>
                      <li>• No tracking or data selling</li>
                    </ul>
                  </div>
                </div>
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Upgrade to Unlock Search
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
              <Search className="mx-auto mb-4 text-blue-400" size={48} />
              <p className="text-gray-300 mb-4">
                BANIBS Search Engine launching in Phase 8.3
              </p>
              <p className="text-sm text-gray-500">
                You'll have full access as a subscriber once this feature is live.
              </p>
            </div>
          )}

          {/* Privacy Promise */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Our Search Privacy Promise</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div>
                <span className="text-green-400 font-semibold">✓</span> No tracking
              </div>
              <div>
                <span className="text-green-400 font-semibold">✓</span> No ads
              </div>
              <div>
                <span className="text-green-400 font-semibold">✓</span> No data selling
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPortal;