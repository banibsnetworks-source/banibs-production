import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Check, X, Eye } from 'lucide-react';
import GlobalNavBar from '../../components/GlobalNavBar';

/**
 * AdminSocialReportsPage - Phase 8.3.1
 * Admin interface for reviewing and moderating reported posts
 */
const AdminSocialReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actioningReportId, setActioningReportId] = useState(null);

  useEffect(() => {
    loadReports();
    loadStats();
  }, [statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/social/reports?status=${statusFilter}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load reports');
      }

      const data = await response.json();
      setReports(data.items || []);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/social/reports/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleResolveReport = async (reportId, action, reasonText) => {
    setActioningReportId(reportId);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/social/reports/${reportId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            action,
            resolution_note: `Action: ${action} - ${reasonText || 'No additional notes'}`
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to resolve report');
      }

      // Reload reports and stats
      await loadReports();
      await loadStats();
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('Failed to resolve report. Please try again.');
    } finally {
      setActioningReportId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReasonLabel = (code) => {
    const labels = {
      spam: 'Spam/Scam',
      abuse: 'Harassment/Abuse',
      misinfo: 'Misinformation',
      other: 'Other'
    };
    return labels[code] || code;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <GlobalNavBar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="text-yellow-500" size={32} />
            <h1 className="text-3xl font-bold text-white">Social Moderation</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Review and manage reported posts from the BANIBS community
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase mb-1">Kept</p>
              <p className="text-2xl font-bold text-green-500">{stats.kept}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase mb-1">Hidden</p>
              <p className="text-2xl font-bold text-red-500">{stats.hidden}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-xs text-gray-400 uppercase mb-1">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {['pending', 'kept', 'hidden', 'all'].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === filter
                    ? 'bg-yellow-500 text-gray-900'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={loadReports}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin text-yellow-500 mx-auto mb-3" size={32} />
            <p className="text-gray-400">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
            <Eye className="mx-auto mb-3 text-gray-600" size={48} />
            <h3 className="text-lg font-semibold text-white mb-2">
              No {statusFilter} reports
            </h3>
            <p className="text-gray-400 text-sm">
              {statusFilter === 'pending'
                ? 'All caught up! No pending reports to review.'
                : `No reports with status "${statusFilter}".`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-800 rounded-xl border border-gray-700 p-4"
              >
                {/* Report Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      report.reason_code === 'spam' ? 'bg-orange-500/20 text-orange-400' :
                      report.reason_code === 'abuse' ? 'bg-red-500/20 text-red-400' :
                      report.reason_code === 'misinfo' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {getReasonLabel(report.reason_code)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      Reported {formatDate(report.created_at)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    report.status === 'kept' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                </div>

                {/* Post Content */}
                {report.post && (
                  <div className="bg-gray-900 rounded-lg p-3 mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs text-white font-bold">
                        {report.post.author?.display_name?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm text-white font-medium">
                        {report.post.author?.display_name || 'Unknown User'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{report.post.text}</p>
                  </div>
                )}

                {/* Report Details */}
                {report.reason_text && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">Reporter's note:</p>
                    <p className="text-sm text-gray-300 italic">"{report.reason_text}"</p>
                  </div>
                )}

                {/* Actions */}
                {report.status === 'pending' && (
                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700">
                    <button
                      onClick={() => handleResolveReport(report.id, 'keep', report.reason_code)}
                      disabled={actioningReportId === report.id}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} />
                      <span>Keep Post</span>
                    </button>
                    <button
                      onClick={() => handleResolveReport(report.id, 'hide', report.reason_code)}
                      disabled={actioningReportId === report.id}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} />
                      <span>Hide Post</span>
                    </button>
                  </div>
                )}

                {/* Resolution Info */}
                {report.status !== 'pending' && report.resolved_at && (
                  <div className="pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                      Resolved {formatDate(report.resolved_at)}
                      {report.resolution_note && ` - ${report.resolution_note}`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSocialReportsPage;
