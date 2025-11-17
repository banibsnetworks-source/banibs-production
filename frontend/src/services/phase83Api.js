/**
 * Phase 8.3 API Service
 * Peoples, Business Support & Business Knowledge Flags
 * 
 * Uses XMLHttpRequest to bypass rrweb "Response body already used" error
 */

import { xhrRequest } from '../utils/xhrRequest';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ============================================================================
// PEOPLES SYSTEM (User → User)
// ============================================================================

export const peoplesApi = {
  /**
   * Add user to My Peoples
   */
  async addToPeoples(targetUserId) {
    const response = await fetch(`${API_BASE}/api/social/peoples/${targetUserId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to add to peoples');
    }
    
    return response.json();
  },

  /**
   * Remove user from My Peoples
   */
  async removeFromPeoples(targetUserId) {
    const response = await fetch(`${API_BASE}/api/social/peoples/${targetUserId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove from peoples');
    }
    
    return response.json();
  },

  /**
   * Get user's peoples list
   */
  async getUserPeoples(userId) {
    const response = await fetch(`${API_BASE}/api/social/peoples/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load peoples');
    }
    
    return response.json();
  },

  /**
   * Get peoples stats for a user
   */
  async getPeoplesStats(userId) {
    const response = await fetch(`${API_BASE}/api/social/peoples/${userId}/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load peoples stats');
    }
    
    return response.json();
  }
};

// ============================================================================
// BUSINESS SUPPORT SYSTEM (User → Business)
// ============================================================================

export const businessSupportApi = {
  /**
   * Support a business
   */
  async supportBusiness(businessId) {
    const response = await fetch(`${API_BASE}/api/business/${businessId}/support`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to support business');
    }
    
    return response.json();
  },

  /**
   * Remove support from a business
   */
  async unsupportBusiness(businessId) {
    const response = await fetch(`${API_BASE}/api/business/${businessId}/support`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to remove support');
    }
    
    return response.json();
  },

  /**
   * Get business supporters
   */
  async getBusinessSupporters(businessId) {
    const response = await fetch(`${API_BASE}/api/business/${businessId}/supporters`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load supporters');
    }
    
    return response.json();
  },

  /**
   * Get business support stats
   */
  async getBusinessSupportStats(businessId) {
    const response = await fetch(`${API_BASE}/api/business/${businessId}/support/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load support stats');
    }
    
    return response.json();
  },

  /**
   * Get businesses a user supports
   */
  async getUserSupportedBusinesses(userId) {
    const response = await fetch(`${API_BASE}/api/business/user/${userId}/supported-businesses`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load supported businesses');
    }
    
    return response.json();
  }
};

// ============================================================================
// BUSINESS KNOWLEDGE FLAGS (Business → Business Community)
// ============================================================================

export const businessKnowledgeApi = {
  /**
   * Create a knowledge flag
   */
  async createFlag({ type, title, description, anonymous = false, tags = [], media_url = null }) {
    const params = new URLSearchParams({
      type,
      title,
      description,
      anonymous: anonymous.toString()
    });
    
    if (tags && tags.length > 0) {
      params.append('tags', tags.join(','));
    }
    
    if (media_url) {
      params.append('media_url', media_url);
    }
    
    const response = await fetch(`${API_BASE}/api/business/knowledge?${params.toString()}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create knowledge flag');
    }
    
    return response.json();
  },

  /**
   * Get knowledge flags
   */
  async getFlags(type = null, limit = 50, skip = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      skip: skip.toString()
    });
    
    if (type) {
      params.append('type', type);
    }
    
    const response = await fetch(`${API_BASE}/api/business/knowledge?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to load knowledge flags');
    }
    
    return response.json();
  },

  /**
   * Vote on a knowledge flag
   */
  async voteOnFlag(flagId, voteType) {
    const params = new URLSearchParams({
      vote_type: voteType
    });
    
    const response = await fetch(`${API_BASE}/api/business/knowledge/${flagId}/vote?${params.toString()}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to vote');
    }
    
    return response.json();
  }
};
