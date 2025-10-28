import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { opportunitiesAPI } from '../../services/api';
import AdminOpportunityCard from '../../components/admin/AdminOpportunityCard';

const AdminOpportunitiesDashboard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, approved, featured
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  
  // Advanced filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [contributorFilter, setContributorFilter] = useState('');

  const { user, logout } = useAuth();

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await opportunitiesAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const loadOpportunities = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await opportunitiesAPI.getPending();
      const allOpps = response.data;

      // Filter based on current tab
      let filtered = allOpps;
      if (filter === 'pending') {
        filtered = allOpps.filter(opp => !opp.approved);
      } else if (filter === 'approved') {
        filtered = allOpps.filter(opp => opp.approved && !opp.featured);
      } else if (filter === 'featured') {
        filtered = allOpps.filter(opp => opp.featured);
      }

      // Apply type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(opp => opp.type === typeFilter);
      }

      // Apply contributor filter
      if (contributorFilter.trim()) {
        filtered = filtered.filter(opp => 
          opp.contributorEmail?.toLowerCase().includes(contributorFilter.toLowerCase())
        );
      }

      setOpportunities(filtered);
    } catch (err) {
      console.error('Error loading opportunities:', err);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadOpportunities();
  }, [filter, typeFilter, contributorFilter]);

  const handleUpdate = () => {
    // Reload opportunities and analytics after any action
    loadOpportunities();
    loadAnalytics();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b-2 border-[#FFD700] sticky top-0 z-50 shadow-[0_2px_20px_rgba(255,215,0,0.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-[#FFD700]">
                BANIBS Admin
              </h1>
              <p className="text-gray-400 text-sm">
                Moderation Dashboard
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white text-sm font-medium">
                  {user?.email}
                </p>
                <p className="text-gray-400 text-xs capitalize">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Panel */}
        {!loadingAnalytics && analytics && (
          <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status Counts */}
            <div className="bg-[#1a1a1a] border-2 border-[#FFD700]/30 rounded-lg p-4">
              <div className="text-[#FFD700] text-sm font-medium mb-1">⏳ Pending</div>
              <div className="text-white text-3xl font-bold">{analytics.statusCounts.pending}</div>
            </div>
            <div className="bg-[#1a1a1a] border-2 border-green-500/30 rounded-lg p-4">
              <div className="text-green-400 text-sm font-medium mb-1">✅ Approved</div>
              <div className="text-white text-3xl font-bold">{analytics.statusCounts.approved}</div>
            </div>
            <div className="bg-[#1a1a1a] border-2 border-red-500/30 rounded-lg p-4">
              <div className="text-red-400 text-sm font-medium mb-1">❌ Rejected</div>
              <div className="text-white text-3xl font-bold">{analytics.statusCounts.rejected}</div>
            </div>
            <div className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-lg p-4 shadow-[0_0_10px_rgba(255,215,0,0.3)]">
              <div className="text-[#FFD700] text-sm font-medium mb-1">⭐ Featured</div>
              <div className="text-white text-3xl font-bold">{analytics.statusCounts.featured}</div>
            </div>
            
            {/* Type Counts */}
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-medium mb-1">💼 Jobs</div>
              <div className="text-white text-2xl font-bold">{analytics.typeCounts.job}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-medium mb-1">💰 Grants</div>
              <div className="text-white text-2xl font-bold">{analytics.typeCounts.grant}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-medium mb-1">🎓 Scholarships</div>
              <div className="text-white text-2xl font-bold">{analytics.typeCounts.scholarship}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-medium mb-1">📚 Training</div>
              <div className="text-white text-2xl font-bold">{analytics.typeCounts.training}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-4">
              <div className="text-gray-400 text-sm font-medium mb-1">📅 Events</div>
              <div className="text-white text-2xl font-bold">{analytics.typeCounts.event}</div>
            </div>
          </div>
        )}

        {/* Filter Controls */}
        <div className="mb-6 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Filter by Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
              >
                <option value="all">All Types</option>
                <option value="job">💼 Jobs</option>
                <option value="grant">💰 Grants</option>
                <option value="scholarship">🎓 Scholarships</option>
                <option value="training">📚 Training</option>
                <option value="event">📅 Events</option>
              </select>
            </div>

            {/* Contributor Filter */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Filter by Contributor
              </label>
              <input
                type="text"
                placeholder="Search by email..."
                value={contributorFilter}
                onChange={(e) => setContributorFilter(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all placeholder-gray-500"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setTypeFilter('all');
                  setContributorFilter('');
                }}
                className="w-full px-4 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-medium rounded-lg hover:bg-[#FFD700]/20 transition-all"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b-2 border-[#FFD700]/20">
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 font-bold transition-all ${
              filter === 'pending'
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-3 font-bold transition-all ${
              filter === 'approved'
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ✅ Approved
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-6 py-3 font-bold transition-all ${
              filter === 'featured'
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⭐ Featured
          </button>
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
            <div className="text-[#FFD700] text-xl">
              Loading opportunities...
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && opportunities.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-black border-2 border-[#FFD700]/30 rounded-lg p-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No {filter} opportunities
              </h3>
              <p className="text-gray-400">
                There are currently no opportunities in this category.
              </p>
            </div>
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && opportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opportunity) => (
              <AdminOpportunityCard
                key={opportunity.id}
                opportunity={opportunity}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!loading && opportunities.length > 0 && (
          <div className="mt-8 text-center text-gray-400 text-sm">
            Showing {opportunities.length} {filter} opportunity
            {opportunities.length !== 1 && 'ies'}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminOpportunitiesDashboard;
