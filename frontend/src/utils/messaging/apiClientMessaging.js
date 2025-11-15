// BANIBS Connect - Phase 3.1 Real API Client
// This module provides real API calls to the FastAPI backend
// Use REACT_APP_MESSAGING_SOURCE="api" to enable

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api/messaging`;

// Store original fetch to bypass rrweb recorder wrapper
const originalFetch = window.fetch.bind(window);

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  const token = localStorage.getItem('access_token');
  console.log('🔑 [Messaging API] Getting token from localStorage:', {
    tokenExists: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'NULL'
  });
  return token;
}

/**
 * Make authenticated request to messaging API
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  console.log('📡 [Messaging API] Making request:', {
    endpoint,
    method: options.method || 'GET',
    hasToken: !!token,
    fullUrl: `${API_BASE}${endpoint}`
  });
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ [Messaging API] Authorization header added');
  } else {
    console.warn('⚠️ [Messaging API] NO TOKEN AVAILABLE - Request will fail!');
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  console.log('📥 [Messaging API] Response received:', {
    status: response.status,
    statusText: response.statusText,
    endpoint
  });
  
  // Consume response body immediately to avoid rrweb recorder conflicts
  const status = response.status;
  const statusText = response.statusText;
  const ok = response.ok;
  
  // Read body as text first (avoids clone issues with rrweb)
  let responseText = '';
  if (status !== 204) {
    try {
      responseText = await response.text();
    } catch (error) {
      console.error('❌ [Messaging API] Failed to read response body:', error);
      throw new Error('Failed to read response');
    }
  }
  
  if (status === 401) {
    console.error('🚫 [Messaging API] 401 Unauthorized - Token invalid or missing');
    console.log('🔍 [Messaging API] All localStorage keys:', Object.keys(localStorage));
    console.log('🔍 [Messaging API] Token that was sent:', token ? `${token.substring(0, 50)}...` : 'NONE');
    
    // Handle unauthorized - redirect to login
    localStorage.removeItem('access_token');
    window.location.href = '/login?session_expired=true';
    throw new Error('Unauthorized');
  }
  
  if (!ok) {
    let error;
    try {
      error = JSON.parse(responseText);
    } catch {
      error = { detail: 'Unknown error' };
    }
    console.error('❌ [Messaging API] Request failed:', error);
    throw new Error(error.detail || `HTTP ${status}`);
  }
  
  if (status === 204) {
    return null; // No content
  }
  
  // Parse JSON from text
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('❌ [Messaging API] Failed to parse JSON:', error);
    throw new Error('Invalid JSON response');
  }
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
    console.log('🆕 [Messaging API] Creating conversation with data:', conversationData);
    const result = await apiRequest('/conversations', {
      method: 'POST',
      body: JSON.stringify(conversationData),
    });
    console.log('✅ [Messaging API] Conversation created successfully:', result);
    return result;
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

  /**
   * Delete a message for the current user only
   * @param {string} messageId
   * @returns {Promise<void>}
   */
  deleteMessageForMe: async (messageId) => {
    return apiRequest(`/messages/${messageId}/delete-for-me`, {
      method: 'POST',
    });
  },

  /**
   * Delete a message for everyone (sender only)
   * @param {string} messageId
   * @returns {Promise<Object>}
   */
  deleteMessageForEveryone: async (messageId) => {
    return apiRequest(`/messages/${messageId}/delete-for-everyone`, {
      method: 'POST',
    });
  },

  /**
   * Search messages in a conversation or across all conversations
   * @param {string} query - Search query
   * @param {string} [conversationId] - Optional: limit to specific conversation
   * @param {number} [limit=50] - Results limit
   * @param {number} [offset=0] - Results offset
   * @returns {Promise<Array>}
   */
  searchMessages: async (query, conversationId = null, limit = 50, offset = 0) => {
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      offset: offset.toString()
    });
    
    if (conversationId) {
      params.append('conversation_id', conversationId);
    }
    
    return apiRequest(`/messages/search?${params.toString()}`);
  },

  /**
   * Search for users to start a conversation with
   * @param {string} query - Search query for user name or email
   * @param {number} [limit=20] - Results limit
   * @returns {Promise<Array>}
   */
  searchUsers: async (query = '', limit = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (query) {
      params.append('q', query);
    }
    console.log('🔍 [Messaging API] Searching users with query:', query);
    const result = await apiRequest(`/users/search?${params.toString()}`);
    console.log('✅ [Messaging API] Found users:', result.length);
    return result;
  },

};
