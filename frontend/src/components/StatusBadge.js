import React from "react";
import clsx from "clsx";

/**
 * StatusBadge - Phase 7.1 Cycle 1.4
 * 
 * Centralized status badge component for consistent status display
 * across applications, jobs, and other entities.
 */

const STATUS_STYLES = {
  // Application statuses
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  Submitted: "bg-blue-100 text-blue-800 border-blue-200",
  reviewed: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "In Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  interviewing: "bg-purple-100 text-purple-800 border-purple-200",
  Interviewing: "bg-purple-100 text-purple-800 border-purple-200",
  offered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Offer Extended": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Hired: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  "Not Selected": "bg-red-100 text-red-800 border-red-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
  withdrawn: "bg-gray-100 text-gray-700 border-gray-200",
  Withdrawn: "bg-gray-100 text-gray-700 border-gray-200",
  
  // Job statuses
  approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  closed: "bg-gray-100 text-gray-700 border-gray-200",
  Closed: "bg-gray-100 text-gray-700 border-gray-200",
};

// Label mapping for status display
const STATUS_LABELS = {
  submitted: "Submitted",
  reviewed: "In Review",
  interviewing: "Interviewing",
  offered: "Offer Extended",
  rejected: "Not Selected",
  withdrawn: "Withdrawn",
  approved: "Approved",
  pending: "Pending",
  closed: "Closed",
};

export function StatusBadge({ status }) {
  const safeStatus = status || "Submitted";
  const displayLabel = STATUS_LABELS[safeStatus] || safeStatus;
  const styleClasses =
    STATUS_STYLES[safeStatus] || STATUS_STYLES[displayLabel] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        "backdrop-blur-sm",
        styleClasses
      )}
    >
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
