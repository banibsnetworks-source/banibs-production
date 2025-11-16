import React from 'react';
import { useMediaViewer } from '../../hooks/useMediaViewer';

/**
 * SocialPostMediaGrid - BANIBS Social Media Upgrade Spec v1.0 + S-MEDIA-P2
 * Handles single and multi-image layouts for social posts
 * 
 * Layouts:
 * - 1 image: Full width (h-96 desktop, h-64 mobile)
 * - 2 images: Side-by-side grid
 * - 3 images: 1 big left + 2 stacked right
 * - 4+ images: 2x2 grid with +N overlay
 * 
 * S-MEDIA-P2: Click to open fullscreen HD viewer
 */
export function SocialPostMediaGrid({ mediaUrls = [] }) {
  const { openViewer } = useMediaViewer();
  // No media - don't render anything
  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  // Case 1: Single Image
  if (mediaUrls.length === 1) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden bg-muted">
        <div className="relative h-64 md:h-80 lg:h-96">
          <img
            src={mediaUrls[0]}
            alt="Post media"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Case 2: Two Images - Side by Side
  if (mediaUrls.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-muted">
        {mediaUrls.map((url, index) => (
          <div key={index} className="relative h-64 md:h-72">
            <img
              src={url}
              alt={`Post media ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }

  // Case 3: Three Images - 1 Big Left + 2 Stacked Right
  if (mediaUrls.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-muted">
        {/* Left: Large Image */}
        <div className="relative h-80">
          <img
            src={mediaUrls[0]}
            alt="Post media 1"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Right: Two Stacked Images */}
        <div className="flex flex-col gap-1">
          <div className="relative h-[calc(50%-2px)]">
            <img
              src={mediaUrls[1]}
              alt="Post media 2"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="relative h-[calc(50%-2px)]">
            <img
              src={mediaUrls[2]}
              alt="Post media 3"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    );
  }

  // Case 4: Four or More Images - 2x2 Grid with +N Overlay
  return (
    <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-muted">
      {mediaUrls.slice(0, 4).map((url, index) => (
        <div key={index} className="relative h-40 md:h-48">
          <img
            src={url}
            alt={`Post media ${index + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* +N Overlay on 4th image if more than 4 images */}
          {index === 3 && mediaUrls.length > 4 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white font-bold text-2xl">
                +{mediaUrls.length - 4}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
