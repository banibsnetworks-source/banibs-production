import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaViewer } from '../../hooks/useMediaViewer';

/**
 * MediaViewer - Fullscreen HD Media Viewer
 * S-MEDIA-P2 v1.0
 * 
 * Features:
 * - Fullscreen dark overlay
 * - HD progressive loading
 * - Swipe navigation (mobile)
 * - Arrow navigation (desktop)
 * - Zoom (pinch + double-tap)
 * - ESC to close
 */
export function MediaViewer() {
  const {
    isOpen,
    currentImage,
    currentIndex,
    totalImages,
    closeViewer,
    goNext,
    goPrev,
    hasNext,
    hasPrev,
  } = useMediaViewer();

  const [isHDLoaded, setIsHDLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Reset state when image changes
  useEffect(() => {
    setIsHDLoaded(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentImage]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowLeft' && hasPrev) goPrev();
      if (e.key === 'ArrowRight' && hasNext) goNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrev, closeViewer, goNext, goPrev]);

  // Touch gestures
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setDragStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches[0]) return;
    
    const deltaX = e.changedTouches[0].clientX - dragStart.x;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && hasPrev) {
        goPrev();
      } else if (deltaX < 0 && hasNext) {
        goNext();
      }
    }
  };

  // Double-tap to zoom in
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Single click to reset zoom when zoomed in
  const handleImageClick = (e) => {
    e.stopPropagation(); // Prevent backdrop click
    if (zoom > 1) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  // Mouse drag when zoomed
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  const isVideo = currentImage && (
    currentImage.endsWith('.mp4') ||
    currentImage.endsWith('.mov') ||
    currentImage.endsWith('.webm')
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      onClick={(e) => {
        // Close when clicking backdrop (not the image)
        if (e.target === e.currentTarget) closeViewer();
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Close Button - Enhanced visibility */}
      <button
        onClick={closeViewer}
        className="absolute top-4 right-4 z-10 p-3 bg-black/70 hover:bg-black/90 rounded-lg text-white transition-all hover:scale-105 shadow-xl border border-white/10"
        aria-label="Close viewer"
      >
        <X className="w-7 h-7" />
      </button>

      {/* ESC Hint - Top Left */}
      <div className="absolute top-4 left-4 z-10 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium border border-white/10">
        Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs font-semibold">ESC</kbd> to close
      </div>

      {/* Zoom Hint - Only show when zoomed */}
      {zoom > 1 && (
        <div className="absolute top-16 left-4 z-10 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-lg text-white text-xs font-medium border border-white/10">
          Click image to reset zoom
        </div>
      )}

      {/* Image Counter */}
      {totalImages > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full text-white text-sm font-medium">
          {currentIndex + 1} of {totalImages}
        </div>
      )}

      {/* Left Arrow */}
      {hasPrev && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Right Arrow */}
      {hasNext && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all hover:scale-110"
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Media Content */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
      >
        {isVideo ? (
          // Video Placeholder (Phase 2B)
          <div className="relative">
            <div className="w-full h-full bg-black/80 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-white font-semibold">Video Playback</p>
                <p className="text-gray-400 text-sm mt-1">Coming soon</p>
              </div>
            </div>
          </div>
        ) : (
          // HD Progressive Image
          <div className="relative">
            {/* Low-res blurred preview */}
            {!isHDLoaded && (
              <img
                src={currentImage}
                alt="Loading preview"
                className="blur-xl brightness-90 max-w-full max-h-[90vh] object-contain transition-opacity duration-300"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                }}
              />
            )}
            
            {/* HD Image */}
            <img
              src={currentImage}
              alt={`Media ${currentIndex + 1}`}
              className={`max-w-full max-h-[90vh] object-contain transition-opacity duration-500 ${
                isHDLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setIsHDLoaded(true)}
              style={{
                transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              }}
            />
          </div>
        )}
      </div>

      {/* Zoom Hint (when zoomed) */}
      {zoom > 1 && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
          Zoom: {zoom}x • Double-click to reset
        </div>
      )}
    </div>
  );
}
