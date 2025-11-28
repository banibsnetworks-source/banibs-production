/**
 * BANIBS Messaging API Client - Phase 8.4
 * 
 * API client for 1-to-1 messaging with trust tier integration
 */

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * Handle API response with proper error handling
 * Prevents "Response body already used" errors
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to get error message from response
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // If response body can't be parsed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
};

/**
 * Send a message
 * @param {string} receiverId - Recipient user ID
 * @param {string} messageText - Message content
 */
export const sendMessage = async (receiverId, messageText) => {
  const response = await fetch(`${API_URL}/api/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify({ receiverId, messageText })
  });
  
  return handleResponse(response);
};

/**
 * Get conversation thread with another user
 * @param {string} otherUserId - Other user ID
 * @param {number} limit - Max messages to return
 * @param {Date} before - Get messages before this timestamp
 */
export const getConversationThread = async (otherUserId, limit = 100, before = null) => {
  const params = new URLSearchParams({
    limit: limit.toString()
  });
  
  if (before) {
    params.append('before', before.toISOString());
  }
  
  const response = await fetch(
    `${API_URL}/api/messages/thread/${otherUserId}?${params}`,
    {
      headers: getAuthHeader()
    }
  );
  
  return handleResponse(response);
};

/**
 * Mark conversation as read
 * @param {string} otherUserId - Other user ID
 */
export const markConversationRead = async (otherUserId) => {
  const response = await fetch(
    `${API_URL}/api/messages/mark-read/${otherUserId}`,
    {
      method: 'PATCH',
      headers: getAuthHeader()
    }
  );
  
  return handleResponse(response);
};

/**
 * Get conversation previews (inbox)
 * @param {number} limit - Max conversations to return
 */
export const getConversationPreviews = async (limit = 50) => {
  const response = await fetch(
    `${API_URL}/api/messages/previews?limit=${limit}`,
    {
      headers: getAuthHeader()
    }
  );
  
  return handleResponse(response);
};

/**
 * Get unread message count
 */
export const getUnreadCount = async () => {
  const response = await fetch(
    `${API_URL}/api/messages/unread-count`,
    {
      headers: getAuthHeader()
    }
  );
  
  return handleResponse(response);
};
