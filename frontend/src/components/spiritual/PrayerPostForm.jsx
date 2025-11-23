import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * PrayerPostForm - Phase 11.0
 * Form for creating prayer posts
 */
const PrayerPostForm = ({ room, onPostCreated, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter your prayer');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/prayer/post`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            room_id: room.id,
            content: content.trim(),
            anonymous
          })
        }
      );
      
      if (response.ok) {
        onPostCreated(response.data);
        setContent('');
        setAnonymous(false);
      } else {
        setError(response.data?.detail || 'Failed to post prayer');
      }
    } catch (err) {
      console.error('Error posting prayer:', err);
      setError('Failed to post prayer');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form 
      onSubmit={handleSubmit}
      className="p-6 rounded-lg border bg-card"
      style={{
        borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'
      }}
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your prayer request, gratitude, or blessing..."
        className="w-full p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:border-purple-500"
        rows={4}
        maxLength={1000}
        disabled={submitting}
      />
      
      <div className="flex items-center justify-between mt-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-border focus:ring-purple-500"
            disabled={submitting}
          />
          <span className="text-muted-foreground">Post anonymously</span>
        </label>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={submitting}
          >
            <X size={16} className="inline mr-1" />
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting || !content.trim()}
          >
            <Send size={16} />
            {submitting ? 'Posting...' : 'Post Prayer'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 text-sm text-red-500">
          {error}
        </div>
      )}
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>{content.length}/1000 characters</p>
      </div>
    </form>
  );
};

export default PrayerPostForm;