/**
 * Peoples Room API Service
 * Handles all API calls for Peoples Room System (Phase 1, 2, 3)
 */

import { apiClient } from '../utils/apiClient';

// ============================================================================
// OWNER-FACING ENDPOINTS (Phase 1)
// ============================================================================

/**
 * Get owner's room configuration and current session
 */
export async function getMyRoom() {
  const response = await apiClient('/api/rooms/me');
  if (!response.ok) {
    throw new Error('Failed to fetch room');
  }
  return response.json();
}

/**
 * Owner enters their room (starts session)
 */
export async function enterMyRoom() {
  const response = await apiClient('/api/rooms/me/enter', {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to enter room');
  }
  return response.json();
}

/**
 * Owner exits their room (ends session, kicks visitors)
 */
export async function exitMyRoom() {
  const response = await apiClient('/api/rooms/me/exit', {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to exit room');
  }
  return response.json();
}

/**
 * Update room settings
 * @param {Object} settings - Room settings to update
 */
export async function updateRoomSettings(settings) {
  const response = await apiClient('/api/rooms/me/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings)
  });
  if (!response.ok) {
    throw new Error('Failed to update room settings');
  }
  return response.json();
}

/**
 * Get list of knocks on owner's room
 * @param {string} status - Filter by status (PENDING, APPROVED, DENIED, EXPIRED)
 */
export async function getMyKnocks(status = null) {
  const url = status 
    ? `/api/rooms/me/knocks?status=${status}`
    : '/api/rooms/me/knocks';
  
  const response = await apiClient(url);
  if (!response.ok) {
    throw new Error('Failed to fetch knocks');
  }
  return response.json();
}

/**
 * Respond to a knock request
 * @param {string} visitorId - ID of visitor who knocked
 * @param {string} action - APPROVE or DENY
 * @param {boolean} rememberAccess - Add to access list if approved
 * @param {string} responseNote - Optional note
 */
export async function respondToKnock(visitorId, action, rememberAccess = false, responseNote = null) {
  const response = await apiClient(`/api/rooms/me/knocks/${visitorId}/respond`, {
    method: 'POST',
    body: JSON.stringify({
      action,
      remember_access: rememberAccess,
      response_note: responseNote
    })
  });
  if (!response.ok) {
    throw new Error('Failed to respond to knock');
  }
  return response.json();
}

/**
 * Add user to access list
 * @param {string} userId - User to add
 * @param {string} accessMode - DIRECT_ENTRY, MUST_KNOCK, or NEVER_ALLOW
 * @param {string} notes - Optional notes
 */
export async function addToAccessList(userId, accessMode, notes = null) {
  const response = await apiClient('/api/rooms/me/access-list', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      access_mode: accessMode,
      notes
    })
  });
  if (!response.ok) {
    throw new Error('Failed to add to access list');
  }
  return response.json();
}

/**
 * Remove user from access list
 * @param {string} userId - User to remove
 */
export async function removeFromAccessList(userId) {
  const response = await apiClient(`/api/rooms/me/access-list/${userId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error('Failed to remove from access list');
  }
  return response.json();
}

/**
 * Lock room doors
 */
export async function lockRoomDoors() {
  const response = await apiClient('/api/rooms/me/lock', {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to lock room');
  }
  return response.json();
}

/**
 * Unlock room doors
 */
export async function unlockRoomDoors() {
  const response = await apiClient('/api/rooms/me/unlock', {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to unlock room');
  }
  return response.json();
}

// ============================================================================
// VISITOR-FACING ENDPOINTS (Phase 2)
// ============================================================================

/**
 * Get room status and visitor's permissions
 * @param {string} ownerId - Owner of the room
 */
export async function getRoomStatus(ownerId) {
  const response = await apiClient(`/api/rooms/${ownerId}/status`);
  if (!response.ok) {
    throw new Error('Failed to fetch room status');
  }
  return response.json();
}

/**
 * Knock on owner's door
 * @param {string} ownerId - Owner of the room
 * @param {string} message - Optional knock message
 */
export async function knockOnRoom(ownerId, message = null) {
  const response = await apiClient(`/api/rooms/${ownerId}/knock`, {
    method: 'POST',
    body: JSON.stringify({ message })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to knock on room');
  }
  return response.json();
}

/**
 * Enter room as visitor
 * @param {string} ownerId - Owner of the room
 * @param {string} knockId - Optional knock ID if entering via approved knock
 */
export async function enterRoom(ownerId, knockId = null) {
  const url = knockId 
    ? `/api/rooms/${ownerId}/enter?knock_id=${knockId}`
    : `/api/rooms/${ownerId}/enter`;
  
  const response = await apiClient(url, {
    method: 'POST'
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to enter room');
  }
  return response.json();
}

/**
 * Leave room as visitor
 * @param {string} ownerId - Owner of the room
 */
export async function leaveRoom(ownerId) {
  const response = await apiClient(`/api/rooms/${ownerId}/leave`, {
    method: 'POST'
  });
  if (!response.ok) {
    throw new Error('Failed to leave room');
  }
  return response.json();
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format knock status for display
 */
export function formatKnockStatus(status) {
  const statusMap = {
    PENDING: { label: 'Pending', color: 'yellow' },
    APPROVED: { label: 'Approved', color: 'green' },
    DENIED: { label: 'Denied', color: 'red' },
    EXPIRED: { label: 'Expired', color: 'gray' }
  };
  return statusMap[status] || { label: status, color: 'gray' };
}

/**
 * Format access mode for display
 */
export function formatAccessMode(mode) {
  const modeMap = {
    DIRECT_ENTRY: { label: 'Direct Entry', icon: '🟢', color: 'green' },
    MUST_KNOCK: { label: 'Must Knock', icon: '🟡', color: 'yellow' },
    NEVER_ALLOW: { label: 'Never Allow', icon: '🔴', color: 'red' }
  };
  return modeMap[mode] || { label: mode, icon: '⚪', color: 'gray' };
}

/**
 * Format door state for display
 */
export function formatDoorState(state) {
  const stateMap = {
    OPEN: { label: 'Open', icon: '🚪', color: 'green' },
    LOCKED: { label: 'Locked', icon: '🔒', color: 'red' },
    DND: { label: 'Do Not Disturb', icon: '⛔', color: 'red' }
  };
  return stateMap[state] || { label: state, icon: '❓', color: 'gray' };
}
