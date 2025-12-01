/**
 * Groups API - Phase 8.5
 * Frontend service for Groups & Membership operations
 */

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Create headers with auth token
 */
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  return response.json();
};

// ==================== GROUP OPERATIONS ====================

/**
 * Create a new group
 */
export const createGroup = async (groupData) => {
  const response = await fetch(`${API_URL}/api/groups/`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(groupData)
  });
  return handleResponse(response);
};

/**
 * Get all groups (with optional filters)
 */
export const listGroups = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.myGroups) params.append('my_groups', 'true');
  if (filters.privacy) params.append('privacy', filters.privacy);
  if (filters.search) params.append('search', filters.search);
  if (filters.tags) params.append('tags', filters.tags);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await fetch(`${API_URL}/api/groups/?${params}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

/**
 * Get user's joined groups
 */
export const getMyGroups = async (limit = 50) => {
  const response = await fetch(`${API_URL}/api/groups/my-groups?limit=${limit}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

/**
 * Get a specific group by ID
 */
export const getGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

/**
 * Update group details
 */
export const updateGroup = async (groupId, updates) => {
  const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates)
  });
  return handleResponse(response);
};

/**
 * Delete a group
 */
export const deleteGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(response);
};

// ==================== MEMBERSHIP OPERATIONS ====================

/**
 * Join a group
 */
export const joinGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/join`, {
    method: 'POST',
    headers: getHeaders()
  });
  return handleResponse(response);
};

/**
 * Leave a group
 */
export const leaveGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/leave`, {
    method: 'POST',
    headers: getHeaders()
  });
  return handleResponse(response);
};

/**
 * Get group members
 */
export const getGroupMembers = async (groupId, filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.role) params.append('role', filters.role);
  if (filters.status) params.append('status', filters.status);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await fetch(`${API_URL}/api/groups/${groupId}/members?${params}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return handleResponse(response);
};

/**
 * Update member role
 */
export const updateMemberRole = async (groupId, userId, newRole) => {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/members/role`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      user_id: userId,
      role: newRole
    })
  });
  return handleResponse(response);
};

/**
 * Remove member from group
 */
export const removeMember = async (groupId, userId) => {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/members/remove`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      user_id: userId
    })
  });
  return handleResponse(response);
};
