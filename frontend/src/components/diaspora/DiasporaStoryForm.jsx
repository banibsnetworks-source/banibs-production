import React, { useState, useEffect } from 'react';
import { X, BookHeart, Globe, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';

/**
 * DiasporaStoryForm - Phase 12.0
 * Form component for creating diaspora stories
 */
const DiasporaStoryForm = ({ onClose, onSuccess }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    origin_region_id: '',
    current_region_id: '',
    anonymous: false
  });
  
  // Fetch regions on mount
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await axios.get(`${BACKEND_URL}/api/diaspora/regions`);
        setRegions(response.data.regions || []);
      } catch (err) {
        console.error('Error fetching regions:', err);
      }
    };
    fetchRegions();
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${BACKEND_URL}/api/diaspora/stories`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      onSuccess();
    } catch (err) {
      console.error('Error creating story:', err);
      setError(err.response?.data?.detail || 'Failed to create story. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{
          background: isDark ? '#1a1a1a' : '#ffffff',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
              }}
            >
              <BookHeart size={24} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Share Your Story</h2>
              <p className="text-sm text-muted-foreground">Tell your diaspora journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Story Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., My Journey Back to Ghana"
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              maxLength={200}
            />
          </div>
          
          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Story *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your experience, reflections, and journey..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[200px] resize-none"
              required
              maxLength={5000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length} / 5000 characters
            </p>
          </div>
          
          {/* Origin Region */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Globe size={14} className="inline mr-1" />
              Origin Region (Optional)
            </label>
            <select
              value={formData.origin_region_id}
              onChange={(e) => setFormData({ ...formData, origin_region_id: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select origin region...</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Current Region */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Globe size={14} className="inline mr-1" />
              Current Region (Optional)
            </label>
            <select
              value={formData.current_region_id}
              onChange={(e) => setFormData({ ...formData, current_region_id: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select current region...</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Anonymous option */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.anonymous}
              onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })}
              className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded"
            />
            <label htmlFor="anonymous" className="text-sm text-foreground cursor-pointer">
              Post anonymously (your name won't be shown)
            </label>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sharing...' : 'Share Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiasporaStoryForm;
