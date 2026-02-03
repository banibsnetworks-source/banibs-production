/**
 * Book Vault Studio - Main Page
 * Founder-only book authoring system
 * 
 * v1 Features:
 * - View all books
 * - Create new book
 * - Edit/delete books
 * - Navigate to chapter editor
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import GlobalNavBar from '../../components/GlobalNavBar';
import { 
  Book, Plus, Edit3, Trash2, FileText, Clock, 
  BookOpen, AlertCircle, Loader2, ArrowLeft, Image
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const BookVaultStudio = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', description: '' });
  const [creating, setCreating] = useState(false);

  // Check super_admin access - check both role and roles array
  const isSuperAdmin = user?.role === 'super_admin' || user?.roles?.includes('super_admin');

  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate('/');
      return;
    }
    if (isSuperAdmin) {
      fetchBooks();
    }
  }, [user, isSuperAdmin, navigate]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/books`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch books');
      
      const data = await res.json();
      setBooks(data.books || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!newBook.title.trim()) return;
    
    setCreating(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/books`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
      });
      
      if (!res.ok) throw new Error('Failed to create book');
      
      const data = await res.json();
      setBooks([data.book, ...books]);
      setShowCreateModal(false);
      setNewBook({ title: '', description: '' });
      
      // Navigate to the new book's editor
      navigate(`/founder/book-vault/${data.book.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Delete this book and all its chapters? This cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/book-vault/books/${bookId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete book');
      
      setBooks(books.filter(b => b.id !== bookId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-amber-500" size={48} />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalNavBar sectionTitle="Book Vault Studio" />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/founder/control-center')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              data-testid="back-to-control-center"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BookOpen className="text-amber-500" />
                Book Vault Studio
              </h1>
              <p className="text-muted-foreground mt-1">
                Write and manage your books • {books.length} book{books.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            data-testid="create-book-btn"
          >
            <Plus size={20} />
            New Book
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-destructive" size={20} />
            <span className="text-destructive">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={48} />
          </div>
        )}

        {/* Empty State */}
        {!loading && books.length === 0 && (
          <div className="text-center py-16">
            <BookOpen size={64} className="mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No books yet</h2>
            <p className="text-muted-foreground mb-6">
              Start your first book and bring your ideas to life.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-amber-500 text-gray-900 font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Create Your First Book
            </button>
          </div>
        )}

        {/* Books Grid */}
        {!loading && books.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:border-amber-500/50 transition-all group"
                data-testid={`book-card-${book.id}`}
              >
                {/* Cover */}
                <div 
                  className="aspect-[3/2] bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center relative"
                  style={{
                    backgroundImage: book.cover_url ? `url(${book.cover_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!book.cover_url && (
                    <Book size={48} className="text-amber-500/40" />
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      book.status === 'draft' 
                        ? 'bg-yellow-500/20 text-yellow-600' 
                        : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {book.status === 'draft' ? 'Draft' : 'Archived'}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                    {book.title}
                  </h3>
                  {book.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {book.description}
                    </p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {book.chapter_count} chapter{book.chapter_count !== 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <Book size={14} />
                      {book.word_count?.toLocaleString() || 0} words
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock size={14} />
                    Updated {formatDate(book.updated_at)}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/founder/book-vault/${book.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-gray-900 font-medium rounded-lg hover:bg-amber-600 transition-colors"
                      data-testid={`edit-book-${book.id}`}
                    >
                      <Edit3 size={16} />
                      Write
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      data-testid={`delete-book-${book.id}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Book Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Plus className="text-amber-500" />
              Create New Book
            </h2>
            
            <form onSubmit={handleCreateBook}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Book Title *
                </label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="Enter book title..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  autoFocus
                  data-testid="new-book-title"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Brief description of your book..."
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  data-testid="new-book-description"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBook({ title: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBook.title.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-gray-900 font-semibold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                  data-testid="submit-create-book"
                >
                  {creating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Creating...
                    </>
                  ) : (
                    'Create Book'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookVaultStudio;
