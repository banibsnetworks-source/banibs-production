import React, { useState } from 'react';
import { X, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * UploadVideoModal - Video upload interface for ShortForm
 */
const UploadVideoModal = ({ onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [safetyRating, setSafetyRating] = useState('general');
  const [isCommunityBoost, setIsCommunityBoost] = useState(false);
  const [isMicroLearning, setIsMicroLearning] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'education', label: 'Education' },
    { value: 'community', label: 'Community' },
    { value: 'business', label: 'Business' },
    { value: 'news', label: 'News' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'youth', label: 'Youth' }
  ];

  const safetyRatings = [
    { value: 'youth_safe', label: 'Youth Safe (All Ages)' },
    { value: 'general', label: 'General (13+)' },
    { value: 'mature', label: 'Mature (18+)' }
  ];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (100MB max)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError('File size must be under 100MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only MP4, MOV, AVI, and WEBM files are supported');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError('Please select a video and enter a title');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('safety_rating', safetyRating);
      formData.append('is_community_boost', isCommunityBoost);
      formData.append('is_micro_learning', isMicroLearning);

      const token = localStorage.getItem('access_token');
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setSuccess(true);
          setTimeout(() => {
            onUploadSuccess();
          }, 1500);
        } else {
          const response = JSON.parse(xhr.responseText);
          setError(response.detail || 'Upload failed');
          setUploading(false);
        }
      });

      xhr.addEventListener('error', () => {
        setError('Network error. Please try again.');
        setUploading(false);
      });

      xhr.open('POST', `${process.env.REACT_APP_BACKEND_URL}/api/shortform/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="upload-modal-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upload-modal-header">
          <h2>Upload Video</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="upload-modal-body">
          {success ? (
            <div className="upload-success">
              <CheckCircle size={64} className="success-icon" />
              <h3>Upload Successful!</h3>
              <p>Your video is now live in the Discovery feed.</p>
            </div>
          ) : (
            <>
              {/* File Upload */}
              <div className="upload-section">
                <label className="upload-label">Video File</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    id="video-file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="video-file-input" className="file-upload-button">
                    <Upload size={24} />
                    <span>{file ? file.name : 'Choose Video File'}</span>
                    <span className="file-hint">MP4, MOV, AVI, WEBM (Max 100MB)</span>
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="upload-section">
                <label className="upload-label">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's this video about?"
                  disabled={uploading}
                  className="upload-input"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div className="upload-section">
                <label className="upload-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about your video..."
                  disabled={uploading}
                  className="upload-textarea"
                  maxLength={500}
                  rows={3}
                />
              </div>

              {/* Category */}
              <div className="upload-section">
                <label className="upload-label">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={uploading}
                  className="upload-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Safety Rating */}
              <div className="upload-section">
                <label className="upload-label">Safety Rating</label>
                <select
                  value={safetyRating}
                  onChange={(e) => setSafetyRating(e.target.value)}
                  disabled={uploading}
                  className="upload-select"
                >
                  {safetyRatings.map(rating => (
                    <option key={rating.value} value={rating.value}>{rating.label}</option>
                  ))}
                </select>
              </div>

              {/* Checkboxes */}
              <div className="upload-section">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isMicroLearning}
                    onChange={(e) => setIsMicroLearning(e.target.checked)}
                    disabled={uploading}
                  />
                  <span>Micro-Learning Content</span>
                </label>
                
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isCommunityBoost}
                    onChange={(e) => setIsCommunityBoost(e.target.checked)}
                    disabled={uploading}
                  />
                  <span>Community Boost</span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="upload-error">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Progress */}
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="progress-text">{progress}%</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="upload-modal-footer">
            <button
              onClick={onClose}
              disabled={uploading}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !file || !title.trim()}
              className="upload-submit-button"
            >
              {uploading ? (
                <>
                  <Loader2 className="spinner" size={20} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload Video
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadVideoModal;
