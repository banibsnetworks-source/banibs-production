// src/api/opportunitiesApi.js
const API_BASE = process.env.REACT_APP_BACKEND_URL || "/api";

// Public Opportunity Detail (Phase 5.4)
// GET /api/opportunities/:id/full
export async function fetchFullOpportunity(opportunityId) {
  const res = await fetch(`${API_BASE}/opportunities/${opportunityId}/full`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.status === 404) {
    throw new Error("Not found");
  }

  if (!res.ok) {
    throw new Error("Failed to load opportunity");
  }

  return res.json();
}
