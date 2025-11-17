/**
 * XMLHttpRequest helper to bypass rrweb "Response body already used" error
 * 
 * This is a proven workaround for the fetch() interference caused by rrweb
 * testing framework. Use this for all Phase 8.3 API calls that are experiencing
 * the "Response body already used" error.
 */

export function xhrRequest(url, { method = "GET", headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.onload = () => {
      const contentType = xhr.getResponseHeader("Content-Type") || "";
      let data = xhr.responseText;

      // Parse JSON if response is JSON
      if (contentType.includes("application/json")) {
        try {
          data = JSON.parse(xhr.responseText);
        } catch (err) {
          // Fallback: leave as text if JSON parsing fails
          console.warn("Failed to parse JSON response:", err);
        }
      }

      // Resolve or reject based on status code
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ 
          status: xhr.status, 
          data,
          ok: true 
        });
      } else {
        reject({ 
          status: xhr.status, 
          data,
          ok: false 
        });
      }
    };

    xhr.onerror = () => {
      reject({ 
        status: xhr.status || 0, 
        data: xhr.responseText,
        ok: false,
        error: "Network error" 
      });
    };

    // Send request
    xhr.send(body);
  });
}
