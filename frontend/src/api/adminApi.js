// src/api/adminApi.js
// Centralized admin API helpers for Phase 5 frontend.
// Assumes you store the admin JWT in localStorage as "adminToken".
// If you use a different key, update getAuthHeader().

const API_BASE = process.env.REACT_APP_BACKEND_URL || "";

function getAuthHeader() {
  const token = window.localStorage.getItem("adminToken");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}

// --- Revenue Overview (Phase 5.5)
export async function fetchRevenueOverview() {
  const res = await fetch(`${API_BASE}/api/admin/revenue/overview`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Not authorized to view revenue overview");
  }

  if (!res.ok) {
    throw new Error("Failed to load revenue overview");
  }

  return res.json();
}

// --- Banned Sources list (Phase 5.3)
export async function fetchBannedSources() {
  const res = await fetch(`${API_BASE}/admin/banned-sources`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Not authorized to view banned sources");
  }

  if (!res.ok) {
    throw new Error("Failed to load banned sources");
  }

  return res.json();
}

// --- Ban Source (Phase 5.3)
// body: { ip_hash: string, reason: string }
export async function banSource(ip_hash, reason) {
  const res = await fetch(`${API_BASE}/admin/ban-source`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ ip_hash, reason }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Not authorized to ban source");
  }

  if (!res.ok) {
    throw new Error("Failed to ban source");
  }

  return res.json();
}

// --- Unban Source (Phase 5.3)
export async function unbanSource(ip_hash) {
  const res = await fetch(`${API_BASE}/admin/unban-source/${ip_hash}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error("Not authorized to unban source");
  }

  if (!res.ok) {
    throw new Error("Failed to unban source");
  }

  return res.json();
}
