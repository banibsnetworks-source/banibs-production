import React from "react";

function RecruiterJobsFilters({ filters, onChange, onReset }) {
  const handleChange = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="
      mb-3 px-3 py-2 rounded-2xl
      bg-white/70 dark:bg-slate-900/70
      border border-slate-200/60 dark:border-slate-700/60
      flex flex-wrap items-center gap-3
    ">
      <input
        type="text"
        placeholder="Search my jobs"
        value={filters.q || ""}
        onChange={handleChange("q")}
        className="flex-1 min-w-[140px] rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-transparent px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/60"
      />

      <select
        value={filters.status || ""}
        onChange={handleChange("status")}
        className="rounded-xl border border-slate-200/70 dark:border-slate-700/70 bg-transparent px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/60"
      >
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="pending">Pending review</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
        <option value="closed">Closed</option>
      </select>

      <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
        <input
          type="checkbox"
          checked={filters.has_applications || false}
          onChange={handleChange("has_applications")}
          className="h-3 w-3 rounded border-slate-300 text-emerald-600"
        />
        Has applications
      </label>

      <button
        type="button"
        onClick={onReset}
        className="ml-auto text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-slate-100 underline"
      >
        Reset
      </button>
    </div>
  );
}

export default RecruiterJobsFilters;
