import { create } from 'zustand';

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
const useMediaViewerStore = create((set) => ({
  isOpen: false,
  mediaUrls: [],
  currentIndex: 0,
  
  openViewer: (urls, startIndex = 0) => {
    set({
      isOpen: true,
      mediaUrls: urls || [],
      currentIndex: startIndex,
    });
  },
  
  closeViewer: () => {
    set({
      isOpen: false,
      mediaUrls: [],
      currentIndex: 0,
    });
  },
  
  goNext: () => {
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.mediaUrls.length - 1),
    }));
  },
  
  goPrev: () => {
    set((state) => ({
      currentIndex: Math.max(state.currentIndex - 1, 0),
    }));
  },
  
  setIndex: (index) => {
    set({ currentIndex: index });
  },
}));

export const useMediaViewer = () => {
  const store = useMediaViewerStore();
  
  return {
    isOpen: store.isOpen,
    mediaUrls: store.mediaUrls,
    currentIndex: store.currentIndex,
    currentImage: store.mediaUrls[store.currentIndex],
    totalImages: store.mediaUrls.length,
    openViewer: store.openViewer,
    closeViewer: store.closeViewer,
    goNext: store.goNext,
    goPrev: store.goPrev,
    setIndex: store.setIndex,
    hasNext: store.currentIndex < store.mediaUrls.length - 1,
    hasPrev: store.currentIndex > 0,
  };
};
