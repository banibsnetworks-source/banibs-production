import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * - Allows basic formatting tags (p, b, i, em, strong, ul, ol, li, br, a)
 * - Strips dangerous elements and attributes
 * - Ensures links open in new tabs with proper security attributes
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'ul', 'ol', 'li', 'br', 'a', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'], // Add these attributes to links
  };

  // Sanitize the HTML
  let clean = DOMPurify.sanitize(html, config);

  // Post-process: Add target="_blank" and rel="noopener noreferrer" to all links
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = clean;
  
  const links = tempDiv.querySelectorAll('a');
  links.forEach(link => {
    // Only add for external links (those with href starting with http)
    const href = link.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return tempDiv.innerHTML;
};

/**
 * Check if a string contains HTML tags
 */
export const containsHtml = (str) => {
  if (!str) return false;
  return /<[a-z][\s\S]*>/i.test(str);
};

export default sanitizeHtml;
