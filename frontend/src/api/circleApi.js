/**
 * BANIBS Infinite Circle Engine API Client - Phase 9.2
 * Handles all circle graph API calls
 */

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Get authorization header with JWT token
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get user's circle edges
 * @param {string} userId - User ID
 * @param {string} tier - Optional tier filter (PEOPLES, COOL, ALRIGHT, OTHERS)
 */
export const getCircleEdges = async (userId, tier = null) => {
  const url = tier 
    ? `${API_URL}/api/circle/${userId}/edges?tier=${tier}`
    : `${API_URL}/api/circle/${userId}/edges`;
  
  const response = await fetch(url, {
    headers: getAuthHeader()
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch circle edges: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Get Peoples-of-Peoples
 * @param {string} userId - User ID
 */
export const getPeoplesOfPeoples = async (userId) => {
  const response = await fetch(
    `${API_URL}/api/circle/${userId}/peoples`,
    {
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch Peoples-of-Peoples: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Transform backend response to frontend format
  return {
    users: data.peoples_of_peoples?.map(item => ({
      id: item.user_id,
      mutualCount: item.mutual_count,
      relationshipTier: 'Peoples',
      trustScore: Math.min(100, item.mutual_count * 10)
    })) || [],
    stats: {
      totalNodes: data.direct_peoples?.length + data.peoples_of_peoples?.length || 0,
      totalEdges: data.direct_peoples?.length || 0,
      peoplesCount: data.direct_peoples?.length || 0
    }
  };
};

/**
 * Get shared circle between two users
 * @param {string} userId - First user ID
 * @param {string} otherId - Second user ID
 */
export const getSharedCircle = async (userId, otherId) => {
  const response = await fetch(
    `${API_URL}/api/circle/${userId}/shared/${otherId}`,
    {
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch shared circle: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Get circle depth traversal
 * @param {string} userId - User ID
 * @param {number} depth - Depth level (1, 2, or 3)
 */
export const getCircleDepth = async (userId, depth) => {
  const response = await fetch(
    `${API_URL}/api/circle/${userId}/depth/${depth}`,
    {
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch circle depth: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Get user's circle reach score
 * @param {string} userId - User ID
 */
export const getCircleScore = async (userId) => {
  const response = await fetch(
    `${API_URL}/api/circle/${userId}/score`,
    {
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch circle score: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Refresh user's circle graph
 * @param {string} userId - User ID
 */
export const refreshCircle = async (userId) => {
  const response = await fetch(
    `${API_URL}/api/circle/refresh/${userId}`,
    {
      method: 'POST',
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to refresh circle: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Refresh all circles (admin only)
 */
export const refreshAllCircles = async () => {
  const response = await fetch(
    `${API_URL}/api/circle/refresh-all`,
    {
      method: 'POST',
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to refresh all circles: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Get user details for circle members
 * @param {string} userId - User ID
 */
export const getUserDetails = async (userId) => {
  const response = await fetch(
    `${API_URL}/api/users/${userId}/public`,
    {
      headers: getAuthHeader()
    }
  );
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user details: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Alias for getSharedCircle to match UI naming
 */
export const getSharedCircles = async (userId, otherId) => {
  const data = await getSharedCircle(userId, otherId);
  
  // Transform backend response
  return {
    sharedUsers: [
      ...(data.shared_peoples || []).map(id => ({ id, relationshipTier: 'Peoples' })),
      ...(data.shared_cool || []).map(id => ({ id, relationshipTier: 'Cool' })),
      ...(data.shared_alright || []).map(id => ({ id, relationshipTier: 'Alright' }))
    ],
    stats: {
      overlapScore: data.overlap_score || 0,
      totalShared: (data.shared_peoples?.length || 0) + (data.shared_cool?.length || 0) + (data.shared_alright?.length || 0)
    }
  };
};

/**
 * Get trust scores for a user (uses circle reach score)
 * @param {string} userId - User ID
 */
export const getTrustScores = async (userId) => {
  return getCircleScore(userId);
};

/**
 * Get circle stats (uses circle reach score data)
 * @param {string} userId - User ID
 */
export const getCircleStats = async (userId) => {
  const scoreData = await getCircleScore(userId);
  return scoreData.breakdown || {};
};
