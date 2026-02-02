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
 * Get fallback image based on category and region
 */
const getFallbackImage = (category, region) => {
  // Try region first
  if (region && REGION_FALLBACKS[region]) {
    return REGION_FALLBACKS[region];
  }
  
  // Try category
  if (category) {
    const normalizedCategory = category.toLowerCase().replace(/[\s-]/g, '');
    if (CATEGORY_FALLBACKS[normalizedCategory]) {
      return CATEGORY_FALLBACKS[normalizedCategory];
    }
  }
  
  return GLOBAL_FALLBACK;
};

/**
 * ImageWithFallback Component
 * 
 * @param {string} src - Image URL
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes
 * @param {string} category - News category for fallback selection
 * @param {string} region - Region for fallback selection
 * @param {string} fallbackText - Text to show on fallback (default: category/region)
 * @param {boolean} showIcon - Show icon in fallback (default: true)
 */
const ImageWithFallback = ({ 
  src, 
  alt, 
  className = '', 
  category,
  region,
  fallbackText,
  showIcon = true,
  style = {}
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const normalizedSrc = normalizeImageUrl(src);
  const fallbackImage = getFallbackImage(category, region);
  const displayText = fallbackText || region || category || 'BANIBS News';
  
  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };
  
  const handleImageError = (e) => {
    setIsLoading(false);
    // Try fallback image before showing placeholder
    if (e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
    } else {
      setImageError(true);
    }
  };
  
  // Show placeholder if no source or error on fallback
  if (!normalizedSrc || imageError) {
    return (
      <div 
        className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ${className}`}
        style={style}
      >
        <div className="text-center p-4">
          {showIcon && (
            <div className="text-amber-400/60 mb-2">
              <ImageOff size={32} className="mx-auto" />
            </div>
          )}
          <div className="text-amber-300/80 text-sm font-medium">
            {displayText}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full" style={style}>
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-2 mx-auto" />
            <div className="text-amber-300/60 text-xs">Loading...</div>
          </div>
        </div>
      )}
      <img
        src={normalizedSrc}
        alt={alt || displayText}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

export default ImageWithFallback;
export { CATEGORY_FALLBACKS, REGION_FALLBACKS, GLOBAL_FALLBACK, getFallbackImage, normalizeImageUrl };
