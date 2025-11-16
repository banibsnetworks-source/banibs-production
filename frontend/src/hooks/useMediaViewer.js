import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * useMediaViewer - Global Media Viewer State Management
 * S-MEDIA-P2 v1.0
 * 
 * Manages:
 * - Open/close state
 * - Current media array
 * - Current index
 * - Navigation (next/prev)
 */
const MediaViewerContext = createContext(null);

export const MediaViewerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openViewer = useCallback((urls, startIndex = 0) => {
    setMediaUrls(urls || []);
    setCurrentIndex(startIndex);
    setIsOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setMediaUrls([]);
      setCurrentIndex(0);
    }, 300); // Delay cleanup for smooth animation
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, mediaUrls.length - 1));
  }, [mediaUrls.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const value = {
    isOpen,
    mediaUrls,
    currentIndex,
    currentImage: mediaUrls[currentIndex],
    totalImages: mediaUrls.length,
    openViewer,
    closeViewer,
    goNext,
    goPrev,
    setIndex: setCurrentIndex,
    hasNext: currentIndex < mediaUrls.length - 1,
    hasPrev: currentIndex > 0,
  };

  return (
    <MediaViewerContext.Provider value={value}>
      {children}
    </MediaViewerContext.Provider>
  );
};

export const useMediaViewer = () => {
  const context = useContext(MediaViewerContext);
  if (!context) {
    throw new Error('useMediaViewer must be used within MediaViewerProvider');
  }
  return context;
};
