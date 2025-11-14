// BANIBS Connect - Phase 3.1 Real API Client
// This module provides real API calls to the FastAPI backend
// Use REACT_APP_MESSAGING_SOURCE="api" to enable

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api/messaging`;

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('access_token');
}

/**
 * Make authenticated request to messaging API
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    // Handle unauthorized - redirect to login
    localStorage.removeItem('access_token');
    window.location.href = '/login?session_expired=true';
    throw new Error('Unauthorized');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  
  if (response.status === 204) {
    return null; // No content
  }
  
  return response.json();
}

/**
 * Real API client for BANIBS Connect messaging
 */
export const realMessagingApi = {
  /**
   * Get all conversations for the current user
   * @param {string} [type] - Optional filter by type ('dm', 'group', 'business')
   * @returns {Promise<Array>}
   */
  getConversations: async (type = null) => {
    const params = type ? `?type=${type}` : '';
    return apiRequest(`/conversations${params}`);
  },

  /**
   * Get a single conversation by ID
   * @param {string} conversationId
   * @returns {Promise<Object>}
   */
  getConversation: async (conversationId) => {
    return apiRequest(`/conversations/${conversationId}`);
  },

  /**
   * Create a new conversation
   * @param {Object} conversationData
   * @param {string} conversationData.type - 'dm', 'group', or 'business'
   * @param {Array<string>} conversationData.participant_ids
   * @param {string} [conversationData.title]
   * @param {string} [conversationData.business_id]
   * @returns {Promise<Object>}
   */
  createConversation: async (conversationData) => {
    return apiRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
  },

  /**
   * Get messages for a conversation (paginated)
   * @param {string} conversationId
   * @param {number} [page=1]
   * @param {number} [limit=50]
   * @returns {Promise<Array>}
   */
  getMessages: async (conversationId, page = 1, limit = 50) => {
    return apiRequest(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
  },

  /**
   * Send a message to a conversation
   * @param {string} conversationId
   * @param {Object} messageData
   * @param {string} [messageData.type='text'] - 'text', 'media', or 'system'
   * @param {string} [messageData.text]
   * @param {string} [messageData.media_url]
   * @param {Object} [messageData.metadata]
   * @returns {Promise<Object>}
   */
  sendMessage: async (conversationId, messageData) => {
    return apiRequest(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        type: messageData.type || 'text',
        text: messageData.text,
        media_url: messageData.media_url,
        metadata: messageData.metadata,
      }),
    });
  },

  /**
   * Mark messages as read
   * @param {string} conversationId
   * @param {Array<string>} [messageIds] - Specific message IDs, or null for all
   * @returns {Promise<void>}
   */
  markAsRead: async (conversationId, messageIds = null) => {
    return apiRequest(`/conversations/${conversationId}/read`, {
      method: 'POST',
      body: JSON.stringify({
        message_ids: messageIds,
      }),
    });
  },
};
