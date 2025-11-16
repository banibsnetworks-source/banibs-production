import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ConnectLayout from '../../components/connect/ConnectLayout';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { Plus, Briefcase, Eye, Users, Edit, Power, ExternalLink } from 'lucide-react';

/**
 * JobsDashboard - BANIBS Connect Employer Dashboard
 * Phase 7.1: Jobs & Opportunities
 * 
 * Allows business owners to:
 * - View all their job postings
 * - Create new jobs
 * - Edit existing jobs
 * - Toggle open/closed status
 * - View applicants
 */

const JobsDashboard = () => {
  const navigate = useNavigate();
  const { selectedBusinessProfile, isBusinessMode } = useAccountMode();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, closed, draft

  useEffect(() => {
    // Allow access but show setup message if no business profile
    if (isBusinessMode) {
      fetchJobs();
    }
  }, [filter, isBusinessMode]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/mine${statusParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const newStatus = currentStatus === 'open' ? 'closed' : 'open';
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}/status?status=${newStatus}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        fetchJobs(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to toggle job status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || styles.draft}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getEmploymentTypeBadge = (type) => {
    const labels = {
      full_time: 'Full-Time',
      part_time: 'Part-Time',
      contract: 'Contract',
      internship: 'Internship',
      apprenticeship: 'Apprenticeship',
      gig: 'Gig'
    };
    return labels[type] || type;
  };

  // Show business mode setup prompt if not in business mode
  if (!isBusinessMode || !selectedBusinessProfile) {
    return (
      <ConnectLayout>
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <Briefcase className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Switch to Business Mode</h2>
          <p className="text-muted-foreground mb-6">
            To post jobs and manage applications, you need to switch to Business mode.
          </p>
          <div className="bg-muted border border-border rounded-lg p-6 text-left space-y-3">
            <p className="text-sm text-foreground font-medium">How to switch:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click your profile icon in the top-right corner</li>
              <li>Select "Switch to Business Mode" from the dropdown</li>
              <li>Create or select a business profile</li>
              <li>Return here to start posting jobs</li>
            </ol>
          </div>
          <Link
            to="/portal/connect"
            className="inline-block mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium"
          >
            Go to Connect Home
          </Link>
        </div>
      </ConnectLayout>
    );
  }

  return (
    <ConnectLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Job Listings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your job postings and track applicants
            </p>
          </div>
          <Link
            to="/portal/connect/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Post a Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {jobs.filter(j => j.status === 'open').length}
                </p>
                <p className="text-xs text-muted-foreground">Open Positions</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Applicants</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {jobs.reduce((sum, j) => sum + (j.view_count || 0), 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                <p className="text-xs text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-border">
          {['all', 'open', 'closed', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === status
                  ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Job Listings Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium mb-2">No jobs posted yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start hiring by posting your first job opening
              </p>
              <Link
                to="/portal/connect/jobs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Applicants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Views
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.category}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">
                          {getEmploymentTypeBadge(job.employment_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">
                          {job.location_type === 'remote' 
                            ? 'Remote' 
                            : `${job.location_city || ''}, ${job.location_state || ''}`
                          }
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(job.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {job.applicant_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {job.view_count || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/portal/connect/jobs/${job.id}/edit`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Link>
                          <button
                            onClick={() => toggleJobStatus(job.id, job.status)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title={job.status === 'open' ? 'Close job' : 'Open job'}
                          >
                            <Power className={`w-4 h-4 ${
                              job.status === 'open' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-gray-400'
                            }`} />
                          </button>
                          <a
                            href={`/portal/social/jobs/${job.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            title="View on Social"
                          >
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ConnectLayout>
  );
};

export default JobsDashboard;
