/**
 * Date formatting utilities for BANIBS platform
 * Ensures consistent date display across all components
 */

/**
 * Format ISO date string to human-readable format
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} - Formatted date like "Oct 28, 2025"
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format ISO date string to relative time
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} - Relative time like "2 days ago"
 */
export function formatRelativeDate(isoString) {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
  
  return formatDate(isoString);
}
