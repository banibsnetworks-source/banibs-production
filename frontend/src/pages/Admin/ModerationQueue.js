import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function ModerationQueue() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchModerationItems();
    fetchStats();
  }, [filter]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/moderation/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchModerationItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const url = `${BACKEND_URL}/api/admin/moderation?status=${filter}&limit=100`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please login.');
        } else if (response.status === 403) {
          throw new Error('Insufficient permissions. Admin or moderator role required.');
        }
        throw new Error('Failed to fetch moderation items');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (modId) => {
    setActionLoading(modId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/moderation/${modId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to approve item');
      }

      // Refresh list and stats
      await fetchModerationItems();
      await fetchStats();
    } catch (err) {
      alert(`Error approving item: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (modId) => {
    if (!window.confirm('Are you sure you want to reject this item?')) {
      return;
    }

    setActionLoading(modId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${BACKEND_URL}/api/admin/moderation/${modId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reject item');
      }

      // Refresh list and stats
      await fetchModerationItems();
      await fetchStats();
    } catch (err) {
      alert(`Error rejecting item: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getSentimentColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">BANIBS Admin</h1>
              <p className="text-gray-400 mt-1">Content Moderation Queue</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-4">
            <Link
              to="/admin/opportunities"
              className="px-4 py-2 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all text-sm"
            >
              Opportunities
            </Link>
            <Link
              to="/admin/moderation"
              className="px-4 py-2 text-yellow-500 font-semibold rounded-lg hover:bg-gray-800 transition-all text-sm border-b-2 border-yellow-500 relative"
            >
              Moderation
              {stats.pending > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {stats.pending}
                </span>
              )}
            </Link>
            <Link
              to="/admin/analytics/sentiment"
              className="px-4 py-2 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all text-sm"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm font-semibold mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm font-semibold mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm font-semibold mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="text-gray-400 text-sm font-semibold mb-1">Total</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex gap-2">
            {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === status
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="text-gray-400 mt-4">Loading moderation queue...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Items List */}
        {!loading && !error && (
          <>
            {items.length === 0 ? (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-400 text-lg">
                  No {filter.toLowerCase()} items in the moderation queue.
                </p>
                {filter === 'PENDING' && (
                  <p className="text-gray-500 text-sm mt-2">
                    Items will appear here when negative content is detected (sentiment score ≤ -0.5)
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Content
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Sentiment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        {filter === 'PENDING' && (
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                        {(filter === 'APPROVED' || filter === 'REJECTED') && (
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Reviewed
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-white font-medium line-clamp-2">{item.title}</div>
                            <div className="text-gray-500 text-sm mt-1">ID: {item.content_id}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                              {item.content_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getSentimentColor(item.sentiment_label)}`}>
                              {item.sentiment_label || 'N/A'}
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                              Score: {item.sentiment_score?.toFixed(2) || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300 text-sm">{item.reason}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-400 text-sm">{formatDate(item.created_at)}</span>
                          </td>
                          {filter === 'PENDING' && (
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  disabled={actionLoading === item.id}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === item.id ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  disabled={actionLoading === item.id}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === item.id ? 'Processing...' : 'Reject'}
                                </button>
                              </div>
                            </td>
                          )}
                          {(filter === 'APPROVED' || filter === 'REJECTED') && (
                            <td className="px-6 py-4">
                              <div className="text-gray-400 text-sm">{formatDate(item.reviewed_at)}</div>
                              <div className="text-gray-500 text-xs mt-1">By: {item.reviewed_by || 'N/A'}</div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info Panel */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">ℹ️ Mode A: Shadow Moderation</h3>
          <p className="text-gray-300 text-sm">
            Content remains visible to public users while in the moderation queue. 
            Approve/reject actions are for audit and record-keeping purposes only. 
            Items are automatically flagged when sentiment score is ≤ -0.5.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ModerationQueue;
