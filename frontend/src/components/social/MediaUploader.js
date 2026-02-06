import React, { useRef, useState } from 'react';
import { X, Loader2, Move } from 'lucide-react';
import ImageFocalPointAdjuster from './ImageFocalPointAdjuster';
import './MediaUploader.css';

const MediaUploader = ({ media, setMedia }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [adjustingIndex, setAdjustingIndex] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Check limits
    const hasVideo = media.some(m => m.type === 'video');
    const newHasVideo = files.some(f => f.type.startsWith('video/'));

    if (hasVideo || newHasVideo) {
      // Only 1 video allowed, no mixing
      if (media.length > 0 || files.length > 1) {
        alert('You can only upload 1 video per post (no mixing with images)');
        return;
      }
    } else if (media.length + files.length > 4) {
      alert('You can only upload up to 4 images per post');
      return;
    }

    setIsUploading(true);

    try {
      for (const file of files) {
        // Upload file
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/media/upload`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: formData
          }
        );

        if (response.ok) {
          const uploadedMedia = await response.json();
          // Add default focal point settings for images
          const mediaWithFocalPoint = {
            ...uploadedMedia,
            focalY: 0.5,  // Default to center
            fitMode: 'cover'  // Default to cover
          };
          setMedia(prev => [...prev, mediaWithFocalPoint]);
        } else {
          console.error('Upload failed:', await response.text());
          alert('Failed to upload file');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdjustSave = (index, { focalY, fitMode }) => {
    setMedia(prev => prev.map((item, i) => 
      i === index ? { ...item, focalY, fitMode } : item
    ));
    setAdjustingIndex(null);
  };

  const hasVideo = media.some(m => m.type === 'video');

  return (
    <div className="media-uploader">
      <input
        ref={fileInputRef}
        id="media-file-input"
        type="file"
        accept={hasVideo ? "" : "image/jpeg,image/png,image/heic,video/mp4,video/quicktime"}
        multiple={!hasVideo}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Media Grid */}
      {media.length > 0 && (
        <div className={`media-grid media-grid-${media.length}`}>
          {media.map((item, index) => (
            <div key={index} className="media-item">
              {/* Remove Button */}
              <button
                className="media-remove-btn"
                onClick={() => handleRemove(index)}
              >
                <X size={16} />
              </button>

              {/* Adjust Button (for images only) */}
              {item.type === 'image' && (
                <button
                  className="media-adjust-btn"
                  onClick={() => setAdjustingIndex(index)}
                  title="Adjust image position"
                >
                  <Move size={14} />
                  <span>Adjust</span>
                </button>
              )}

              {item.type === 'image' ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                  alt="Upload"
                  className="media-preview-img"
                  style={{
                    objectFit: item.fitMode || 'cover',
                    objectPosition: item.fitMode === 'contain' ? 'center' : `50% ${(item.focalY || 0.5) * 100}%`
                  }}
                />
              ) : (
                <video
                  src={`${process.env.REACT_APP_BACKEND_URL}${item.url}`}
                  className="media-preview-video"
                  controls
                />
              )}
              
              {/* Adjusted indicator */}
              {item.type === 'image' && item.focalY !== 0.5 && (
                <div className="media-adjusted-badge">
                  Adjusted
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="upload-loading">
          <Loader2 size={20} className="spinner" />
          <span>Uploading...</span>
        </div>
      )}

      {/* Focal Point Adjuster Modal */}
      {adjustingIndex !== null && media[adjustingIndex]?.type === 'image' && (
        <ImageFocalPointAdjuster
          imageUrl={`${process.env.REACT_APP_BACKEND_URL}${media[adjustingIndex].url}`}
          initialFocalY={media[adjustingIndex].focalY || 0.5}
          initialFitMode={media[adjustingIndex].fitMode || 'cover'}
          onSave={(settings) => handleAdjustSave(adjustingIndex, settings)}
          onClose={() => setAdjustingIndex(null)}
        />
      )}
    </div>
  );
};

export default MediaUploader;
