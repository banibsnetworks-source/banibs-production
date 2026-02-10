import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ArrowLeft, Image, Camera, X, Check, Loader2, 
  Globe, Users, Lock
} from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';

/**
 * Create Frame Page
 * 
 * Simple creation flow:
 * - Upload 1 image (required)
 * - Optional caption (max 300 chars)
 * - Visibility: public, circle-only, or private
 */

const CreateFramePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth/signin?redirect=/socialworld/frames/new');
    }
  }, [user, navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageUrl(reader.result); // For now, using base64. In production, would upload to storage.
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageUrl('');
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageUrl) {
      setError('An image is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      const res = await fetch(`${API_URL}/api/frames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption.trim() || null,
          visibility
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create Frame');
      }

      // Success - navigate to frames
      navigate('/socialworld/frames');
    } catch (err) {
      console.error('Error creating frame:', err);
      setError(err.message || 'Failed to create Frame. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const visibilityOptions = [
    { id: 'public', label: 'Public', icon: Globe, description: 'Anyone can see' },
    { id: 'circle', label: 'Circle only', icon: Users, description: 'Only your circles' },
    { id: 'private', label: 'Private', icon: Lock, description: 'Only you (draft)' },
  ];

  return (
    <FullWidthLayout>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
          color: isDark ? '#e5e5e5' : '#1a1a1a'
        }}
      >
        {/* Header */}
        <header 
          className="sticky top-0 z-50 border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/socialworld/frames')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold flex-1" style={{ color: isDark ? '#fff' : '#111' }}>
              Create Frame
            </h1>
          </div>
        </header>

        {/* Form */}
        <main className="max-w-xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div 
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <X size={20} className="text-red-500" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
                Image <span className="text-purple-400">*</span>
              </label>
              
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Frame preview" 
                    className="w-full max-h-[400px] object-contain"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label 
                  className="flex flex-col items-center justify-center h-64 rounded-xl cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: `2px dashed ${isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.3)'}`
                  }}
                >
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)' }}
                  >
                    <Camera size={28} className="text-purple-400" />
                  </div>
                  <p className="text-sm font-medium mb-1" style={{ color: isDark ? '#fff' : '#111' }}>
                    Tap to add an image
                  </p>
                  <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                    JPG, PNG, GIF up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Caption */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Caption <span style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>(optional)</span>
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a thought, reflection, or leave it silent..."
                maxLength={300}
                rows={3}
                className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#fff' : '#111',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              />
              <p className="text-xs mt-1 text-right" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                {caption.length}/300
              </p>
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
                Who can see this?
              </label>
              <div className="space-y-2">
                {visibilityOptions.map(option => {
                  const Icon = option.icon;
                  const isSelected = visibility === option.id;
                  
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setVisibility(option.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
                        isSelected ? 'ring-2 ring-purple-500' : ''
                      }`}
                      style={{
                        backgroundColor: isSelected 
                          ? (isDark ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)')
                          : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                        border: `1px solid ${isSelected ? 'rgba(168, 85, 247, 0.3)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`
                      }}
                    >
                      <Icon 
                        size={20} 
                        className={isSelected ? 'text-purple-400' : ''}
                        style={!isSelected ? { color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' } : {}}
                      />
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#111' }}>
                          {option.label}
                        </p>
                        <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                          {option.description}
                        </p>
                      </div>
                      {isSelected && <Check size={18} className="text-purple-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !imageUrl}
              className="w-full py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'rgb(168, 85, 247)',
                color: '#fff'
              }}
              data-testid="submit-frame-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Image size={20} />
                  Share Frame
                </>
              )}
            </button>

            {/* Note */}
            <p className="text-xs text-center" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
              Frames have no likes, no comments, no metrics. 
              Just a quiet space for visual storytelling.
            </p>
          </form>
        </main>
      </div>
    </FullWidthLayout>
  );
};

export default CreateFramePage;
