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
  
  // Check if response has content
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    // If no JSON content, check if body is empty
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Server returned empty response');
    }
    // Try to parse as JSON anyway
    try {
      return JSON.parse(text);
    } catch {
      throw new Error('Server returned non-JSON response');
    }
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
