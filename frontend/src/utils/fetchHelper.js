/**
 * BANIBS Fetch Helper Utility
 * Prevents "Response body is already used" errors
 */

/**
 * Safely handle fetch response with proper error extraction
 * @param {Response} response - Fetch API response object
 * @returns {Promise<any>} Parsed JSON data
 * @throws {Error} With detailed error message
 */
export const handleResponse = async (response) => {
  if (!response.ok) {
    // Extract error message safely without consuming body twice
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
 * Fetch wrapper with automatic error handling
 * @param {string} url - URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Parsed response data
 */
export const safeFetch = async (url, options = {}) => {
  const response = await fetch(url, options);
  return handleResponse(response);
};

export default { handleResponse, safeFetch };
