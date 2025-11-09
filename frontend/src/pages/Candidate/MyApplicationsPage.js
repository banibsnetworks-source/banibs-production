import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${BACKEND_URL}/api/applications/mine`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to load applications');
      }

      const data = await res.json();
      // Handle both array and paginated response
      const apps = Array.isArray(data) ? data : (data.applications || data.items || []);
      setApplications(apps);
    } catch (err) {
      console.error(err);
      setError("Unable to load your applications");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  const filteredApplications = statusFilter === "all" 
    ? applications 
    : applications.filter(app => app.status === statusFilter);

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-white">Loading applications...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-slate-300">
            Track the status of your job applications
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-slate-300 font-medium">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">In Review</option>
            <option value="interviewing">Interviewing</option>
            <option value="offered">Offers</option>
            <option value="rejected">Not Selected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
          <span className="text-slate-400 text-sm ml-auto">
            {filteredApplications.length} {filteredApplications.length === 1 ? 'application' : 'applications'}
          </span>
        </div>

        {/* Applications List */}
        {sortedApplications.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-12 text-center">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              {statusFilter === "all" ? "No Applications Yet" : "No Applications Found"}
            </h3>
            <p className="text-slate-400 mb-6">
              {statusFilter === "all" 
                ? "Start browsing opportunities and apply to positions that interest you"
                : `You don't have any ${STATUS_LABELS[statusFilter] || statusFilter} applications`
              }
            </p>
            <Link
              to="/opportunities"
              className="inline-block px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
            >
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedApplications.map(app => (
              <div
                key={app.id}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <Link
                      to={`/jobs/${app.job_id}`}
                      className="text-xl font-semibold text-white hover:text-yellow-400 transition"
                    >
                      {app.job_title || 'Unknown Position'}
                    </Link>
                    <p className="text-slate-300 mt-1">
                      {app.employer_name || 'Unknown Employer'}
                    </p>
                    {app.job_location && (
                      <p className="text-sm text-slate-400 mt-1">
                        📍 {app.job_location}
                      </p>
                    )}
                  </div>

                  {/* Status & Date */}
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={app.status} />
                    <div className="text-sm text-slate-400">
                      <div>Applied: {formatDate(app.created_at)}</div>
                      {app.updated_at && app.updated_at !== app.created_at && (
                        <div className="text-xs">Updated: {formatDate(app.updated_at)}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cover Letter Preview */}
                {app.cover_letter && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Cover Letter:</p>
                    <p className="text-slate-300 text-sm line-clamp-2">
                      {app.cover_letter}
                    </p>
                  </div>
                )}

                {/* Recruiter Notes (if any) */}
                {app.recruiter_notes && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-400 mb-2">Recruiter Notes:</p>
                    <p className="text-slate-300 text-sm">
                      {app.recruiter_notes}
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
}

export default MyApplicationsPage;
