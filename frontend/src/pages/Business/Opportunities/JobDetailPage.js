import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function JobDetailPage() {
  const { id } = useParams(); // expects route like /opportunities/:id
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [error, setError] = useState(null);

  // TODO: wire to real candidate saved jobs / apply flow
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${BACKEND_URL}/api/jobs/${id}`);
        if (!res.ok) {
          throw new Error(`Failed to load job: ${res.status}`);
        }
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this opportunity right now.");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchJob();
  }, [id]);

  // Fetch similar jobs by industry
  useEffect(() => {
    async function fetchSimilar() {
      if (!job?.industry) return;
      try {
        setSimilarLoading(true);
        const params = new URLSearchParams({
          industry: job.industry,
          limit: 3,
        });
        const res = await fetch(`${BACKEND_URL}/api/jobs?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        // Filter out the current job from suggestions
        const items = data?.jobs || data?.items || data;
        const filtered = items.filter((j) => j.id !== job.id);
        setSimilarJobs(filtered);
      } catch (err) {
        console.error("Similar jobs fetch error:", err);
      } finally {
        setSimilarLoading(false);
      }
    }

    if (job) {
      fetchSimilar();
    }
  }, [job]);

  const postedDate = useMemo(() => {
    if (!job?.posted_at) return null;
    return new Date(job.posted_at).toLocaleDateString();
  }, [job]);

  function handleBack() {
    navigate("/opportunities");
  }

  function handleApply() {
    // TODO: Wire this to real application flow (modal or /apply route)
    alert("Apply flow not implemented yet. This is a placeholder.");
  }

  function handleToggleSave() {
    // TODO: Wire this to candidate profile / saved jobs API
    setIsSaved((prev) => !prev);
  }

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-slate-500">Loading opportunity…</p>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="mb-4 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
        >
          ← Back to Opportunities
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "This opportunity could not be found."}
        </div>
      </main>
    );
  }

  // Handle both employer object and flat employer fields
  const employer = {
    name: job.employer_name || job.employer?.name,
    logo_url: job.employer_logo_url || job.employer?.logo_url,
    location: job.employer?.location,
    dei_statement: job.employer?.dei_statement
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-6 md:py-8">
      {/* Back link */}
      <button
        onClick={handleBack}
        className="mb-4 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
      >
        ← Back to Opportunities
      </button>

      {/* Main card */}
      <section
        className="
          backdrop-blur-xl bg-white/80 dark:bg-slate-900/80
          border border-slate-200/70 dark:border-slate-700/70
          rounded-3xl shadow-sm p-4 md:p-6
          flex flex-col gap-4 md:gap-6
        "
      >
        {/* Top section: job + employer */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex gap-3 md:gap-4">
            {employer.logo_url && (
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={employer.logo_url}
                  alt={employer.name || "Employer logo"}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                {job.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {employer.name || "Employer"} •{" "}
                {job.location || "Location not specified"}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                {job.remote_type && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 dark:bg-emerald-900/60 dark:text-emerald-100 dark:border-emerald-700/60">
                    {job.remote_type === "remote"
                      ? "Remote"
                      : job.remote_type === "hybrid"
                      ? "Hybrid"
                      : "On-site"}
                  </span>
                )}
                {job.job_type && (
                  <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
                    {job.job_type.replace("_", " ")}
                  </span>
                )}
                {job.experience_level && (
                  <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600">
                    {job.experience_level.charAt(0).toUpperCase() +
                      job.experience_level.slice(1)}{" "}
                    level
                  </span>
                )}
                {postedDate && (
                  <span className="inline-flex items-center rounded-full bg-slate-50 text-slate-500 border border-slate-200 px-2 py-0.5 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    Posted {postedDate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-stretch gap-2 md:items-end">
            <button
              onClick={handleApply}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              Apply Now
            </button>
            <button
              onClick={handleToggleSave}
              className="
                inline-flex items-center justify-center rounded-2xl
                border border-slate-200 dark:border-slate-700
                bg-white/70 dark:bg-slate-900/70
                text-xs text-slate-700 dark:text-slate-200
                px-3 py-1.5 transition-colors
              "
            >
              {isSaved ? "Saved" : "Save Job"}
            </button>
          </div>
        </div>

        {/* Compensation & key facts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs md:text-sm">
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 px-3 py-3">
            <p className="text-slate-500 dark:text-slate-400">Compensation</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {job.pay_range_min && job.pay_range_max
                ? `$${job.pay_range_min.toLocaleString()}–$${job.pay_range_max.toLocaleString()} ${
                    job.pay_type === "hourly" ? "/hr" : "/yr"
                  }`
                : "Not specified"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 px-3 py-3">
            <p className="text-slate-500 dark:text-slate-400">
              Industry & Type
            </p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {(job.industry &&
                job.industry.charAt(0).toUpperCase() + job.industry.slice(1)) ||
                "Not specified"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 px-3 py-3">
            <p className="text-slate-500 dark:text-slate-400">Work Style</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
              {job.remote_type
                ? job.remote_type === "remote"
                  ? "Remote"
                  : job.remote_type === "hybrid"
                  ? "Hybrid"
                  : "On-site"
                : "Not specified"}
            </p>
          </div>
        </div>

        {/* Description */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Role Description
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {job.description || "No description provided."}
          </p>
        </section>

        {/* Skills / tags */}
        {Array.isArray(job.tags) && job.tags.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Skills & Keywords
            </h3>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {job.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 dark:bg-emerald-900/60 dark:text-emerald-100 dark:border-emerald-700/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Employer info */}
        <section>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
            About the Employer
          </h2>
          <div className="rounded-2xl bg-slate-50/60 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/70 px-3 py-3">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {employer.name || "Employer"}
            </p>
            {employer.location && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {employer.location}
              </p>
            )}
            {employer.dei_statement && (
              <p className="mt-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {employer.dei_statement}
              </p>
            )}
          </div>
        </section>
      </section>

      {/* Similar jobs */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Similar Opportunities
        </h2>
        {similarLoading && (
          <p className="text-xs text-slate-500">Loading similar roles…</p>
        )}
        {!similarLoading && similarJobs.length === 0 && (
          <p className="text-xs text-slate-500">
            No similar opportunities found right now.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {similarJobs.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/opportunities/${s.id}`)}
              className="
                text-left rounded-2xl border border-slate-200/70 dark:border-slate-700/70
                bg-white/80 dark:bg-slate-900/80
                px-3 py-3 shadow-sm hover:shadow-md transition-shadow
              "
            >
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                {s.title}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {s.employer_name || s.employer?.name || "Employer"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {s.location || "Location"} ·{" "}
                {s.remote_type === "remote"
                  ? "Remote"
                  : s.remote_type === "hybrid"
                  ? "Hybrid"
                  : "On-site"}
              </p>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default JobDetailPage;
