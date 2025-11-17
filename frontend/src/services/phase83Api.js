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
    try {
      const response = await xhrRequest(`${API_BASE}/api/social/peoples/${targetUserId}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.data?.detail || 'Failed to add to peoples');
    }
  },

  /**
   * Remove user from My Peoples
   */
  async removeFromPeoples(targetUserId) {
    try {
      const response = await xhrRequest(`${API_BASE}/api/social/peoples/${targetUserId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.data?.detail || 'Failed to remove from peoples');
    }
  },

  /**
   * Get user's peoples list
   */
  async getUserPeoples(userId) {
    try {
      const response = await xhrRequest(`${API_BASE}/api/social/peoples/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to load peoples');
    }
  },

  /**
   * Get peoples stats for a user
   */
  async getPeoplesStats(userId) {
    try {
      const response = await xhrRequest(`${API_BASE}/api/social/peoples/${userId}/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to load peoples stats');
    }
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
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/${businessId}/support`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.data?.detail || 'Failed to support business');
    }
  },

  /**
   * Remove support from a business
   */
  async unsupportBusiness(businessId) {
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/${businessId}/support`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.data?.detail || 'Failed to remove support');
    }
  },

  /**
   * Get business supporters
   */
  async getBusinessSupporters(businessId) {
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/${businessId}/supporters`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to load supporters');
    }
  },

  /**
   * Get business support stats
   */
  async getBusinessSupportStats(businessId) {
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/${businessId}/support/stats`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to load support stats');
    }
  },

  /**
   * Get businesses a user supports
   */
  async getUserSupportedBusinesses(userId) {
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/user/${userId}/supported-businesses`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to load supported businesses');
    }
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
    
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/knowledge?${params.toString()}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.data?.detail || 'Failed to create knowledge flag');
    }
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
    
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/knowledge?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to load knowledge flags');
    }
  },

  /**
   * Vote on a knowledge flag
   */
  async voteOnFlag(flagId, voteType) {
    const params = new URLSearchParams({
      vote_type: voteType
    });
    
    try {
      const response = await xhrRequest(`${API_BASE}/api/business/knowledge/${flagId}/vote?${params.toString()}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      throw new Error(error.data?.detail || 'Failed to vote');
    }
  }
};
