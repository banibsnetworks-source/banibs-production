/**
 * Book Editor - Chapter-based Writing Studio
 * Founder-only distraction-free writing environment
 * 
 * Features:
 * - Chapter navigation sidebar
 * - Distraction-free editor
 * - Autosave with debounce
 * - Chapter CRUD
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ArrowLeft, Plus, Save, Trash2, FileText, Book, 
  Check, Loader2, GripVertical, Edit3, X, Menu,
  ChevronLeft, ChevronRight, Clock, AlertCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const AUTOSAVE_DELAY = 2000; // 2 seconds

const BookEditor = () => {
  const { bookId } = useParams();
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  
  // Book and chapters state
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Editor state
  const [content, setContent] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  
  // Refs
  const autosaveTimerRef = useRef(null);
  const editorRef = useRef(null);

  const isSuperAdmin = user?.role === 'super_admin' || user?.roles?.includes('super_admin');

  // Fetch book and chapters
  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate('/');
      return;
    }
    fetchBook();
  }, [bookId, isSuperAdmin, navigate]);

  const fetchBook = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/books/${bookId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error('Book not found');
        throw new Error('Failed to fetch book');
      }
      
      const data = await res.json();
      setBook(data.book);
      setChapters(data.chapters || []);
      
      // Select first chapter if exists
      if (data.chapters?.length > 0) {
        selectChapter(data.chapters[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectChapter = (chapter) => {
    // Save current chapter before switching
    if (hasUnsavedChanges && activeChapterId) {
      saveChapterContent(activeChapterId, content);
    }
    
    setActiveChapterId(chapter.id);
    setContent(chapter.content || '');
    setChapterTitle(chapter.title || '');
    setHasUnsavedChanges(false);
    setLastSaved(chapter.updated_at ? new Date(chapter.updated_at) : null);
  };

  // Autosave handler
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    
    // Clear existing timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    
    // Set new autosave timer
    autosaveTimerRef.current = setTimeout(() => {
      if (activeChapterId) {
        saveChapterContent(activeChapterId, newContent);
      }
    }, AUTOSAVE_DELAY);
  }, [activeChapterId]);

  const saveChapterContent = async (chapterId, contentToSave) => {
    if (!chapterId) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/chapters/${chapterId}/autosave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: contentToSave })
      });
      
      if (!res.ok) throw new Error('Autosave failed');
      
      const data = await res.json();
      setLastSaved(new Date(data.saved_at));
      setHasUnsavedChanges(false);
      
      // Update chapter in list
      setChapters(chapters.map(c => 
        c.id === chapterId 
          ? { ...c, content: contentToSave, word_count: data.word_count }
          : c
      ));
    } catch (err) {
      console.error('Autosave error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async (e) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/books/${bookId}/chapters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newChapterTitle, content: '' })
      });
      
      if (!res.ok) throw new Error('Failed to create chapter');
      
      const data = await res.json();
      setChapters([...chapters, data.chapter]);
      selectChapter(data.chapter);
      setShowNewChapterModal(false);
      setNewChapterTitle('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter? This cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/chapters/${chapterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete chapter');
      
      const updatedChapters = chapters.filter(c => c.id !== chapterId);
      setChapters(updatedChapters);
      
      // Select another chapter or clear
      if (activeChapterId === chapterId) {
        if (updatedChapters.length > 0) {
          selectChapter(updatedChapters[0]);
        } else {
          setActiveChapterId(null);
          setContent('');
          setChapterTitle('');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateChapterTitle = async () => {
    if (!chapterTitle.trim() || !activeChapterId) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/chapters/${activeChapterId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: chapterTitle })
      });
      
      if (!res.ok) throw new Error('Failed to update chapter title');
      
      setChapters(chapters.map(c => 
        c.id === activeChapterId ? { ...c, title: chapterTitle } : c
      ));
      setEditingTitle(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never saved';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  // Cleanup autosave timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  if (!isSuperAdmin) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-destructive mb-4" size={48} />
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => navigate('/founder/book-vault')}
            className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg"
          >
            Back to Book Vault
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-72' : 'w-0'} border-r border-border flex-shrink-0 transition-all duration-300 overflow-hidden`}
        style={{ backgroundColor: isDark ? 'rgb(17, 17, 17)' : 'rgb(250, 250, 250)' }}
      >
        <div className="w-72 h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <button
              onClick={() => navigate('/founder/book-vault')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3"
              data-testid="back-to-vault"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Back to Vault</span>
            </button>
            
            <h2 className="text-lg font-bold text-foreground truncate flex items-center gap-2">
              <Book className="text-amber-500 flex-shrink-0" size={20} />
              {book?.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {chapters.length} chapter{chapters.length !== 1 ? 's' : ''} • {book?.word_count?.toLocaleString() || 0} words
            </p>
          </div>
          
          {/* Chapter List */}
          <div className="flex-1 overflow-y-auto p-2">
            {chapters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                No chapters yet
              </div>
            ) : (
              <div className="space-y-1">
                {chapters.map((chapter, idx) => (
                  <div
                    key={chapter.id}
                    onClick={() => selectChapter(chapter)}
                    className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                      activeChapterId === chapter.id
                        ? 'bg-amber-500/20 border border-amber-500/30'
                        : 'hover:bg-muted'
                    }`}
                    data-testid={`chapter-${chapter.id}`}
                  >
                    <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                    <span className={`flex-1 text-sm truncate ${
                      activeChapterId === chapter.id ? 'text-amber-500 font-medium' : 'text-foreground'
                    }`}>
                      {chapter.title}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-all"
                    >
                      <Trash2 size={14} className="text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Add Chapter Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => setShowNewChapterModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-lg hover:bg-amber-500/20 transition-colors"
              data-testid="add-chapter-btn"
            >
              <Plus size={18} />
              Add Chapter
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              data-testid="toggle-sidebar"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
            </button>
            
            {activeChapterId ? (
              editingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    onBlur={handleUpdateChapterTitle}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateChapterTitle()}
                    className="px-2 py-1 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateChapterTitle}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Check size={16} className="text-green-500" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingTitle(true)}
                  className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition-colors"
                >
                  <span className="font-medium text-foreground">{chapterTitle}</span>
                  <Edit3 size={14} className="text-muted-foreground" />
                </button>
              )
            ) : (
              <span className="text-muted-foreground">Select a chapter to start writing</span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{wordCount.toLocaleString()} words</span>
            <span className="flex items-center gap-1">
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Clock size={14} />
                  Unsaved changes
                </>
              ) : (
                <>
                  <Check size={14} className="text-green-500" />
                  {formatLastSaved()}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto">
          {activeChapterId ? (
            <div className="max-w-3xl mx-auto px-8 py-12">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Start writing your chapter..."
                className="w-full min-h-[calc(100vh-200px)] bg-transparent text-foreground text-lg leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/50"
                style={{
                  fontFamily: 'Georgia, serif',
                  lineHeight: '1.8'
                }}
                data-testid="chapter-editor"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Book size={64} className="mb-4 opacity-30" />
              <p className="text-lg mb-4">
                {chapters.length === 0 
                  ? 'Create your first chapter to begin writing'
                  : 'Select a chapter from the sidebar'
                }
              </p>
              {chapters.length === 0 && (
                <button
                  onClick={() => setShowNewChapterModal(true)}
                  className="px-4 py-2 bg-amber-500 text-gray-900 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Create First Chapter
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Chapter Modal */}
      {showNewChapterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="text-amber-500" />
              New Chapter
            </h2>
            
            <form onSubmit={handleCreateChapter}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Chapter Title
                </label>
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  placeholder="e.g., Chapter 1: The Beginning"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  autoFocus
                  data-testid="new-chapter-title"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChapterModal(false);
                    setNewChapterTitle('');
                  }}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChapterTitle.trim()}
                  className="flex-1 px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  data-testid="submit-new-chapter"
                >
                  Create Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookEditor;
