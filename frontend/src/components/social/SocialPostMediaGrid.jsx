import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { useMediaViewer } from '../../hooks/useMediaViewer';

/**
 * SocialPostMediaGrid - BANIBS Media Display System v2.1
 * 
 * ========================================================
 * MEDIA DISPLAY POLICY (CANONICAL UI RULES)
 * ========================================================
 * 
 * RULE 1: SINGLE MEDIA - THREE FIT MODES
 *   - fitMode: "cover" - Crops to fill, uses focalY for position
 *   - fitMode: "contain" - Shows full image in aspect ratio container (legacy)
 *   - fitMode: "full" - FULL POSTER MODE: No aspect ratio, auto height, no cropping
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
 * FOCAL POINT DATA MODEL:
 *   - focalY: 0.0 (top) to 1.0 (bottom), default 0.5 (center)
 *   - fitMode: 'cover' | 'contain' | 'full'
 *   - Applied via CSS object-position (cover) or auto height (full)
 */

// ========================================================
// HELPER: Detect media type from URL or object
// ========================================================
const getMediaType = (urlOrObj) => {
  const url = typeof urlOrObj === 'string' ? urlOrObj : urlOrObj?.url;
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
// HELPER: Extract focal point data from media item
// ========================================================
const getFocalPoint = (mediaItem) => {
  if (typeof mediaItem === 'string') {
    return { focalY: 0.5, fitMode: 'cover' };
  }
  return {
    focalY: mediaItem.focalY ?? 0.5,
    fitMode: mediaItem.fitMode ?? 'cover'
  };
};

// ========================================================
// HELPER: Get URL from media item (string or object)
// ========================================================
const getMediaUrl = (mediaItem) => {
  return typeof mediaItem === 'string' ? mediaItem : mediaItem?.url;
};

// ========================================================
// STYLES: Centralized for consistency
// ========================================================
const STYLES = {
  // Single media wrapper - COVER mode (aspect ratio container)
  singleMediaWrapCover: {
    width: '100%',
    aspectRatio: '4 / 5',
    backgroundColor: '#0b0b0b',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'grid',
    placeItems: 'center',
  },
  
  // Single media wrapper - FULL mode (NO aspect ratio, auto height)
  singleMediaWrapFull: {
    width: '100%',
    backgroundColor: '#0b0b0b',
    borderRadius: '12px',
    overflow: 'visible',  // CRITICAL: No clipping
    maxHeight: '90vh',    // Safety cap for very tall images
  },
  
  // Single media item (image or video) - cover mode
  singleMediaItemCover: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    background: '#000',
  },
  
  // Single media item - FULL mode (natural size, no cropping)
  singleMediaItemFull: {
    width: '100%',
    height: 'auto',
    maxHeight: '90vh',
    objectFit: 'contain',
    display: 'block',
    background: '#0b0b0b',
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
const SingleMediaRenderer = ({ url, mediaType, focalY = 0.5, fitMode = 'cover', onClick, onError }) => {
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
        style={STYLES.singleMediaWrapCover}
      >
        <video
          src={url}
          style={{ ...STYLES.singleMediaItemCover, objectFit: 'contain' }}
          controls
          playsInline
          preload="metadata"
          onError={handleError}
        />
      </div>
    );
  }
  
  // ========================================================
  // IMAGE: Handle all three fit modes
  // ========================================================
  
  // FULL MODE: Show entire image without any cropping
  if (fitMode === 'full') {
    return (
      <div
        className="mt-3 rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
        style={STYLES.singleMediaWrapFull}
        onClick={onClick}
      >
        <img
          src={url}
          alt=""
          style={STYLES.singleMediaItemFull}
          loading="lazy"
          onError={handleError}
        />
      </div>
    );
  }
  
  // COVER MODE: Crop with focal point
  if (fitMode === 'cover') {
    return (
      <div
        className="mt-3 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
        style={STYLES.singleMediaWrapCover}
        onClick={onClick}
      >
        <img
          src={url}
          alt=""
          style={{
            ...STYLES.singleMediaItemCover,
            objectPosition: `50% ${focalY * 100}%`
          }}
          loading="lazy"
          onError={handleError}
        />
      </div>
    );
  }
  
  // CONTAIN MODE (legacy): Show full image within aspect ratio container
  return (
    <div
      className="mt-3 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
      style={STYLES.singleMediaWrapCover}
      onClick={onClick}
    >
      <img
        src={url}
        alt=""
        style={{ ...STYLES.singleMediaItemCover, objectFit: 'contain' }}
        loading="lazy"
        onError={handleError}
      />
    </div>
  );
};

// ========================================================
// COMPONENT: Grid Media Item (Thumbnail)
// ========================================================
const GridMediaItem = ({ url, mediaType, focalY = 0.5, onClick, onError, showOverlay, overlayCount }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) return null;
  
  const handleError = () => {
    setHasError(true);
    if (onError) onError(url);
  };
  
  // Apply focal point to grid item style
  const gridItemStyle = {
    ...STYLES.gridMediaItem,
    objectPosition: `50% ${focalY * 100}%`
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
          style={gridItemStyle}
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
  
  // Normalize mediaUrls to array of objects
  const normalizedMedia = mediaUrls.map(item => {
    if (typeof item === 'string') {
      return { url: item, focalY: 0.5, fitMode: 'cover' };
    }
    return item;
  });
  
  // Filter out failed URLs
  const validMedia = normalizedMedia.filter(item => !failedUrls.has(getMediaUrl(item)));
  
  // No media or all failed
  if (!validMedia || validMedia.length === 0) {
    return null;
  }
  
  const handleMediaError = (url) => {
    setFailedUrls(prev => new Set([...prev, url]));
  };
  
  // Analyze media types
  const mediaItems = validMedia.map(item => ({
    url: getMediaUrl(item),
    type: getMediaType(item),
    ...getFocalPoint(item)
  }));
  
  // Get all URLs for viewer
  const allUrls = mediaItems.map(m => m.url);
  
  const hasVideo = mediaItems.some(m => m.type === 'video');
  const hasImage = mediaItems.some(m => m.type === 'image');
  const isMixedMedia = hasVideo && hasImage;
  
  // ========================================================
  // CASE 1: SINGLE MEDIA (Image OR Video) - NO CROPPING
  // ========================================================
  if (validMedia.length === 1) {
    const item = mediaItems[0];
    return (
      <SingleMediaRenderer
        url={item.url}
        mediaType={item.type}
        focalY={item.focalY}
        fitMode={item.fitMode}
        onClick={() => openViewer(allUrls, 0)}
        onError={handleMediaError}
      />
    );
  }
  
  // ========================================================
  // CASE 2+: GRID LAYOUT (2+ items, mixed media, multi-video)
  // All use COVER thumbnails; click opens full viewer
  // ========================================================
  
  // 2 items: Side by side
  if (validMedia.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#0b0b0b]">
        {mediaItems.map((item, index) => (
          <div key={index} className="relative h-64 md:h-72">
            <GridMediaItem
              url={item.url}
              mediaType={item.type}
              focalY={item.focalY}
              onClick={() => openViewer(allUrls, index)}
              onError={handleMediaError}
            />
          </div>
        ))}
      </div>
    );
  }
  
  // 3 items: 1 big left + 2 stacked right
  if (validMedia.length === 3) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-xl overflow-hidden bg-[#0b0b0b]">
        {/* Left: Large */}
        <div className="relative h-80">
          <GridMediaItem
            url={mediaItems[0].url}
            mediaType={mediaItems[0].type}
            focalY={mediaItems[0].focalY}
            onClick={() => openViewer(allUrls, 0)}
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
                focalY={mediaItems[i].focalY}
                onClick={() => openViewer(allUrls, i)}
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
            focalY={item.focalY}
            onClick={() => openViewer(allUrls, index)}
            onError={handleMediaError}
            showOverlay={index === 3 && validMedia.length > 4}
            overlayCount={validMedia.length - 4}
          />
        </div>
      ))}
    </div>
  );
}
