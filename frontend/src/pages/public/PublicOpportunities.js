import React, { useState, useEffect } from 'react';
import { opportunitiesAPI } from '../../services/api';
import OpportunityCard from '../../components/OpportunityCard';
import Leaderboard from '../../components/Leaderboard';
import NewsletterSubscribe from '../../components/NewsletterSubscribe';

const PublicOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [featuredOpportunities, setFeaturedOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, job, grant, scholarship, training

  useEffect(() => {
    loadOpportunities();
  }, [filter]);

  const loadOpportunities = async () => {
    setLoading(true);
    setError('');

    try {
      // Load featured opportunities (always show regardless of filter)
      const featuredResponse = await opportunitiesAPI.getFeatured();
      setFeaturedOpportunities(featuredResponse.data);

      // Load all approved opportunities
      const allResponse = await opportunitiesAPI.getAll(filter === 'all' ? null : filter);
      setOpportunities(allResponse.data);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setError('Failed to load opportunities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterButtons = [
    { value: 'all', label: 'All', icon: '🌐' },
    { value: 'job', label: 'Jobs', icon: '💼' },
    { value: 'grant', label: 'Grants', icon: '💰' },
    { value: 'scholarship', label: 'Scholarships', icon: '🎓' },
    { value: 'training', label: 'Training', icon: '📚' },
    { value: 'event', label: 'Events', icon: '📅' }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b-2 border-[#FFD700] shadow-[0_2px_20px_rgba(255,215,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold text-[#FFD700]">
                BANIBS
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Opportunities Directory
              </p>
            </div>
            
            <a
              href="/"
              className="px-4 py-2 bg-[#1a1a1a] border border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all text-sm"
            >
              ← Home
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Section */}
            {!loading && featuredOpportunities.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">⭐</span>
                  <h2 className="text-3xl font-bold text-white">
                    Featured Opportunities
                  </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredOpportunities.map((opportunity) => (
                <div key={opportunity.id} className="relative">
                  {/* Featured Badge */}
                  <div className="absolute -top-2 -right-2 z-10 bg-[#FFD700] text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    ⭐ FEATURED
                  </div>
                  <OpportunityCard opportunity={opportunity} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`px-6 py-3 font-bold rounded-lg transition-all ${
                  filter === btn.value
                    ? 'bg-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.5)]'
                    : 'bg-[#1a1a1a] border border-[#FFD700]/30 text-white hover:border-[#FFD700]'
                }`}
              >
                <span className="mr-2">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700] border-t-transparent"></div>
            <p className="text-[#FFD700] text-xl mt-4">
              Loading opportunities...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && opportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No opportunities found
              </h3>
              <p className="text-gray-400 mb-6">
                {filter === 'all' 
                  ? 'There are no opportunities available at this time.'
                  : `No ${filter} opportunities available. Try a different category.`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="px-6 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all"
                >
                  View All Opportunities
                </button>
              )}
            </div>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && opportunities.length > 0 && (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">
              {filter === 'all' ? 'All Opportunities' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Opportunities`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>

            {/* Count */}
            <div className="mt-8 text-center text-gray-400 text-sm">
              Showing {opportunities.length} opportunity
              {opportunities.length !== 1 && 'ies'}
            </div>
          </>
        )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Phase 4.4 - Leaderboard */}
              <Leaderboard limit={5} />
            </div>
          </div>
        </div>
      </main>

      {/* Phase 4.2 - Newsletter Subscribe */}
      <NewsletterSubscribe />

      {/* Footer */}
      <footer className="bg-black border-t-2 border-[#FFD700] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 BANIBS. All opportunities are human-reviewed and curated.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicOpportunities;
