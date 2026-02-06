import React from 'react';
import { sanitizeHtml, containsHtml } from '../utils/sanitizeHtml';

/**
 * SafeHtmlRenderer - Renders HTML content safely with sanitization
 * 
 * @param {string} html - The HTML string to render
 * @param {string} className - Optional CSS classes
 * @param {string} fallbackText - Text to show if html is empty
 * @param {number} maxLines - Optional line clamp (use line-clamp-X class)
 */
const SafeHtmlRenderer = ({ 
  html, 
  className = '', 
  fallbackText = '',
  as: Component = 'div'
}) => {
  // If no HTML, show fallback or nothing
  if (!html) {
    return fallbackText ? <Component className={className}>{fallbackText}</Component> : null;
  }

  // If the string doesn't contain HTML, render as plain text
  if (!containsHtml(html)) {
    return <Component className={className}>{html}</Component>;
  }

  // Sanitize and render HTML
  const sanitizedHtml = sanitizeHtml(html);

  return (
    <Component
      className={`safe-html-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default SafeHtmlRenderer;
