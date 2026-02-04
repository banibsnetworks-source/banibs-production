/**
 * useWorldPersistence - Hook for "Last Used World" persistence
 * 
 * This hook sets the localStorage key when a world page mounts,
 * enabling the Social World selector to remember the user's last context.
 * 
 * P0 Requirement: Must persist across:
 * - Social World selector navigation
 * - Direct navigation into individual world routes/pages
 */

import { useEffect } from 'react';

// LocalStorage key (mirrored from SocialWorldHome.jsx)
const LAST_WORLD_KEY = 'banibs:last_world';

/**
 * Sets the last used world in localStorage
 * @param {string} worldId - The world ID to persist
 */
export const setLastWorld = (worldId) => {
  try {
    localStorage.setItem(LAST_WORLD_KEY, worldId);
  } catch {
    // localStorage not available (SSR, incognito, etc.)
  }
};

/**
 * Gets the last used world from localStorage
 * @returns {string|null} - The last world ID or null
 */
export const getLastWorld = () => {
  try {
    return localStorage.getItem(LAST_WORLD_KEY);
  } catch {
    return null;
  }
};

/**
 * Hook to persist world selection on page mount
 * Call this in any world page to update the "Last Used World"
 * 
 * @param {string} worldId - The world ID for this page
 * 
 * @example
 * // In ShortFormPage.jsx
 * useWorldPersistence('shortform');
 * 
 * // In SocialCirclesPage.jsx
 * useWorldPersistence('circles');
 */
export const useWorldPersistence = (worldId) => {
  useEffect(() => {
    if (worldId) {
      setLastWorld(worldId);
    }
  }, [worldId]);
};

export default useWorldPersistence;
