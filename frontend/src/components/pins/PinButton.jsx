import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Bookmark, Check, Plus, X, Loader2 } from 'lucide-react';

/**
 * PinButton - Reusable component to pin content to boards
 * 
 * Usage:
 * <PinButton 
 *   contentType="frame" 
 *   contentId="abc123"
 *   snapshot={{ title: "My Frame", route: "/socialworld/frames/abc123", image_url: "..." }}
 * />
 */

const PinButton = ({ 
  contentType, 
  contentId, 
  snapshot,
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'icon', // 'icon', 'button', 'full'
  className = ''
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isPinned, setIsPinned] = useState(false);
  const [pinnedBoards, setPinnedBoards] = useState([]);
  const [boards, setBoards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkLoading, setCheckLoading] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Check pin status on mount
  useEffect(() => {
    if (user && contentType && contentId) {
      checkPinStatus();
    }
  }, [user, contentType, contentId]);

  const checkPinStatus = async () => {
    setCheckLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `${API_URL}/api/pins/check/${contentType}/${contentId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setIsPinned(data.is_pinned);
        setPinnedBoards(data.pins || []);
      }
    } catch (err) {
      console.error('Error checking pin status:', err);
    } finally {
      setCheckLoading(false);
    }
  };

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/pins/boards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBoards(data.boards || []);
      }
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  };

  const handlePinClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!user) {
      // Redirect to login
      window.location.href = `/auth/signin?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (isPinned) {
      // If already pinned, show modal to manage
      await fetchBoards();
      setShowModal(true);
    } else {
      // Quick pin to default board
      await pinToBoard(null);
    }
  };

  const pinToBoard = async (boardId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/pins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          board_id: boardId,
          content_type: contentType,
          content_id: contentId,
          content_snapshot: snapshot
        })
      });

      if (res.ok) {
        const data = await res.json();
        setIsPinned(true);
        if (data.created) {
          setPinnedBoards(prev => [...prev, { pin_id: data.pin.id, board_id: boardId || 'default' }]);
        }
        await checkPinStatus();
      }
    } catch (err) {
      console.error('Error pinning:', err);
    } finally {
      setLoading(false);
    }
  };

  const unpinFromBoard = async (pinId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/api/pins/${pinId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await checkPinStatus();
    } catch (err) {
      console.error('Error unpinning:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoardName.trim()) return;
    
    setCreatingBoard(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/pins/boards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newBoardName.trim() })
      });

      if (res.ok) {
        const newBoard = await res.json();
        setBoards(prev => [...prev, newBoard]);
        setNewBoardName('');
        setShowCreateBoard(false);
        // Auto-pin to new board
        await pinToBoard(newBoard.id);
      }
    } catch (err) {
      console.error('Error creating board:', err);
    } finally {
      setCreatingBoard(false);
    }
  };

  const isBoardPinned = (boardId) => {
    return pinnedBoards.some(p => p.board_id === boardId);
  };

  const getPinForBoard = (boardId) => {
    return pinnedBoards.find(p => p.board_id === boardId);
  };

  // Size variants
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  if (!user) {
    // Guest view - show disabled or prompt
    return (
      <button
        onClick={handlePinClick}
        className={`rounded-lg transition-all ${sizeClasses[size]} ${className}`}
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'
        }}
        title="Sign in to save"
        data-testid={`pin-button-${contentType}-${contentId}`}
      >
        <Bookmark size={iconSizes[size]} />
      </button>
    );
  }

  return (
    <>
      {/* Pin Button */}
      <button
        onClick={handlePinClick}
        disabled={loading || checkLoading}
        className={`rounded-lg transition-all ${sizeClasses[size]} ${className}`}
        style={{
          backgroundColor: isPinned 
            ? 'rgba(245, 158, 11, 0.2)' 
            : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
          color: isPinned 
            ? '#F59E0B' 
            : (isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)')
        }}
        title={isPinned ? 'Saved' : 'Save'}
        data-testid={`pin-button-${contentType}-${contentId}`}
      >
        {loading || checkLoading ? (
          <Loader2 size={iconSizes[size]} className="animate-spin" />
        ) : (
          <Bookmark 
            size={iconSizes[size]} 
            fill={isPinned ? '#F59E0B' : 'none'} 
          />
        )}
      </button>

      {/* Board Selector Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => setShowModal(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ backgroundColor: isDark ? '#1a1a1a' : '#fff' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 flex items-center justify-between border-b"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
            >
              <h3 className="font-semibold" style={{ color: isDark ? '#fff' : '#111' }}>
                Save to Board
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg"
                style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Boards List */}
            <div className="max-h-64 overflow-y-auto p-2">
              {boards.map(board => {
                const pinned = isBoardPinned(board.id);
                const pin = getPinForBoard(board.id);
                
                return (
                  <button
                    key={board.id}
                    onClick={() => {
                      if (pinned && pin) {
                        unpinFromBoard(pin.pin_id);
                      } else {
                        pinToBoard(board.id);
                      }
                    }}
                    disabled={loading}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                    style={{
                      backgroundColor: pinned 
                        ? (isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)')
                        : 'transparent'
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: pinned 
                          ? '#F59E0B' 
                          : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')
                      }}
                    >
                      {pinned ? (
                        <Check size={16} className="text-black" />
                      ) : (
                        <Bookmark size={16} style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p 
                        className="text-sm font-medium"
                        style={{ color: isDark ? '#fff' : '#111' }}
                      >
                        {board.name}
                        {board.is_default && (
                          <span className="ml-1 text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                            (Default)
                          </span>
                        )}
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
                      >
                        {board.pin_count || 0} item{board.pin_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Create New Board */}
            <div 
              className="p-3 border-t"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
            >
              {showCreateBoard ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="Board name"
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: isDark ? '#fff' : '#111'
                    }}
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && createBoard()}
                  />
                  <button
                    onClick={createBoard}
                    disabled={!newBoardName.trim() || creatingBoard}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black disabled:opacity-50"
                  >
                    {creatingBoard ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                  </button>
                  <button
                    onClick={() => { setShowCreateBoard(false); setNewBoardName(''); }}
                    className="p-2 rounded-lg"
                    style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateBoard(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                  }}
                >
                  <Plus size={16} />
                  Create new board
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PinButton;
