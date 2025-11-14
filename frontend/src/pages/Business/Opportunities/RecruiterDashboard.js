import React, { useEffect, useState } from "react";
import RecruiterJobsFilters from "./RecruiterJobsFilters";
import { useNavigate } from "react-router-dom";
import { getRecruiterOverview, getRecruiterJobStats } from "../../../api/analytics";
import EmptyState from "../../../components/EmptyState";
import SEO from "../../../components/SEO";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    q: "",
    status: "",
    has_applications: false,
  });

  const [jobs, setJobs] = useState([]);
  const [pageInfo, setPageInfo] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Analytics state - Phase 7.1 Cycle 1.4
  const [overview, setOverview] = useState(null);
  const [jobStats, setJobStats] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  async function fetchJobs(customPage) {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const page = customPage || pageInfo.page || 1;
      params.set("page", page.toString());
      params.set("limit", pageInfo.limit.toString());

      if (filters.q) params.set("q", filters.q);
      if (filters.status) params.set("status", filters.status);
      if (filters.has_applications) params.set("has_applications", "true");

      const res = await fetch(`${BACKEND_URL}/api/jobs/mine?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!res.ok) {
        throw new Error(`Failed to load jobs: ${res.status}`);
      }
      const data = await res.json();

      const items = data.jobs || data.items || data;
      setJobs(items);
      if (data.total !== undefined) {
        setPageInfo((prev) => ({
          ...prev,
          page,
          total: data.total,
          limit: data.limit || prev.limit,
        }));
      } else {
        setPageInfo((prev) => ({ ...prev, page }));
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load your jobs right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs(1);
  }, [filters]);

  // Load analytics data - Phase 7.1 Cycle 1.4
  useEffect(() => {
    async function loadAnalytics() {
      try {
        setAnalyticsLoading(true);
        const token = localStorage.getItem("access_token");
        
        const [overviewData, statsData] = await Promise.all([
          getRecruiterOverview(token),
          getRecruiterJobStats(token)
        ]);
        
        setOverview(overviewData);
        setJobStats(statsData);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        // Don't show error to user - analytics are non-critical
      } finally {
        setAnalyticsLoading(false);
      }
    }
    
    loadAnalytics();
  }, []);

  function handleFiltersChange(next) {
    setFilters(next);
  }

  function handleFiltersReset() {
    setFilters({
      q: "",
      status: "",
      has_applications: false,
    });
  }

  function handlePageChange(nextPage) {
    if (nextPage < 1) return;
    const maxPage =
      pageInfo.total && pageInfo.limit
        ? Math.ceil(pageInfo.total / pageInfo.limit)
        : null;
    if (maxPage && nextPage > maxPage) return;
    fetchJobs(nextPage);
  }

  function handleCreateJob() {
    // TODO: navigate to job create form or open modal
    alert("Job creation UI not implemented yet. Placeholder action.");
  }

  async function handleEditJob(jobId) {
    // could navigate to edit page or open modal
    navigate(`/opportunities/dashboard/edit/${jobId}`);
  }

  async function handleCloseJob(jobId) {
    // Simple PATCH example; adjust to your API
    if (!window.confirm("Mark this job as closed?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`, {
        method: "PATCH",
        credentials: 'include',
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ status: "closed" }),
      });
      if (!res.ok) {
        throw new Error("Failed to close job");
      }
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Unable to close job right now.");
    }
  }

  async function handleDeleteJob(jobId) {
    if (!window.confirm("Permanently delete this job?")) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/jobs/${jobId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (!res.ok) {
        throw new Error("Failed to delete job");
      }
      fetchJobs();
    } catch (err) {
      console.error(err);
      alert("Unable to delete job right now.");
    }
  }

  const hasPagination =
    pageInfo.total && pageInfo.limit && pageInfo.total > pageInfo.limit;

  return (
    <main className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      <SEO 
        title="BANIBS Recruiter Dashboard - Manage Job Postings"
        description="Post jobs, review applications, and connect with talented candidates in the BANIBS opportunities network."
      />
      {/* Header */}
      <header className="mb-4 md:mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            Recruiter Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
            Manage your opportunities, track applications, and refine your
            reach. Open to all, rooted in Black advancement.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateJob}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          + Create New Job
        </button>
      </header>

      {/* Analytics Summary Strip - Phase 7.1 Cycle 1.4 */}
      {!analyticsLoading && overview && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {[
            { label: "Total Jobs", value: overview.total_jobs, color: "slate" },
            { label: "Active Jobs", value: overview.active_jobs, color: "emerald" },
            { label: "Total Applications", value: overview.total_applications, color: "blue" },
            { label: "Last 30 Days", value: overview.applications_last_30_days, color: "purple" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {item.value}
              </div>
              <div className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Loading State */}
      {analyticsLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl backdrop-blur-lg bg-white/60 dark:bg-slate-800/60 shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-4 text-center animate-pulse"
            >
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Filters strip */}
      <RecruiterJobsFilters
        filters={filters}
        onChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Content card */}
      <section
        className="
          mt-3
          backdrop-blur-xl bg-white/80 dark:bg-slate-900/80
          border border-slate-200/70 dark:border-slate-700/70
          rounded-3xl shadow-sm p-3 md:p-4
        "
      >
        {loading && (
          <p className="text-sm text-slate-500">Loading your jobs…</p>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 mb-3">
            {error}
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <EmptyState
            title="No jobs posted yet"
            description="Create your first opportunity to start receiving applications from qualified BANIBS candidates. Open to all, rooted in Black advancement."
            actionLabel="Post a Job"
            onAction={handleCreateJob}
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        )}

        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="space-y-3">
              {jobs.map((job) => (
                <article
                  key={job.id}
                  className="
                    flex flex-col md:flex-row md:items-center md:justify-between gap-3
                    rounded-2xl border border-slate-200/70 dark:border-slate-700/70
                    bg-slate-50/50 dark:bg-slate-900/60
                    px-3 py-3
                  "
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {job.title}
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {job.employer_name || job.employer?.name || "Employer"} •{" "}
                      {job.location || "Location not specified"}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                      {job.status && (
                        <span className="inline-flex items-center rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] uppercase tracking-wide">
                          {job.status}
                        </span>
                      )}
                      {job.remote_type && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-100">
                          {job.remote_type === "remote"
                            ? "Remote"
                            : job.remote_type === "hybrid"
                            ? "Hybrid"
                            : "On-site"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 text-[11px]">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Applications
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {(() => {
                            const stats = jobStats.find((js) => js.job_id === job.id);
                            const count = stats?.application_count ?? job.applications_total ?? 0;
                            const recent = stats?.applications_last_7_days ?? job.applications_new ?? 0;
                            return recent > 0 ? `${count} (${recent} new)` : count;
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/opportunities/${job.id}`)}
                        className="text-[11px] text-emerald-600 hover:text-emerald-700 underline"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditJob(job.id)}
                        className="text-[11px] text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-slate-100 underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCloseJob(job.id)}
                        className="text-[11px] text-amber-600 hover:text-amber-700 underline"
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteJob(job.id)}
                        className="text-[11px] text-red-600 hover:text-red-700 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {hasPagination && (
              <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                <button
                  type="button"
                  onClick={() => handlePageChange(pageInfo.page - 1)}
                  disabled={pageInfo.page <= 1}
                  className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  Page {pageInfo.page}
                  {pageInfo.total && pageInfo.limit
                    ? ` of ${Math.ceil(
                        pageInfo.total / pageInfo.limit
                      )}`
                    : ""}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(pageInfo.page + 1)}
                  disabled={
                    pageInfo.total &&
                    pageInfo.limit &&
                    pageInfo.page >=
                      Math.ceil(pageInfo.total / pageInfo.limit)
                  }
                  className="px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default RecruiterDashboard;
