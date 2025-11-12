import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Upload, ZoomIn } from 'lucide-react';
import { downscaleIfNeeded, createPreviewURL, revokePreviewURL, formatFileSize } from '../../utils/imageUtils';
import ImageCropper from './ImageCropper';

/**
 * AvatarUploader Component
 * Handles profile photo upload with drag & drop support
 * - Max 20MB (client-side downscaling to 2048px before upload)
 * - Image files only (JPEG, PNG, WebP)
 * - Auto-crops to square and converts to WebP
 * - Immediate local preview, swaps to server URL on success
 */
const AvatarUploader = ({ initialUrl, onUploaded, size = 'lg' }) => {
  const [preview, setPreview] = useState(initialUrl);
  const [localPreview, setLocalPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
    xl: 'h-40 w-40'
  };

  const handleFileSelect = (file) => {
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

    // Open cropper
    setSelectedFile(file);
    setShowCropper(true);
  };

  const handleFile = async (file) => {
    if (!file) return;

    setError(null);
    setUploadProgress('Validating...');
    setBusy(true);

    try {
      // Show immediate local preview
      const localUrl = createPreviewURL(file);
      setLocalPreview(localUrl);
      setPreview(localUrl);

      // Downscale if needed (max 2048px, WebP 0.9)
      setUploadProgress('Processing image...');
      const processedFile = await downscaleIfNeeded(file);
      
      console.log(`Original: ${formatFileSize(file.size)}, Processed: ${formatFileSize(processedFile.size)}`);

      // Upload to server
      setUploadProgress('Uploading...');
      const formData = new FormData();
      formData.append('file', processedFile);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/media/avatar`,
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
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const { avatar_url } = await response.json();
      const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${avatar_url}?t=${Date.now()}`;
      
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
      console.error('Avatar upload error:', err);
      setError(err.message || 'Could not upload avatar');
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
        `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/media/avatar`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Could not remove avatar');
      }

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
      console.error('Avatar remove error:', err);
      setError('Could not remove avatar');
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
      handleFileSelect(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar Display */}
      <div className="flex items-start gap-6">
        <div
          className={`${sizeClasses[size]} relative rounded-full border-4 border-gray-700 overflow-hidden bg-gray-800 flex-shrink-0 ${
            isDragging ? 'border-amber-500' : ''
          } ${preview ? 'cursor-pointer' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => preview && setShowPreviewModal(true)}
        >
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load avatar image:', preview);
                setPreview(null);
                setError('Failed to load avatar image');
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600">
              <Camera size={size === 'xl' ? 48 : size === 'lg' ? 40 : 32} className="text-black opacity-50" />
            </div>
          )}

          {/* Overlay on hover - shows zoom icon when there's a preview */}
          {!busy && preview && (
            <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <ZoomIn size={24} className="text-white" />
            </div>
          )}
          
          {/* Upload overlay for when no preview */}
          {!busy && !preview && (
            <div
              className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Upload size={24} className="text-white" />
            </div>
          )}

          {/* Loading overlay */}
          {busy && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              {uploadProgress && (
                <div className="text-white text-xs">{uploadProgress}</div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Upload size={16} />
              {busy ? 'Uploading...' : preview ? 'Change Photo' : 'Upload Photo'}
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

          <p className="text-sm text-gray-400">
            JPG, PNG or WebP • Max 20MB • Auto-optimized before upload
          </p>

          {/* Drag & Drop hint */}
          {!busy && (
            <p className="text-xs text-gray-500">
              💡 Tip: Large images are automatically downscaled to 2048px • Drag & drop supported
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
            handleFileSelect(file);
          }
          // Reset input so same file can be selected again
          e.target.value = '';
        }}
      />

      {/* Preview Modal */}
      {showPreviewModal && preview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl overflow-hidden"
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
              alt="Profile preview"
              className="max-w-full max-h-[80vh] object-contain"
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
                Change Photo
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

      {/* Image Cropper Modal */}
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCrop={(croppedFile) => {
            setShowCropper(false);
            setSelectedFile(null);
            handleFile(croppedFile);
          }}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
        />
      )}
    </div>
  );
};

export default AvatarUploader;
