import React, { useState } from 'react';
import { useMediaViewer } from '../../hooks/useMediaViewer';

/**
 * SocialPostMediaGrid - BANIBS Social Media Upgrade Spec v1.0 + S-MEDIA-P2
 * Handles single and multi-image layouts for social posts
 * 
 * CRITICAL FIX (Feb 2026): Portrait/poster images now display FULLY
 * - Single images use aspect-ratio container with object-fit: contain
 * - No more cropping for promo flyers, announcements, poster content
 * - Matches Facebook behavior: show entire image in-feed
 * 
 * Layouts:
 * - 1 image: Full width, aspect-ratio based (portrait-safe)
 * - 2 images: Side-by-side grid
 * - 3 images: 1 big left + 2 stacked right
 * - 4+ images: 2x2 grid with +N overlay
 * 
 * S-MEDIA-P2: Click to open fullscreen HD viewer
 * UI Polish: Broken images are hidden gracefully
 */

// Image component with error handling
const MediaImage = ({ src, alt, className, onClick }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) return null;
  
  return (
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      onClick={onClick}
      onError={() => setHasError(true)}
    />
  );
};

export function SocialPostMediaGrid({ mediaUrls = [] }) {
  const { openViewer } = useMediaViewer();
  const [failedUrls, setFailedUrls] = useState(new Set());
  
  // Filter out failed URLs
  const validUrls = mediaUrls.filter(url => !failedUrls.has(url));
  
  // No media or all failed - don't render anything
  if (!validUrls || validUrls.length === 0) {
    return null;
  }

  const handleImageError = (url) => {
    setFailedUrls(prev => new Set([...prev, url]));
  };

  // Case 1: Single Image - PORTRAIT-SAFE DISPLAY
  // Uses aspect-ratio container with object-fit: contain to show FULL image
  if (validUrls.length === 1) {
    return (
      <div 
        className="mt-3 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
        style={{
          width: '100%',
          aspectRatio: '4 / 5',  /* Portrait-safe for flyers/posters */
          backgroundColor: '#0b0b0b',  /* Letterbox background */
        }}
        onClick={() => openViewer(validUrls, 0)}
      >
        <img
          src={validUrls[0]}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',  /* CRITICAL: No cropping */
            display: 'block',
          }}
          loading="lazy"
          onError={() => handleImageError(validUrls[0])}
        />
      </div>
    );
  }

  // Case 2: Two Images - Side by Side (keep cover for multi-image)
  if (validUrls.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-muted">
        {validUrls.map((url, index) => (
          <div key={index} className="relative h-64 md:h-72 cursor-pointer hover:opacity-95 transition-opacity">
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover object-center"
              loading="lazy"
              onClick={() => openViewer(validUrls, index)}
              onError={() => handleImageError(url)}
            />
          </div>
        ))}
      </div>
    );
  }

  // Case 3: Three Images - 1 Big Left + 2 Stacked Right
  if (validUrls.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-muted">
        {/* Left: Large Image */}
        <div className="relative h-80 cursor-pointer hover:opacity-95 transition-opacity">
          <img
            src={validUrls[0]}
            alt=""
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onClick={() => openViewer(validUrls, 0)}
            onError={() => handleImageError(validUrls[0])}
          />
        </div>

        {/* Right: Two Stacked Images */}
        <div className="flex flex-col gap-1">
          <div className="relative h-[calc(50%-2px)] cursor-pointer hover:opacity-95 transition-opacity">
            <img
              src={validUrls[1]}
              alt=""
              className="w-full h-full object-cover object-top"
              loading="lazy"
              onClick={() => openViewer(validUrls, 1)}
              onError={() => handleImageError(validUrls[1])}
            />
          </div>
          <div className="relative h-[calc(50%-2px)] cursor-pointer hover:opacity-95 transition-opacity">
            <img
              src={validUrls[2]}
              alt=""
              className="w-full h-full object-cover object-top"
              loading="lazy"
              onClick={() => openViewer(validUrls, 2)}
              onError={() => handleImageError(validUrls[2])}
            />
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Four or More Images - 2x2 Grid with +N Overlay
  return (
    <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-muted">
      {validUrls.slice(0, 4).map((url, index) => (
        <div key={index} className="relative h-40 md:h-48 cursor-pointer hover:opacity-95 transition-opacity">
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover object-top"
            loading="lazy"
            onClick={() => openViewer(validUrls, index)}
            onError={() => handleImageError(url)}
          />

          {/* +N Overlay on 4th image if more than 4 images */}
          {index === 3 && validUrls.length > 4 && (
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            >
              <span className="text-white font-bold text-2xl">
                +{validUrls.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
