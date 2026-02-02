/**
 * ImageWithFallback - Global Image Component
 * 
 * Handles broken images gracefully with category/region fallbacks.
 * Use this component for ALL news/feed images to ensure consistent behavior.
 */

import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';

// Category fallback images
const CATEGORY_FALLBACKS = {
  politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80',
  business: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934- voices-of-the-game?w=800&q=80',
  entertainment: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800&q=80',
  health: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
  world: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80',
  us: 'https://images.unsplash.com/photo-1422464804701-7d8356b3a42f?w=800&q=80',
  diaspora: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a865?w=800&q=80',
  africa: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
  caribbean: 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80'
};

// Region-specific fallbacks
const REGION_FALLBACKS = {
  'Africa': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
  'Caribbean': 'https://images.unsplash.com/photo-1580541631950-7282082b53ce?w=800&q=80',
  'Europe': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
  'Latin America': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&q=80',
  'Asia': 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80',
  'Middle East': 'https://images.unsplash.com/photo-1466442929976-97f336a657be?w=800&q=80',
  'Global': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&q=80'
};

// Global fallback
const GLOBAL_FALLBACK = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';

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
