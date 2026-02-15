import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Bookmark, Plus, MoreHorizontal, Search, Filter, 
  Trash2, Edit2, X, Check, Loader2, ExternalLink,
  Image, FileText, ShoppingBag, Shield, Newspaper
} from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';

/**
 * Pins Home Page
 * 
 * User's private pin boards - platform-wide content organization
 * Left: list of boards
 * Right: pins in selected board
 */

const CONTENT_TYPE_ICONS = {
  frame: Image,
  news: Newspaper,
  listing: ShoppingBag,
  hdos_analysis: Shield,
  article: FileText,
  video: FileText,
  product: ShoppingBag,
  note: FileText
};

const CONTENT_TYPE_LABELS = {
  frame: 'Frame',
  news: 'News',
  listing: 'Listing',
  hdos_analysis: 'HDOS Analysis',
  article: 'Article',
  video: 'Video',
  product: 'Product',
  note: 'Note'
};

const PinsHomePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinsLoading, setPinsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);

  // Modals
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [editBoardName, setEditBoardName] = useState('');
  const [editBoardDesc, setEditBoardDesc] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/signin?redirect=/pins');
    }
  }, [user, authLoading, navigate]);

  // Fetch boards
  const fetchBoards = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/pins/boards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch boards');
      
      const data = await res.json();
      setBoards(data.boards || []);
      
      // Select board from URL or default
      const boardIdParam = searchParams.get('board');
      if (boardIdParam) {
        const board = data.boards.find(b => b.id === boardIdParam);
        if (board) setSelectedBoard(board);
        else if (data.boards.length > 0) setSelectedBoard(data.boards[0]);
      } else if (data.boards.length > 0) {
        setSelectedBoard(data.boards[0]);
      }
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError('Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, [API_URL, user, searchParams]);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // Fetch pins for selected board
  const fetchPins = useCallback(async (cursor = null) => {
    if (!selectedBoard) return;
    
    try {
      setPinsLoading(true);
      const token = localStorage.getItem('access_token');
      
      let url = `${API_URL}/api/pins?board_id=${selectedBoard.id}&limit=24`;
      if (typeFilter) url += `&content_type=${typeFilter}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      if (cursor) url += `&cursor=${cursor}`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch pins');
      
      const data = await res.json();
      
      if (cursor) {
        setPins(prev => [...prev, ...(data.pins || [])]);
      } else {
        setPins(data.pins || []);
      }
      setHasMore(data.has_more || false);
      setNextCursor(data.next_cursor || null);
    } catch (err) {
      console.error('Error fetching pins:', err);
    } finally {
      setPinsLoading(false);
    }
  }, [API_URL, selectedBoard, typeFilter, searchQuery]);

  useEffect(() => {
    if (selectedBoard) {
      fetchPins();
      // Update URL
      setSearchParams({ board: selectedBoard.id });
    }
  }, [selectedBoard, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedBoard) fetchPins();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectBoard = (board) => {
    setSelectedBoard(board);
    setSearchQuery('');
    setTypeFilter('');
  };

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/pins/boards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newBoardName.trim(),
          description: newBoardDesc.trim() || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create board');
      }

      const newBoard = await res.json();
      setBoards(prev => [...prev, newBoard]);
      setSelectedBoard(newBoard);
      setNewBoardName('');
      setNewBoardDesc('');
      setShowCreateBoard(false);
    } catch (err) {
      console.error('Error creating board:', err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBoard = async () => {
    if (!showEditBoard || !editBoardName.trim()) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/pins/boards/${showEditBoard.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editBoardName.trim(),
          description: editBoardDesc.trim() || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to update board');
      }

      const updatedBoard = await res.json();
      setBoards(prev => prev.map(b => b.id === updatedBoard.id ? updatedBoard : b));
      if (selectedBoard?.id === updatedBoard.id) {
        setSelectedBoard(updatedBoard);
      }
      setShowEditBoard(null);
    } catch (err) {
      console.error('Error updating board:', err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBoard = async (moveToDefault = true) => {
    if (!showDeleteConfirm) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(
        `${API_URL}/api/pins/boards/${showDeleteConfirm.id}?move_pins_to_default=${moveToDefault}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to delete board');
      }

      setBoards(prev => prev.filter(b => b.id !== showDeleteConfirm.id));
      if (selectedBoard?.id === showDeleteConfirm.id) {
        const defaultBoard = boards.find(b => b.is_default);
        setSelectedBoard(defaultBoard || boards[0]);
      }
      setShowDeleteConfirm(null);
      // Refresh to get updated pin counts
      fetchBoards();
    } catch (err) {
      console.error('Error deleting board:', err);
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePin = async (pinId) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/api/pins/${pinId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setPins(prev => prev.filter(p => p.id !== pinId));
      // Update board pin count locally
      setBoards(prev => prev.map(b => 
        b.id === selectedBoard?.id 
          ? { ...b, pin_count: Math.max(0, (b.pin_count || 0) - 1) }
          : b
      ));
    } catch (err) {
      console.error('Error deleting pin:', err);
    }
  };

  const loadMore = () => {
    if (nextCursor) {
      fetchPins(nextCursor);
    }
  };

  // Get unique content types from pins for filter
  const availableTypes = [...new Set(pins.map(p => p.content_type))];

  if (authLoading || loading) {
    return (
      <FullWidthLayout>
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}
        >
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      </FullWidthLayout>
    );
  }

  if (!user) return null;

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
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Bookmark size={28} className="text-amber-500" />
                <div>
                  <h1 className="text-xl font-semibold" style={{ color: isDark ? '#fff' : '#111' }}>
                    Saved Items
                  </h1>
                  <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                    Your private collection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Left: Boards List */}
            <div className="w-64 flex-shrink-0">
              <div 
                className="sticky top-24 rounded-xl overflow-hidden"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                {/* Boards Header */}
                <div 
                  className="px-4 py-3 flex items-center justify-between border-b"
                  style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
                >
                  <span className="text-sm font-medium" style={{ color: isDark ? '#fff' : '#111' }}>
                    Boards
                  </span>
                  <button
                    onClick={() => setShowCreateBoard(true)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-amber-500/20"
                    style={{ color: '#F59E0B' }}
                    data-testid="create-board-btn"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* Boards List */}
                <div className="p-2 space-y-1" data-testid="boards-list">
                  {boards.map(board => (
                    <BoardItem
                      key={board.id}
                      board={board}
                      isSelected={selectedBoard?.id === board.id}
                      isDark={isDark}
                      onSelect={() => handleSelectBoard(board)}
                      onEdit={() => {
                        setShowEditBoard(board);
                        setEditBoardName(board.name);
                        setEditBoardDesc(board.description || '');
                      }}
                      onDelete={() => setShowDeleteConfirm(board)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Pins Grid */}
            <div className="flex-1 min-w-0">
              {selectedBoard && (
                <>
                  {/* Board Title & Filters */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold" style={{ color: isDark ? '#fff' : '#111' }}>
                        {selectedBoard.name}
                      </h2>
                      {selectedBoard.description && (
                        <p className="text-sm" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                          {selectedBoard.description}
                        </p>
                      )}
                    </div>

                    {/* Search */}
                    <div 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                      }}
                    >
                      <Search size={16} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search pins..."
                        className="bg-transparent outline-none text-sm w-32"
                        style={{ color: isDark ? '#fff' : '#111' }}
                      />
                    </div>

                    {/* Type Filter */}
                    {availableTypes.length > 1 && (
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 rounded-lg text-sm outline-none"
                        style={{
                          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          color: isDark ? '#fff' : '#111'
                        }}
                      >
                        <option value="">All types</option>
                        {availableTypes.map(type => (
                          <option key={type} value={type}>
                            {CONTENT_TYPE_LABELS[type] || type}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Pins Grid */}
                  {pinsLoading && pins.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                      <Loader2 size={24} className="animate-spin text-amber-500" />
                    </div>
                  ) : pins.length === 0 ? (
                    <div className="text-center py-16">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.05)' }}
                      >
                        <Bookmark size={32} className="text-amber-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                        No pins yet
                      </h3>
                      <p className="text-sm" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                        Save content from across BANIBS to organize here
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="pins-grid">
                        {pins.map(pin => (
                          <PinCard
                            key={pin.id}
                            pin={pin}
                            isDark={isDark}
                            onDelete={() => handleDeletePin(pin.id)}
                          />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="text-center mt-8">
                          <button
                            onClick={loadMore}
                            disabled={pinsLoading}
                            className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
                            style={{
                              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                              color: isDark ? '#fff' : '#111'
                            }}
                          >
                            {pinsLoading ? (
                              <Loader2 size={18} className="animate-spin inline" />
                            ) : (
                              'Load more'
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        {/* Create Board Modal */}
        {showCreateBoard && (
          <Modal 
            isDark={isDark} 
            onClose={() => setShowCreateBoard(false)}
            title="Create Board"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111'
                  }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  Description <span className="text-gray-500">(optional)</span>
                </label>
                <textarea
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  placeholder="What is this board for?"
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateBoard(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#fff' : '#111'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                disabled={!newBoardName.trim() || actionLoading}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin inline" /> : 'Create'}
              </button>
            </div>
          </Modal>
        )}

        {/* Edit Board Modal */}
        {showEditBoard && (
          <Modal 
            isDark={isDark} 
            onClose={() => setShowEditBoard(null)}
            title="Edit Board"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111'
                  }}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  Description
                </label>
                <textarea
                  value={editBoardDesc}
                  onChange={(e) => setEditBoardDesc(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111'
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditBoard(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#fff' : '#111'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditBoard}
                disabled={!editBoardName.trim() || actionLoading}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={16} className="animate-spin inline" /> : 'Save'}
              </button>
            </div>
          </Modal>
        )}

        {/* Delete Board Confirm Modal */}
        {showDeleteConfirm && (
          <Modal 
            isDark={isDark} 
            onClose={() => setShowDeleteConfirm(null)}
            title="Delete Board"
          >
            <p className="text-sm mb-4" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
              Are you sure you want to delete "{showDeleteConfirm.name}"?
            </p>
            {showDeleteConfirm.pin_count > 0 && (
              <p className="text-sm mb-4" style={{ color: '#F59E0B' }}>
                This board has {showDeleteConfirm.pin_count} pin(s). Choose what to do with them:
              </p>
            )}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleDeleteBoard(true)}
                disabled={actionLoading}
                className="w-full py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#fff' : '#111'
                }}
              >
                {showDeleteConfirm.pin_count > 0 ? 'Move pins to Saved & Delete' : 'Delete Board'}
              </button>
              {showDeleteConfirm.pin_count > 0 && (
                <button
                  onClick={() => handleDeleteBoard(false)}
                  disabled={actionLoading}
                  className="w-full py-2 rounded-lg text-sm font-medium text-red-500"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)'
                  }}
                >
                  Delete board and all pins
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-2 rounded-lg text-sm font-medium"
                style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
      </div>
    </FullWidthLayout>
  );
};

// Board List Item Component
const BoardItem = ({ board, isSelected, isDark, onSelect, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors relative`}
      style={{
        backgroundColor: isSelected 
          ? (isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)')
          : 'transparent'
      }}
      onClick={onSelect}
      data-testid={`board-item-${board.id}`}
    >
      <Bookmark 
        size={16} 
        className={isSelected ? 'text-amber-500' : ''}
        style={{ color: isSelected ? '#F59E0B' : (isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)') }}
        fill={isSelected ? '#F59E0B' : 'none'}
      />
      <span 
        className="flex-1 text-sm truncate"
        style={{ color: isSelected ? '#F59E0B' : (isDark ? '#fff' : '#111') }}
      >
        {board.name}
      </span>
      <span 
        className="text-xs"
        style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
      >
        {board.pin_count || 0}
      </span>

      {/* Menu Button */}
      {!board.is_default && (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
              />
              <div 
                className="absolute right-0 top-full mt-1 w-32 rounded-lg shadow-lg overflow-hidden z-20"
                style={{
                  backgroundColor: isDark ? '#252525' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm"
                  style={{ color: isDark ? '#fff' : '#111' }}
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Pin Card Component
const PinCard = ({ pin, isDark, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const snapshot = pin.content_snapshot || {};
  const Icon = CONTENT_TYPE_ICONS[pin.content_type] || FileText;

  return (
    <div 
      className="group rounded-xl overflow-hidden relative"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
      }}
      data-testid={`pin-card-${pin.id}`}
    >
      {/* Image or Placeholder */}
      <Link to={snapshot.route || '#'} className="block">
        {snapshot.image_url ? (
          <div className="aspect-square">
            <img 
              src={snapshot.image_url} 
              alt={snapshot.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div 
            className="aspect-square flex items-center justify-center"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
          >
            <Icon size={40} style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }} />
          </div>
        )}
      </Link>

      {/* Content Type Badge */}
      <div 
        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium"
        style={{
          backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
          color: isDark ? '#fff' : '#111'
        }}
      >
        {CONTENT_TYPE_LABELS[pin.content_type] || pin.content_type}
      </div>

      {/* Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.9)',
          color: isDark ? '#fff' : '#111'
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      {/* Menu Dropdown */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div 
            className="absolute top-10 right-2 w-32 rounded-lg shadow-lg overflow-hidden z-20"
            style={{
              backgroundColor: isDark ? '#252525' : '#fff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <Link
              to={snapshot.route || '#'}
              className="flex items-center gap-2 px-3 py-2 text-sm"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              <ExternalLink size={14} />
              View
            </Link>
            <button
              onClick={() => { onDelete(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        </>
      )}

      {/* Title */}
      <div className="p-3">
        <Link to={snapshot.route || '#'}>
          <h3 
            className="text-sm font-medium line-clamp-2"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            {snapshot.title || 'Untitled'}
          </h3>
        </Link>
        {snapshot.subtitle && (
          <p 
            className="text-xs mt-1 truncate"
            style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
          >
            {snapshot.subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

// Simple Modal Component
const Modal = ({ isDark, onClose, title, children }) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    onClick={onClose}
  >
    <div 
      className="w-full max-w-sm rounded-2xl p-6"
      style={{ backgroundColor: isDark ? '#1a1a1a' : '#fff' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: isDark ? '#fff' : '#111' }}>
          {title}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg"
          style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default PinsHomePage;
