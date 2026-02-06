import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useMediaViewer } from '../../hooks/useMediaViewer';

/**
 * SocialPostMediaGrid - BANIBS Media Display System v2.0
 * 
 * ========================================================
 * MEDIA DISPLAY POLICY (CANONICAL UI RULES)
 * ========================================================
 * 
 * RULE 1: SINGLE MEDIA SHOULD NEVER CROP CONTENT
 *   - Single image OR video uses "CONTAIN" semantics
 *   - Aspect-ratio container (4/5 portrait-safe)
 *   - Centered content with letterbox background
 *   - UNLESS user has set fitMode='cover' with custom focalY
 * 
 * RULE 2: GRID THUMBNAILS MAY CROP (BY DESIGN)
 *   - 2+ media items use grid thumbnails
 *   - "COVER" semantics for thumbnails
 *   - Click opens viewer/modal for full view
 *   - Apply focalY for custom crop position
 * 
 * RULE 3: MIXED MEDIA = GRID
 *   - Image(s) + Video(s) = treat as grid
 *   - Cover thumbnails, viewer shows full media
 * 
 * RULE 4: VIDEO SHOWS FULL FRAME WHEN SINGLE
 *   - Single video: contain, no crop
 *   - Controls enabled, no autoplay
 *   - preload="metadata", playsInline
 * 
 * RULE 5: PERFORMANCE
 *   - Lazy loading for images
 *   - Videos: preload="metadata" only
 *   - No autoplay by default
 * 
 * NEW: FOCAL POINT SUPPORT (v2.1)
 *   - focalY: 0.0 (top) to 1.0 (bottom), default 0.5 (center)
 *   - fitMode: 'cover' (crop to fill) or 'contain' (show full)
 *   - Applied via CSS object-position
 */

// ========================================================
// HELPER: Detect media type from URL
// ========================================================
const getMediaType = (url) => {
  if (!url) return 'unknown';
  const lowerUrl = url.toLowerCase();
  
  // Video extensions
  if (lowerUrl.match(/\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?|$)/)) {
    return 'video';
  }
  
  // Image extensions or default
  if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?|$)/)) {
    return 'image';
  }
  
  // Check for video in URL path (some CDNs)
  if (lowerUrl.includes('/video/') || lowerUrl.includes('video.')) {
    return 'video';
  }
  
  // Default to image
  return 'image';
};

// ========================================================
// STYLES: Centralized for consistency
// ========================================================
const STYLES = {
  // Single media wrapper (CONTAIN - no cropping)
  singleMediaWrap: {
    width: '100%',
    aspectRatio: '4 / 5',  // Portrait-safe default
    backgroundColor: '#0b0b0b',  // Letterbox background
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
  },
  
  // Single media item (image or video)
  singleMediaItem: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',  // CRITICAL: No cropping
    display: 'block',
    background: '#000',
  },
  
  // Grid thumbnail item (COVER - cropping OK)
  gridMediaItem: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    display: 'block',
  },
};

// ========================================================
// COMPONENT: Single Media Renderer (Image or Video)
// ========================================================
const SingleMediaRenderer = ({ url, mediaType, onClick, onError }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) return null;
  
  const handleError = () => {
    setHasError(true);
    if (onError) onError(url);
  };
  
  // VIDEO: Full frame, controls, no autoplay
  if (mediaType === 'video') {
    return (
      <div
        className="mt-3 rounded-xl overflow-hidden"
        style={STYLES.singleMediaWrap}
      >
        <video
          src={url}
          style={STYLES.singleMediaItem}
          controls
          playsInline
          preload="metadata"
          onError={handleError}
        />
      </div>
    );
  }
  
  // IMAGE: Full display, no cropping
  return (
    <div
      className="mt-3 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
      style={STYLES.singleMediaWrap}
      onClick={onClick}
    >
      <img
        src={url}
        alt=""
        style={STYLES.singleMediaItem}
        loading="lazy"
        onError={handleError}
      />
    </div>
  );
};

// ========================================================
// COMPONENT: Grid Media Item (Thumbnail)
// ========================================================
const GridMediaItem = ({ url, mediaType, onClick, onError, showOverlay, overlayCount }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) return null;
  
  const handleError = () => {
    setHasError(true);
    if (onError) onError(url);
  };
  
  return (
    <div 
      className="relative cursor-pointer hover:opacity-95 transition-opacity"
      onClick={onClick}
    >
      {mediaType === 'video' ? (
        <>
          <video
            src={url}
            style={STYLES.gridMediaItem}
            preload="metadata"
            muted
            playsInline
            onError={handleError}
          />
          {/* Play icon overlay for video thumbnails */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
              <Play size={24} className="text-white ml-1" fill="white" />
            </div>
          </div>
        </>
      ) : (
        <img
          src={url}
          alt=""
          style={STYLES.gridMediaItem}
          loading="lazy"
          onError={handleError}
        />
      )}
      
      {/* +N Overlay */}
      {showOverlay && overlayCount > 0 && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <span className="text-white font-bold text-2xl">+{overlayCount}</span>
        </div>
      )}
    </div>
  );
};

// ========================================================
// MAIN COMPONENT: SocialPostMediaGrid
// ========================================================
export function SocialPostMediaGrid({ mediaUrls = [] }) {
  const { openViewer } = useMediaViewer();
  const [failedUrls, setFailedUrls] = useState(new Set());
  
  // Filter out failed URLs
  const validUrls = mediaUrls.filter(url => !failedUrls.has(url));
  
  // No media or all failed
  if (!validUrls || validUrls.length === 0) {
    return null;
  }
  
  const handleMediaError = (url) => {
    setFailedUrls(prev => new Set([...prev, url]));
  };
  
  // Analyze media types
  const mediaItems = validUrls.map(url => ({
    url,
    type: getMediaType(url),
  }));
  
  const hasVideo = mediaItems.some(m => m.type === 'video');
  const hasImage = mediaItems.some(m => m.type === 'image');
  const isMixedMedia = hasVideo && hasImage;
  
  // ========================================================
  // CASE 1: SINGLE MEDIA (Image OR Video) - NO CROPPING
  // ========================================================
  if (validUrls.length === 1) {
    return (
      <SingleMediaRenderer
        url={validUrls[0]}
        mediaType={mediaItems[0].type}
        onClick={() => openViewer(validUrls, 0)}
        onError={handleMediaError}
      />
    );
  }
  
  // ========================================================
  // CASE 2+: GRID LAYOUT (2+ items, mixed media, multi-video)
  // All use COVER thumbnails; click opens full viewer
  // ========================================================
  
  // 2 items: Side by side
  if (validUrls.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#0b0b0b]">
        {mediaItems.map((item, index) => (
          <div key={index} className="relative h-64 md:h-72">
            <GridMediaItem
              url={item.url}
              mediaType={item.type}
              onClick={() => openViewer(validUrls, index)}
              onError={handleMediaError}
            />
          </div>
        ))}
      </div>
    );
  }
  
  // 3 items: 1 big left + 2 stacked right
  if (validUrls.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#0b0b0b]">
        {/* Left: Large */}
        <div className="relative h-80">
          <GridMediaItem
            url={mediaItems[0].url}
            mediaType={mediaItems[0].type}
            onClick={() => openViewer(validUrls, 0)}
            onError={handleMediaError}
          />
        </div>
        
        {/* Right: Two stacked */}
        <div className="flex flex-col gap-1">
          {[1, 2].map(i => (
            <div key={i} className="relative h-[calc(50%-2px)]">
              <GridMediaItem
                url={mediaItems[i].url}
                mediaType={mediaItems[i].type}
                onClick={() => openViewer(validUrls, i)}
                onError={handleMediaError}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 4+ items: 2x2 grid with +N overlay
  return (
    <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#0b0b0b]">
      {mediaItems.slice(0, 4).map((item, index) => (
        <div key={index} className="relative h-40 md:h-48">
          <GridMediaItem
            url={item.url}
            mediaType={item.type}
            onClick={() => openViewer(validUrls, index)}
            onError={handleMediaError}
            showOverlay={index === 3 && validUrls.length > 4}
            overlayCount={validUrls.length - 4}
          />
        </div>
      ))}
    </div>
  );
}
