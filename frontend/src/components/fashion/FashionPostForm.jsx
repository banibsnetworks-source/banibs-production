import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

const FashionPostForm = ({ onPostCreated, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('idea');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) { setError('Enter your post'); return; }
    setSubmitting(true); setError(null);
    try {
      const token = localStorage.getItem('access_token');
      const response = await xhrRequest(`${process.env.REACT_APP_BACKEND_URL}/api/fashion/post`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: content.trim(), category, anonymous }) });
      if (response.ok) { onPostCreated(response.data); setContent(''); setCategory('idea'); setAnonymous(false); } else { setError(response.data?.detail || 'Failed'); }
    } catch (err) {
      setError('Failed to post');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-lg border bg-card" style={{ borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)' }}>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your fashion journey..." className="w-full p-3 rounded-lg border border-border bg-background text-foreground resize-none focus:outline-none focus:border-blue-500" rows={4} maxLength={1000} disabled={submitting} />
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
        <div className="flex items-center gap-4">
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={submitting} className="px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm"><option value="idea">Idea</option><option value="question">Question</option><option value="win">Win</option><option value="resource">Resource</option></select>
          <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} disabled={submitting} className="w-4 h-4 rounded" /><span className="text-muted-foreground">Anonymous</span></label>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground" disabled={submitting}><X size={16} className="inline mr-1" />Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center gap-2 disabled:opacity-50" disabled={submitting || !content.trim()}><Send size={16} />{submitting ? 'Posting...' : 'Post'}</button>
        </div>
      </div>
      {error && <div className="mt-3 text-sm text-red-500">{error}</div>}
      <div className="mt-3 text-xs text-muted-foreground"><p>{content.length}/1000</p></div>
    </form>
  );
};

export default FashionPostForm;