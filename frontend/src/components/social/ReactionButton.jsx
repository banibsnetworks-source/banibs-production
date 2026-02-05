import React, { useState, useRef, useEffect } from 'react';
import { Heart, X } from 'lucide-react';

/**
 * BANIBS Multi-Reaction System v2.0
 * 
 * Reaction types (BANIBS-flavored):
 * - love ❤️ (respect/appreciation)
 * - high_five ✋ (support/encouragement)
 * - peace ✌️ (non-escalation/solidarity)
 * - like 👍 (general approval)
 * - cool 😎 (admiration)
 * 
 * Behavior:
 * - Single tap = apply default reaction (love)
 * - Long press (mobile) / Hover (desktop) = open reaction tray
 */

// Reaction definitions
const REACTIONS = [
  { type: 'love', emoji: '❤️', label: 'Love', color: '#EF4444' },
  { type: 'high_five', emoji: '✋', label: 'High Five', color: '#F59E0B' },
  { type: 'peace', emoji: '✌️', label: 'Peace', color: '#10B981' },
  { type: 'like', emoji: '👍', label: 'Like', color: '#3B82F6' },
  { type: 'cool', emoji: '😎', label: 'Cool', color: '#8B5CF6' },
];

const DEFAULT_REACTION = 'love';

// Get reaction data by type
export const getReactionData = (type) => {
  return REACTIONS.find(r => r.type === type) || REACTIONS[0];
};

/**
 * ReactionPicker - Tray of reaction options
 */
const ReactionPicker = ({ onSelect, onClose, currentReaction }) => {
  return (
    <div 
      className="absolute bottom-full left-0 mb-2 flex gap-1 p-2 rounded-full shadow-xl z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {REACTIONS.map((reaction) => (
        <button
          key={reaction.type}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(reaction.type);
          }}
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-125 ${
            currentReaction === reaction.type ? 'ring-2 ring-white/50 scale-110' : ''
          }`}
          style={{ backgroundColor: currentReaction === reaction.type ? `${reaction.color}22` : 'transparent' }}
          title={reaction.label}
        >
          <span className="text-xl">{reaction.emoji}</span>
        </button>
      ))}
    </div>
  );
};

/**
 * ReactionsModal - Shows who reacted to a post
 */
export const ReactionsModal = ({ isOpen, onClose, postId, totalCount }) => {
  const [reactors, setReactors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (isOpen && postId) {
      fetchReactors();
    }
  }, [isOpen, postId, activeFilter]);

  const fetchReactors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const filterParam = activeFilter !== 'all' ? `?reaction_type=${activeFilter}` : '';
      const response = await fetch(
        `${API_URL}/api/social/posts/${postId}/reactors${filterParam}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setReactors(data.reactors || []);
      }
    } catch (err) {
      console.error('Failed to fetch reactors:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden"
        style={{ 
          backgroundColor: '#1C1C1C',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Reactions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 p-3 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-white text-black' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            All {totalCount > 0 && `(${totalCount})`}
          </button>
          {REACTIONS.map(r => (
            <button
              key={r.type}
              onClick={() => setActiveFilter(r.type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
                activeFilter === r.type 
                  ? 'bg-white text-black' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span>{r.emoji}</span>
            </button>
          ))}
        </div>

        {/* Reactors list */}
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : reactors.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No reactions yet</div>
          ) : (
            <div className="divide-y divide-white/5">
              {reactors.map((reactor, idx) => {
                const reactionData = getReactionData(reactor.reaction_type);
                return (
                  <div key={idx} className="flex items-center gap-3 p-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center overflow-hidden">
                      {reactor.avatar_url ? (
                        <img src={reactor.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold">
                          {reactor.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    
                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{reactor.name}</p>
                    </div>
                    
                    {/* Reaction */}
                    <span className="text-xl" title={reactionData.label}>
                      {reactionData.emoji}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * ReactionButton - Main reaction button with picker
 */
export const ReactionButton = ({
  postId,
  viewerReaction,
  reactionCount,
  onReact,
  disabled = false,
  showCount = true,
  size = 'md'
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimer = useRef(null);
  const hoverTimer = useRef(null);
  const buttonRef = useRef(null);

  const currentReaction = viewerReaction ? getReactionData(viewerReaction) : null;
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-sm';
  const iconSize = size === 'sm' ? 16 : 18;

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  // Handle single click (toggle default reaction)
  const handleClick = () => {
    if (showPicker) {
      setShowPicker(false);
      return;
    }
    if (isLongPressing) {
      setIsLongPressing(false);
      return;
    }
    // Toggle: if already reacted, remove; otherwise add default
    if (viewerReaction) {
      onReact(viewerReaction); // This will toggle off
    } else {
      onReact(DEFAULT_REACTION);
    }
  };

  // Handle reaction selection from picker
  const handleSelectReaction = (type) => {
    onReact(type);
    setShowPicker(false);
  };

  // Long press handling (mobile)
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      setShowPicker(true);
    }, 350);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Hover handling (desktop)
  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setShowPicker(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    // Small delay before hiding picker to allow movement to picker
    setTimeout(() => {
      setShowPicker(false);
    }, 300);
  };

  return (
    <div className="relative" ref={buttonRef}>
      {/* Reaction Picker (shown on hover/long-press) */}
      {showPicker && (
        <ReactionPicker
          onSelect={handleSelectReaction}
          onClose={() => setShowPicker(false)}
          currentReaction={viewerReaction}
        />
      )}

      {/* Main Button */}
      <button
        type="button"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${sizeClass} ${
          viewerReaction
            ? 'hover:bg-opacity-20'
            : 'text-muted-foreground hover:bg-muted hover:text-card-foreground'
        } disabled:opacity-50`}
        style={viewerReaction ? { color: currentReaction.color } : {}}
        aria-label={viewerReaction ? `Reacted with ${currentReaction?.label}` : 'React'}
      >
        {viewerReaction ? (
          <span className="text-lg">{currentReaction.emoji}</span>
        ) : (
          <Heart size={iconSize} strokeWidth={2} />
        )}
        <span className="hidden sm:inline">
          {viewerReaction ? currentReaction.label : 'React'}
        </span>
      </button>

      {/* Count + Modal Trigger */}
      {showCount && reactionCount > 0 && (
        <button
          onClick={() => setShowModal(true)}
          className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
          title="View reactions"
        >
          {reactionCount}
        </button>
      )}

      {/* Reactors Modal */}
      <ReactionsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        postId={postId}
        totalCount={reactionCount}
      />
    </div>
  );
};

export { REACTIONS, DEFAULT_REACTION };
export default ReactionButton;
