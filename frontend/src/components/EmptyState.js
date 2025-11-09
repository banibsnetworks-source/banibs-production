import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * EmptyState - Phase 7.1 Cycle 1.4
 * 
 * Reusable empty state component for consistent zero-data UX
 * across the BANIBS platform.
 * 
 * Usage:
 * <EmptyState
 *   title="No applications yet"
 *   description="When you apply..."
 *   actionLabel="Browse Opportunities"
 *   actionTo="/opportunities"
 * />
 */

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionTo,
  icon,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onAction) return onAction();
    if (actionTo) navigate(actionTo);
  };

  return (
    <div
      className="
        flex flex-col items-center justify-center
        rounded-2xl border border-slate-200/70
        bg-slate-50/70 px-6 py-10 text-center shadow-sm
        backdrop-blur-xl
        dark:bg-slate-800/70 dark:border-slate-700/70
      "
    >
      {icon && <div className="mb-4 text-3xl opacity-70">{icon}</div>}

      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>

      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
          {description}
        </p>
      )}

      {actionLabel && (
        <button
          type="button"
          onClick={handleClick}
          className="
            mt-5 inline-flex items-center justify-center
            rounded-full px-4 py-2 text-sm font-medium
            bg-slate-900 text-slate-50
            hover:bg-slate-800 transition
            shadow-sm
            dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
