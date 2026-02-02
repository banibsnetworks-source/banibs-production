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

/**
 * Normalize image URL - handles protocol-relative URLs and empty strings
 */
const normalizeImageUrl = (url) => {
  if (!url || url.trim() === '' || url === 'null' || url === 'undefined') {
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
