import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, Check, X, Move } from 'lucide-react';

/**
 * CoverCropper Component
 * 
 * Professional cover image cropping with react-easy-crop
 * - Fixed 3:1 aspect ratio (standard cover/banner)
 * - Drag to reposition vertically
 * - Zoom control
 * - Preview of how it will look on profile
 */

// Helper function to create image from file
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

// Helper function to get cropped image blob for cover
const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas to cropped dimensions
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      'image/webp',
      0.92
    );
  });
};

const CoverCropper = ({ 
  imageFile, 
  onCrop, 
  onCancel 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image from file
  React.useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImageSrc(reader.result);
    });
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (croppedBlob) {
        const croppedFile = new File(
          [croppedBlob], 
          imageFile.name.replace(/\.[^.]+$/, '.webp'), 
          { type: 'image/webp', lastModified: Date.now() }
        );
        onCrop(croppedFile);
      }
    } catch (error) {
      console.error('Error cropping cover image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
  };

  if (!imageSrc) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gray-900/80 backdrop-blur border-b border-white/10">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">Adjust Cover Image</h2>
          <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-0.5">
            <Move size={14} />
            Drag to reposition • Zoom to adjust
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          disabled={isProcessing}
        >
          <X size={24} className="text-gray-400" />
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={3 / 1}
          cropShape="rect"
          showGrid={true}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: {
              background: '#0a0a0a',
            },
            cropAreaStyle: {
              border: '2px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            },
          }}
        />
        
        {/* Preview indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur rounded-lg">
          <p className="text-white text-xs">
            Preview: 3:1 aspect ratio (standard cover)
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900/80 backdrop-blur border-t border-white/10 px-4 sm:px-6 py-4">
        {/* Zoom Slider */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1 || isProcessing}
            className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ZoomOut size={20} className="text-white" />
          </button>
          
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <input
              type="range"
              min={100}
              max={300}
              value={zoom * 100}
              onChange={(e) => setZoom(parseFloat(e.target.value) / 100)}
              disabled={isProcessing}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-white text-sm font-medium w-14 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 3 || isProcessing}
            className="p-2.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ZoomIn size={20} className="text-white" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={isProcessing}
            className="flex-1 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Check size={20} />
                Apply & Save
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverCropper;
