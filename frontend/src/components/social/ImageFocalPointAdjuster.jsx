import React, { useState, useEffect, useRef } from 'react';
import { X, Move, Maximize2, Minimize2, Check } from 'lucide-react';

/**
 * ImageFocalPointAdjuster - BANIBS Media Crop Control v1.0
 * 
 * Allows users to set the focal point for how an image is cropped in feed/card views.
 * Uses a simple vertical slider to adjust the crop position.
 * 
 * @param {string} imageUrl - URL of the image to adjust
 * @param {number} initialFocalY - Initial vertical focal point (0-1, default 0.5)
 * @param {string} initialFitMode - Initial fit mode ('cover' or 'contain')
 * @param {function} onSave - Callback with { focalY, fitMode }
 * @param {function} onClose - Close callback
 */
const ImageFocalPointAdjuster = ({ 
  imageUrl, 
  initialFocalY = 0.5, 
  initialFitMode = 'cover',
  onSave, 
  onClose 
}) => {
  const [focalY, setFocalY] = useState(initialFocalY);
  const [fitMode, setFitMode] = useState(initialFitMode);
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef(null);
  
  // Preview dimensions (simulate a card)
  const PREVIEW_WIDTH = 320;
  const PREVIEW_HEIGHT = 200;
  
  // Handle slider change
  const handleSliderChange = (e) => {
    setFocalY(parseFloat(e.target.value));
  };
  
  // Handle drag on preview
  const handlePreviewMouseDown = (e) => {
    if (fitMode !== 'cover') return;
    setIsDragging(true);
  };
  
  const handlePreviewMouseMove = (e) => {
    if (!isDragging || fitMode !== 'cover') return;
    
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const y = (e.clientY - rect.top) / rect.height;
    setFocalY(Math.max(0, Math.min(1, y)));
  };
  
  const handlePreviewMouseUp = () => {
    setIsDragging(false);
  };
  
  // Handle touch events for mobile
  const handleTouchMove = (e) => {
    if (!isDragging || fitMode !== 'cover') return;
    
    const touch = e.touches[0];
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const y = (touch.clientY - rect.top) / rect.height;
    setFocalY(Math.max(0, Math.min(1, y)));
  };
  
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handlePreviewMouseUp);
      document.addEventListener('mousemove', handlePreviewMouseMove);
      return () => {
        document.removeEventListener('mouseup', handlePreviewMouseUp);
        document.removeEventListener('mousemove', handlePreviewMouseMove);
      };
    }
  }, [isDragging]);
  
  const handleSave = () => {
    onSave({ focalY, fitMode });
  };
  
  // Get label for focal position
  const getFocalLabel = () => {
    if (focalY <= 0.2) return 'Top';
    if (focalY <= 0.4) return 'Upper';
    if (focalY <= 0.6) return 'Center';
    if (focalY <= 0.8) return 'Lower';
    return 'Bottom';
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Move size={20} className="text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Adjust Image</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 rounded-full text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Preview Area */}
        <div className="p-5">
          <p className="text-sm text-gray-400 mb-3">
            Drag or use the slider to position your image for the feed view.
          </p>
          
          {/* Image Preview Card */}
          <div 
            ref={previewRef}
            className="relative mx-auto rounded-xl overflow-hidden border-2 border-gray-700 cursor-move"
            style={{ 
              width: PREVIEW_WIDTH, 
              height: PREVIEW_HEIGHT,
              backgroundColor: '#0b0b0b'
            }}
            onMouseDown={handlePreviewMouseDown}
            onTouchStart={() => setIsDragging(true)}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => setIsDragging(false)}
          >
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full select-none"
              style={{
                objectFit: fitMode,
                objectPosition: fitMode === 'cover' ? `50% ${focalY * 100}%` : 'center',
              }}
              draggable="false"
            />
            
            {/* Drag indicator */}
            {fitMode === 'cover' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Move size={14} />
                  Drag to reposition
                </div>
              </div>
            )}
            
            {/* Current position indicator */}
            {fitMode === 'cover' && (
              <div 
                className="absolute left-0 right-0 h-0.5 bg-amber-400/80 pointer-events-none"
                style={{ top: `${focalY * 100}%` }}
              >
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-white shadow-md" />
              </div>
            )}
          </div>
          
          {/* Preview Label */}
          <p className="text-center text-xs text-gray-500 mt-2">
            Feed card preview
          </p>
        </div>
        
        {/* Controls */}
        <div className="px-5 pb-5 space-y-4">
          {/* Fit Mode Toggle */}
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
            <button
              onClick={() => setFitMode('cover')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                fitMode === 'cover' 
                  ? 'bg-amber-500 text-gray-900' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Minimize2 size={16} />
              Fill Card
            </button>
            <button
              onClick={() => setFitMode('full')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                fitMode === 'full' 
                  ? 'bg-amber-500 text-gray-900' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Maximize2 size={16} />
              Show Full
            </button>
          </div>
          
          {/* Position Slider (only for cover mode) */}
          {fitMode === 'cover' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Position</span>
                <span className="text-amber-400 font-medium">{getFocalLabel()}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Top</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={focalY}
                  onChange={handleSliderChange}
                  className="flex-1 h-2 bg-gray-800 rounded-full appearance-none cursor-pointer accent-amber-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 
                    [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-amber-400 
                    [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
                />
                <span className="text-xs text-gray-500">Bottom</span>
              </div>
            </div>
          )}
          
          {fitMode === 'contain' && (
            <p className="text-sm text-gray-500 text-center py-2">
              Full image will be shown without cropping
            </p>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-gray-800 bg-gray-800/30 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl font-medium text-sm bg-amber-500 text-gray-900 hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageFocalPointAdjuster;
