import React, { useState } from 'react';
import { Trash2, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

const FashionPostCard = ({ post, currentUserId, onPostDeleted }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [deleting, setDeleting] = useState(false);
  const isOwnPost = currentUserId && post.user_id === currentUserId;
  const categoryColors = { idea: '#3B82F6', question: '#10B981', win: '#F59E0B', resource: '#8B5CF6' };
  const categoryColor = categoryColors[post.category] || '#6B7280';
  
  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await xhrRequest(`${process.env.REACT_APP_BACKEND_URL}/api/fashion/post/${post.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) onPostDeleted(post.id);
    } catch (err) {
      alert('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };
  
  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };
  
  return (
    <div className="p-6 rounded-lg border bg-card" style={{ borderColor: isDark ? 'rgba(229, 231, 235, 0.1)' : '#E5E7EB' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {post.anonymous ? (
            <><div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' }}><User size={20} className="text-blue-500" /></div><div><p className="font-medium text-foreground">Anonymous</p><p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p></div></>
          ) : (
            <>{post.author_avatar ? <img src={post.author_avatar} alt={post.author_name} className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white" style={{ background: '#3B82F6' }}>{post.author_name?.charAt(0) || 'U'}</div>}<div><p className="font-medium text-foreground">{post.author_name || 'User'}</p><p className="text-xs text-muted-foreground">{formatDate(post.created_at)}</p></div></>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: isDark ? `${categoryColor}20` : `${categoryColor}15`, color: categoryColor }}>{post.category}</span>
          {isOwnPost && <button onClick={handleDelete} disabled={deleting} className="text-muted-foreground hover:text-red-500"><Trash2 size={16} /></button>}
        </div>
      </div>
      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
    </div>
  );
};

export default FashionPostCard;