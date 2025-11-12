import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Move, Check, X } from 'lucide-react';

/**
 * ImageCropper Component
 * Interactive image cropping with drag and zoom controls
 */
const ImageCropper = ({ imageFile, onCrop, onCancel }) => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load image
  useEffect(() => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        setImage(img);
        // Center the image initially
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const size = 800; // Large canvas for maximum quality
          canvas.width = size;
          canvas.height = size;

          // Calculate initial scale to fit image in canvas
          const imgAspect = img.width / img.height;
          let initialScale;
          if (imgAspect > 1) {
            // Landscape
            initialScale = size / img.width;
          } else {
            // Portrait
            initialScale = size / img.height;
          }
          setScale(initialScale * 1.2); // Slightly larger than fit

          // Center position
          const scaledWidth = img.width * initialScale * 1.2;
          const scaledHeight = img.height * initialScale * 1.2;
          setPosition({
            x: (size - scaledWidth) / 2,
            y: (size - scaledHeight) / 2
          });
        }
      };
      img.src = e.target.result;
    };

    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  // Draw image on canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 600;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background grid
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, size, size);

    // Draw image
    const width = image.width * scale;
    const height = image.height * scale;

    ctx.save();
    ctx.drawImage(image, position.x, position.y, width, height);
    ctx.restore();

    // Draw circular crop area overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, size, size);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw circle outline
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.stroke();
  }, [image, scale, position]);

  // Mouse handlers for dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1));
  };

  // Crop and export
  const handleCrop = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const size = 600;

    // Create a new canvas for the cropped circular image
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = size;
    cropCanvas.height = size;
    const cropCtx = cropCanvas.getContext('2d');

    // Draw the image
    const width = image.width * scale;
    const height = image.height * scale;
    cropCtx.drawImage(image, position.x, position.y, width, height);

    // Create circular mask
    cropCtx.globalCompositeOperation = 'destination-in';
    cropCtx.beginPath();
    cropCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    cropCtx.fill();

    // Convert to blob with high quality
    cropCanvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], imageFile.name.replace(/\.[^.]+$/, '.webp'), {
          type: 'image/webp',
          lastModified: Date.now()
        });
        onCrop(croppedFile);
      }
    }, 'image/webp', 0.98);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Position Your Photo</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Instructions */}
        <p className="text-gray-400 text-sm mb-4">
          <Move size={16} className="inline mr-1" />
          Drag to reposition • Use zoom controls to adjust size
        </p>

        {/* Canvas */}
        <div className="flex justify-center mb-4">
          <canvas
            ref={canvasRef}
            className={`border-4 border-gray-700 rounded-lg ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handleZoomOut}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="500"
              value={scale * 100}
              onChange={(e) => setScale(parseFloat(e.target.value) / 100)}
              className="w-48"
            />
            <span className="text-white text-sm w-12">{Math.round(scale * 100)}%</span>
          </div>
          <button
            onClick={handleZoomIn}
            className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} className="text-white" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleCrop}
            className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Apply & Upload
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
