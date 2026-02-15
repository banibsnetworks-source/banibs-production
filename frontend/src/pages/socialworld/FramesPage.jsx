import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ArrowLeft, Plus, Image, X, Eye, EyeOff, MoreHorizontal,
  Flag, Link2, Check
} from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import ShareButton from '../../components/social/ShareButton';
import PinButton from '../../components/pins/PinButton';

/**
 * Frames - Visual Storytelling
 * 
 * Purpose: Visual storytelling, reflections, and quiet presence.
 * Posture: Non-extractive, non-algorithmic, low-pressure.
 * 
 * WHAT FRAMES IS NOT:
 * - No likes, no comments, no follower counts
 * - No engagement metrics, no ranking algorithms
 * - No urgency mechanics, no monetization
 */

const FramesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State
  const [frames, setFrames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  
  // Modal state
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [showMenu, setShowMenu] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const LIMIT = 24; // Grid-friendly

  // Fetch frames
  const fetchFrames = useCallback(async (pageNum = 0, append = false) => {
    try {
      if (!append) setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(
        `${API_URL}/api/frames?skip=${pageNum * LIMIT}&limit=${LIMIT}`,
        { headers }
      );
      
      if (!res.ok) throw new Error('Failed to fetch Frames');
      
      const data = await res.json();
      
      if (append) {
        setFrames(prev => [...prev, ...(data.frames || [])]);
      } else {
        setFrames(data.frames || []);
      }
      setTotal(data.total || 0);
      setHasMore(data.has_more || false);
    } catch (err) {
      console.error('Error fetching frames:', err);
      setError('Unable to load Frames. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchFrames(0);
  }, [fetchFrames]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFrames(nextPage, true);
  };

  const handleHideFrame = async (frameId) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/api/frames/${frameId}/hide`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setFrames(prev => prev.filter(f => f.id !== frameId));
      setActionMessage({ type: 'success', text: 'Frame hidden from your feed' });
      setShowMenu(null);
      setSelectedFrame(null);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to hide Frame' });
    }
  };

  const handleReportFrame = async (frameId) => {
    const reason = window.prompt('Please describe why you are reporting this Frame:');
    if (!reason || reason.trim().length < 5) return;

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/api/frames/${frameId}/report?reason=${encodeURIComponent(reason)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setActionMessage({ type: 'success', text: 'Report submitted. Thank you.' });
      setShowMenu(null);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to submit report' });
    }
  };

  const handleDeleteFrame = async (frameId) => {
    if (!window.confirm('Delete this Frame? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/api/frames/${frameId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setFrames(prev => prev.filter(f => f.id !== frameId));
      setActionMessage({ type: 'success', text: 'Frame deleted' });
      setShowMenu(null);
      setSelectedFrame(null);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to delete Frame' });
    }
  };

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
          className="sticky top-0 z-40 border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              {/* Back button */}
              <button
                onClick={() => navigate('/socialworld')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline text-sm">Social World</span>
              </button>

              {/* Title */}
              <div className="flex-1">
                <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  <Image size={24} className="text-purple-400" />
                  Frames
                </h1>
                <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                  Visual storytelling · reflections & thoughts
                </p>
              </div>

              {/* Create Button */}
              {user && (
                <Link
                  to="/socialworld/frames/new"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'rgb(168, 85, 247)',
                    color: '#fff'
                  }}
                  data-testid="create-frame-btn"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Create</span>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Action Message */}
        {actionMessage && (
          <div 
            className={`fixed top-20 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 ${
              actionMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <Check size={18} />
            <span className="text-sm">{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-6">
          {/* Error State */}
          {error && (
            <div 
              className="text-center py-12 rounded-xl"
              style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }}
            >
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => fetchFrames(0)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && frames.length === 0 && (
            <div className="text-center py-16">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)' }}
              >
                <Image size={40} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                No Frames yet
              </h3>
              <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                Frames is a space for visual storytelling, reflections, and quiet moments. 
                Share an image with an optional caption.
              </p>
              {user ? (
                <Link
                  to="/socialworld/frames/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'rgb(168, 85, 247)', color: '#fff' }}
                >
                  <Plus size={18} />
                  Create your first Frame
                </Link>
              ) : (
                <Link
                  to="/auth/signin"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'rgb(168, 85, 247)', color: '#fff' }}
                >
                  Sign in to create Frames
                </Link>
              )}
            </div>
          )}

          {/* Frames Grid - No infinite scroll, deliberate pagination */}
          {!loading && !error && frames.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {frames.map(frame => (
                  <FrameCard 
                    key={frame.id}
                    frame={frame}
                    isDark={isDark}
                    onClick={() => setSelectedFrame(frame)}
                  />
                ))}
              </div>

              {/* Load More - Deliberate, not auto */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: isDark ? '#fff' : '#111'
                    }}
                  >
                    Load more Frames
                  </button>
                  <p className="text-xs mt-2" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
                    Take your time. There's no rush.
                  </p>
                </div>
              )}

              {/* Total count (subtle) */}
              <p className="text-center text-xs mt-6" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
                {total} Frame{total !== 1 ? 's' : ''}
              </p>
            </>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-xl animate-pulse"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                />
              ))}
            </div>
          )}
        </main>

        {/* Frame Detail Modal */}
        {selectedFrame && (
          <FrameDetailModal
            frame={selectedFrame}
            isDark={isDark}
            user={user}
            onClose={() => { setSelectedFrame(null); setShowMenu(null); }}
            showMenu={showMenu === selectedFrame.id}
            onToggleMenu={() => setShowMenu(showMenu === selectedFrame.id ? null : selectedFrame.id)}
            onHide={() => handleHideFrame(selectedFrame.id)}
            onReport={() => handleReportFrame(selectedFrame.id)}
            onDelete={() => handleDeleteFrame(selectedFrame.id)}
          />
        )}

        {/* Guest Sign-in Prompt */}
        {!user && (
          <div 
            className="fixed bottom-0 left-0 right-0 p-4 border-t"
            style={{
              backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <p className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                Sign in to create and share Frames
              </p>
              <Link
                to="/auth/signin"
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'rgb(168, 85, 247)', color: '#fff' }}
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </FullWidthLayout>
  );
};

// Frame Card Component
const FrameCard = ({ frame, isDark, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="aspect-square rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg relative group"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
      }}
      data-testid={`frame-card-${frame.id}`}
    >
      <img 
        src={frame.image_url} 
        alt={frame.caption || 'Frame'}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Hover overlay with creator info */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3"
      >
        <div className="flex items-center gap-2">
          {frame.creator_avatar ? (
            <img 
              src={frame.creator_avatar} 
              alt={frame.creator_name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: 'rgb(168, 85, 247)', color: '#fff' }}
            >
              {frame.creator_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="text-white text-sm font-medium truncate">
            {frame.creator_name}
          </span>
        </div>
      </div>
    </div>
  );
};

// Frame Detail Modal
const FrameDetailModal = ({ 
  frame, isDark, user, onClose, 
  showMenu, onToggleMenu, onHide, onReport, onDelete 
}) => {
  const [copied, setCopied] = useState(false);
  const isOwner = user && user.id === frame.creator_id;

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/socialworld/frames/${frame.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col lg:flex-row rounded-2xl overflow-hidden"
        style={{ backgroundColor: isDark ? '#1a1a1a' : '#fff' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white"
        >
          <X size={20} />
        </button>

        {/* Image */}
        <div className="flex-1 min-h-[300px] lg:min-h-0 bg-black flex items-center justify-center">
          <img 
            src={frame.image_url} 
            alt={frame.caption || 'Frame'}
            className="max-w-full max-h-[60vh] lg:max-h-[80vh] object-contain"
          />
        </div>

        {/* Info Panel */}
        <div 
          className="w-full lg:w-80 flex flex-col"
          style={{ 
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
          }}
        >
          {/* Creator Info */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center gap-3">
              {frame.creator_avatar ? (
                <img 
                  src={frame.creator_avatar} 
                  alt={frame.creator_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: 'rgb(168, 85, 247)', color: '#fff' }}
                >
                  {frame.creator_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <p className="font-medium" style={{ color: isDark ? '#fff' : '#111' }}>
                  {frame.creator_name}
                </p>
                <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                  {new Date(frame.created_at).toLocaleDateString('en-US', { 
                    month: 'short', day: 'numeric', year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={onToggleMenu}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
              >
                <MoreHorizontal size={18} />
              </button>

              {showMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-40 rounded-xl shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: isDark ? '#252525' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                  }}
                >
                  {isOwner ? (
                    <button
                      onClick={onDelete}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500"
                    >
                      <X size={16} />
                      Delete Frame
                    </button>
                  ) : (
                    <>
                      {user && (
                        <button
                          onClick={onHide}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm"
                          style={{ color: isDark ? '#fff' : '#111' }}
                        >
                          <EyeOff size={16} />
                          Hide Frame
                        </button>
                      )}
                      {user && (
                        <button
                          onClick={onReport}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500"
                        >
                          <Flag size={16} />
                          Report
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Caption */}
          {frame.caption && (
            <div className="p-4 flex-1 overflow-y-auto">
              <p 
                className="text-sm whitespace-pre-wrap"
                style={{ color: isDark ? 'rgb(200, 200, 200)' : 'rgb(60, 60, 60)' }}
              >
                {frame.caption}
              </p>
            </div>
          )}

          {/* Actions - Copy link + Pin */}
          <div 
            className="p-4 border-t"
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
          >
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: copied ? 'rgb(34, 197, 94)' : (isDark ? '#fff' : '#111')
                }}
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copied
                  </>
                ) : (
                  <>
                    <Link2 size={18} />
                    Copy link
                  </>
                )}
              </button>
              <PinButton
                contentType="frame"
                contentId={frame.id}
                snapshot={{
                  title: frame.caption || 'Frame',
                  subtitle: frame.creator_name,
                  image_url: frame.image_url,
                  route: `/socialworld/frames/${frame.id}`
                }}
                size="lg"
                className="px-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FramesPage;
