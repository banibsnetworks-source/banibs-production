/**
 * Analytics API Layer - Phase 7.1 Cycle 1.4
 * 
 * Provides data fetch utilities for recruiter analytics
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

/**
 * Get high-level recruiter overview stats
 * @param {string} token - JWT access token
 * @returns {Promise<Object>} Overview data with total_jobs, active_jobs, total_applications, etc.
 */
export async function getRecruiterOverview(token) {
  const res = await fetch(`${BACKEND_URL}/api/analytics/recruiter/overview`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch overview: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Get per-job application statistics
 * @param {string} token - JWT access token
 * @returns {Promise<Array>} Array of job stats with application counts
 */
export async function getRecruiterJobStats(token) {
  const res = await fetch(`${BACKEND_URL}/api/analytics/recruiter/jobs`, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    credentials: "include",
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch job stats: ${res.status}`);
  }
  
  return res.json();
}
