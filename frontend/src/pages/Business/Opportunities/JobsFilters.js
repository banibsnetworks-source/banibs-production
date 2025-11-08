import React from "react";

function JobsFilters({
  filters,
  onChange,
  onReset,
}) {
  // helpers
  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange({ ...filters, [field]: value });
  };

  return (
    <section className="mb-4">
      <div className="
        backdrop-blur-md bg-white/80 dark:bg-slate-900/80
        border border-slate-200/60 dark:border-slate-700/60
        shadow-sm rounded-2xl px-4 py-3 md:px-6 md:py-4
      ">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Filter Opportunities
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Open to all, rooted in Black advancement.
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 underline"
          >
            Reset
          </button>
        </div>

        {/* Row 1: search + location + remote */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[11px] mb-1 text-slate-600 dark:text-slate-300">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by title, company, or keywords"
              value={filters.q || ""}
              onChange={handleChange("q")}
              className="w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
            />
          </div>
          <div>
            <label className="block text-[11px] mb-1 text-slate-600 dark:text-slate-300">
              Location
            </label>
            <input
              type="text"
              placeholder="City, region, or remote"
              value={filters.location || ""}
              onChange={handleChange("location")}
              className="w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="remote_only"
                checked={filters.remote_type === "remote"}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    remote_type: e.target.checked ? "remote" : "",
                  })
                }
                className="h-3 w-3 rounded border-slate-300 text-emerald-600"
              />
              <label
                htmlFor="remote_only"
                className="text-[11px] text-slate-600 dark:text-slate-300"
              >
                Remote only
              </label>
            </div>
          </div>
        </div>

        {/* Row 2: job type, level, industry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] mb-1 text-slate-600 dark:text-slate-300">
              Job type
            </label>
            <select
              value={filters.job_type || ""}
              onChange={handleChange("job_type")}
              className="w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
            >
              <option value="">Any</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] mb-1 text-slate-600 dark:text-slate-300">
              Experience level
            </label>
            <select
              value={filters.experience_level || ""}
              onChange={handleChange("experience_level")}
              className="w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
            >
              <option value="">Any</option>
              <option value="entry">Entry</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="executive">Executive</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] mb-1 text-slate-600 dark:text-slate-300">
              Industry
            </label>
            <select
              value={filters.industry || ""}
              onChange={handleChange("industry")}
              className="w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
            >
              <option value="">Any</option>
              <option value="technology">Technology</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="government">Government</option>
              <option value="finance">Finance</option>
              <option value="construction">Construction</option>
              <option value="media">Media</option>
              <option value="legal">Legal</option>
            </select>
          </div>
        </div>

        {/* Row 3: more filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] mb-1 text-slate-600 dark:text-slate-300">
              Posted within
            </label>
            <select
              value={filters.posted_within || ""}
              onChange={handleChange("posted_within")}
              className="w-full rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-white/70 dark:bg-slate-900/70 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60"
            >
              <option value="">Any time</option>
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-6">
            <input
              type="checkbox"
              id="verified_employer"
              checked={filters.verified_employer || false}
              onChange={handleChange("verified_employer")}
              className="h-3 w-3 rounded border-slate-300 text-emerald-600"
            />
            <label
              htmlFor="verified_employer"
              className="text-[11px] text-slate-600 dark:text-slate-300"
            >
              Verified employers only
            </label>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-6">
            <input
              type="checkbox"
              id="has_dei_statement"
              checked={filters.has_dei_statement || false}
              onChange={handleChange("has_dei_statement")}
              className="h-3 w-3 rounded border-slate-300 text-emerald-600"
            />
            <label
              htmlFor="has_dei_statement"
              className="text-[11px] text-slate-600 dark:text-slate-300"
            >
              Employers with DEI statement
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JobsFilters;
