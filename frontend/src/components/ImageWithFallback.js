/**
 * ImageWithFallback - Global Image Component
 * 
 * Handles broken images gracefully with deterministic multi-image fallbacks.
 * Uses hash-based selection so the same item always gets the same fallback.
 * Use this component for ALL news/feed images to ensure consistent behavior.
 */

import React, { useState, useMemo } from 'react';

// Local fallback images array - network/circles/connection style + bokeh city
const LOCAL_FALLBACKS = [
  '/fallbacks/news-fallback-01.jpg', // Network nodes world map
  '/fallbacks/news-fallback-02.jpg', // Bokeh city lights
  '/fallbacks/news-fallback-03.jpg', // Connected people network
  '/fallbacks/news-fallback-04.jpg', // Social network circles
];

/**
 * Simple hash function for deterministic fallback selection
 * Ensures same item always gets same fallback
 */
const hashString = (str) => {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Get deterministic fallback based on item identifier
 * @param {string} itemId - Unique identifier (id, url, title, etc.)
 */
const getDeterministicFallback = (itemId) => {
  const hash = hashString(itemId || `random-${Date.now()}`);
  const index = hash % LOCAL_FALLBACKS.length;
  return LOCAL_FALLBACKS[index];
};

// Known OLD backend fallback URLs that should be replaced with new local fallbacks
// These are the Unsplash URLs the backend uses as category fallbacks
const OLD_BACKEND_FALLBACKS = [
  'photo-1504711434969-e33886168f5c', // Newspaper (default)
  'photo-1568515387631-8b650bbcdb90', // US cityscape
  'photo-1526778548025-fa2f459cd5c1', // World/globe
  'photo-1460925895917-afdab827c52f', // Business/charts
  'photo-1518770660439-4636190af475', // Technology
  'photo-1461896836934-ffe607ba8211', // Sports/running
  'photo-1514525253161-7a46d19cd819', // Concert
  'photo-1529107386315-e1a2ed48a620', // Capitol
  'photo-1505751172876-fa1923c5c528', // Health
  'photo-1533174072545-7a4b6ad7a6c3', // Festival
];

// Invalid image URL patterns - tracking pixels, broken URLs, placeholders
const INVALID_IMAGE_PATTERNS = [
  'tracking',
  'pixel',
  'rss-pixel',
  'npr-rss-pixel',
  '1x1',
  'spacer',
  'blank.gif',
  'clear.gif',
  '/static/img/fallbacks/',
];

/**
 * Check if URL is a known old backend fallback that should be replaced
 */
const isOldBackendFallback = (url) => {
  if (!url) return false;
  return OLD_BACKEND_FALLBACKS.some(id => url.includes(id));
};

/**
 * Check if URL is a tracking pixel or invalid image
 */
const isInvalidImageUrl = (url) => {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return INVALID_IMAGE_PATTERNS.some(pattern => lowerUrl.includes(pattern));
};

/**
 * Normalize image URL - handles protocol-relative URLs, empty strings, old fallbacks, and tracking pixels
 */
const normalizeImageUrl = (url) => {
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
    return null;
  }
  
  // Reject old backend fallback URLs - let frontend use new local fallbacks
  if (isOldBackendFallback(url)) {
    return null;
  }
  
  // Reject tracking pixels and invalid image URLs
  if (isInvalidImageUrl(url)) {
    return null;
  }
  
  // Handle protocol-relative URLs
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  return url;
};

/**
 * ImageWithFallback Component
 * 
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes
 * @param {string} itemId - Unique identifier for deterministic fallback selection (id, url, title)
 * @param {string} category - News category (optional, for display)
 * @param {string} region - Region (optional, for display)
 * @param {object} style - Inline styles
 */
const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  itemId,
  category,
  region,
  style = {}
}) => {
  const [currentSrc, setCurrentSrc] = useState(null);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const normalizedSrc = normalizeImageUrl(src);
  
  // Deterministic fallback based on itemId (or src/alt as backup identifiers)
  const fallbackImage = useMemo(() => {
    return getDeterministicFallback(itemId || src || alt);
  }, [itemId, src, alt]);
  
  // Initialize currentSrc on mount or when src changes
  React.useEffect(() => {
    setCurrentSrc(normalizedSrc || fallbackImage);
    setHasTriedFallback(!normalizedSrc);
    setIsLoading(true);
  }, [normalizedSrc, fallbackImage]);
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setIsLoading(false);
    // If primary failed and haven't tried fallback yet, switch to fallback
    if (!hasTriedFallback) {
      setCurrentSrc(fallbackImage);
      setHasTriedFallback(true);
      setIsLoading(true);
    }
    // If fallback also failed, just keep displaying it (local files should work)
  };
  
  return (
    <div className="relative w-full h-full overflow-hidden" style={style}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt || category || region || 'BANIBS News'}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ImageWithFallback;
export { LOCAL_FALLBACKS, getDeterministicFallback, normalizeImageUrl };
