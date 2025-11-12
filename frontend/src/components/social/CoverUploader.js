import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, X, Upload, ZoomIn } from 'lucide-react';
import { downscaleIfNeeded, createPreviewURL, revokePreviewURL, formatFileSize } from '../../utils/imageUtils';

/**
 * CoverUploader Component
 * Handles profile cover/banner image upload with drag & drop support
 * - Max 20MB (client-side downscaling before upload)
 * - Image files only (JPEG, PNG, WebP)
 * - Target: 1500×500 or adaptive (fit with smart padding)
 * - Preserve full composition - no aggressive cropping
 * - Immediate local preview, swaps to server URL on success
 */
const CoverUploader = ({ initialUrl, onUploaded }) => {
  const [preview, setPreview] = useState(initialUrl);
  const [localPreview, setLocalPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const inputRef = useRef(null);

  // Update preview when initialUrl changes
  useEffect(() => {
    if (initialUrl && initialUrl !== preview) {
      setPreview(initialUrl);
    }
  }, [initialUrl]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (localPreview) {
        revokePreviewURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleFile = async (file) => {
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }

    // Validate file size (20MB - server limit)
    if (file.size > 20 * 1024 * 1024) {
      setError(`Image must be less than 20MB (current: ${formatFileSize(file.size)})`);
      return;
    }

    setUploadProgress('Validating...');
    setBusy(true);

    try {
      // Show immediate local preview
      const localUrl = createPreviewURL(file);
      setLocalPreview(localUrl);
      setPreview(localUrl);

      // Downscale if needed (for faster upload)
      setUploadProgress('Processing image...');
      const processedFile = await downscaleIfNeeded(file, 3000); // Max 3000px for cover images
      console.log(`Cover: Original: ${formatFileSize(file.size)}, Processed: ${formatFileSize(processedFile.size)}`);

      // Upload to server
      setUploadProgress('Uploading...');
      const formData = new FormData();
      formData.append('file', processedFile);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/media/cover`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: 'include',
          body: formData
        }
      );

      if (!response.ok) {
        // Read response once and store it
        const errorText = await response.text();
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Read response once
      const responseData = await response.json();
      const { cover_url } = responseData;
      const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${cover_url}?t=${Date.now()}`;
      
      // Swap to server URL
      setUploadProgress('Complete!');
      setTimeout(() => {
        // Clean up old local preview
        if (localPreview) {
          revokePreviewURL(localPreview);
        }
        setLocalPreview(null);
        setPreview(fullUrl);
        setUploadProgress(null);
        
        if (onUploaded) {
          onUploaded(fullUrl);
        }
      }, 500);
      
    } catch (err) {
      console.error('Cover upload error:', err);
      setError(err.message || 'Could not upload cover image');
      // Revert to original preview on error
      setPreview(initialUrl);
      if (localPreview) {
        revokePreviewURL(localPreview);
        setLocalPreview(null);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    setBusy(true);
    setError(null);
    setUploadProgress('Removing...');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/media/cover`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        // Read response once
        const errorText = await response.text();
        let errorMessage = 'Could not remove cover image';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch (e) {
          // Use text error if JSON parsing fails
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Read success response once
      await response.json();

      // Clean up previews
      if (localPreview) {
        revokePreviewURL(localPreview);
        setLocalPreview(null);
      }
      setPreview(null);
      
      if (onUploaded) {
        onUploaded(null);
      }
    } catch (err) {
      console.error('Cover remove error:', err);
      setError(err.message || 'Could not remove cover image');
    } finally {
      setBusy(false);
      setUploadProgress(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Cover Image Display */}
      <div className="space-y-3">
        <div
          className={`relative w-full rounded-xl border-2 overflow-hidden bg-gray-800 ${
            isDragging ? 'border-amber-500' : 'border-gray-700'
          } ${preview ? 'cursor-pointer' : ''}`}
          style={{ aspectRatio: '3 / 1', minHeight: '200px' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => preview && setShowPreviewModal(true)}
        >
          {preview ? (
            <img
              src={preview}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load cover image:', preview);
                setPreview(null);
                setError('Failed to load cover image');
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <ImageIcon size={64} className="text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">No cover image</p>
              <p className="text-gray-600 text-xs mt-1">Click "Upload Cover" or drag & drop</p>
            </div>
          )}

          {/* Overlay on hover - shows zoom icon when there's a preview */}
          {!busy && preview && (
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <ZoomIn size={32} className="text-white" />
            </div>
          )}
          
          {/* Upload overlay for when no preview */}
          {!busy && !preview && (
            <div
              className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <div className="flex flex-col items-center gap-2 text-white">
                <Upload size={32} />
                <span className="text-sm font-medium">Click to upload</span>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {busy && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent"></div>
              {uploadProgress && (
                <div className="text-white text-sm">{uploadProgress}</div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Upload size={16} />
            {busy ? 'Uploading...' : preview ? 'Change Cover' : 'Upload Cover'}
          </button>

          {preview && !busy && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <X size={16} />
              Remove
            </button>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm text-gray-400">
            JPG, PNG or WebP • Max 20MB • Recommended: 1500×500px
          </p>

          {/* Drag & Drop hint */}
          {!busy && (
            <p className="text-xs text-gray-500">
              💡 Tip: Large images are automatically optimized • Drag & drop supported
            </p>
          )}
          
          {/* Upload progress indicator */}
          {uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <div className="animate-pulse">⚡</div>
              <span>{uploadProgress}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFile(file);
          }
          // Reset input so same file can be selected again
          e.target.value = '';
        }}
      />

      {/* Preview Modal */}
      {showPreviewModal && preview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-7xl w-full max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Full-size image */}
            <img
              src={preview}
              alt="Cover preview"
              className="w-full object-contain"
              style={{ maxHeight: '70vh' }}
            />

            {/* Actions */}
            <div className="p-4 bg-gray-800 flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  inputRef.current?.click();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Upload size={16} />
                Change Cover
              </button>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleRemove();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Remove
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoverUploader;
