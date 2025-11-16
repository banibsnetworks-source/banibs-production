import React from "react";

/**
 * BANIBS Skeleton Loader Component
 * Branded shimmer effect for loading states
 * Automatically respects light/dark mode
 */
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`banibs-skeleton bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`}
    />
  );
}
