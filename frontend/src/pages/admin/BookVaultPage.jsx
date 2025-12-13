/**
 * Book Vault - Library Home Page
 * /admin/books
 * 
 * Admin-only module for managing founder's literary works.
 * Features: Work listing, filtering, search, create work, export
 * 
 * GUIDING PRINCIPLES:
 * 1) Nothing gets lost: edits create versions
 * 2) Admin/Founder only
 * 3) Fast retrieval with search
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Library,
  BookOpen,
  Search,
  Plus,
  Filter,
  Download,
  ChevronRight,
  Tag,
  Clock,
  AlertTriangle,
  FileText,
  Bookmark,
  Edit3,
  Archive
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Series options
const SERIES_OPTIONS = [
  { value: '', label: 'All Series' },
  { value: 'D', label: 'D-Series (Devil\'s)' },
  { value: 'G', label: 'G-Series (God\'s)' },
  { value: 'O', label: 'O-Series (Other)' },
  { value: 'BANIBS', label: 'BANIBS' },
  { value: 'LIFE', label: 'Life' },
  { value: 'OTHER', label: 'Other' }
];

// Status options
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'planned', label: 'Planned' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
];

// Work type options
const WORK_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'book', label: 'Book' },
  { value: 'volume', label: 'Volume' },
  { value: 'companion', label: 'Companion' },
  { value: 'appendix', label: 'Appendix' },
  { value: 'module', label: 'Module' },
  { value: 'note', label: 'Note' }
];

// Status badge colors
const STATUS_COLORS = {
  planned: 'bg-gray-700 text-gray-300',
  drafting: 'bg-amber-900/50 text-amber-300',
  review: 'bg-blue-900/50 text-blue-300',
  published: 'bg-green-900/50 text-green-300',
  archived: 'bg-red-900/30 text-red-400'
};

// Series badge colors
const SERIES_COLORS = {
  D: 'bg-red-900/30 text-red-400 border-red-700',
  G: 'bg-amber-900/30 text-amber-400 border-amber-700',
  O: 'bg-purple-900/30 text-purple-400 border-purple-700',
  BANIBS: 'bg-blue-900/30 text-blue-400 border-blue-700',
  LIFE: 'bg-green-900/30 text-green-400 border-green-700',
  OTHER: 'bg-gray-700/50 text-gray-400 border-gray-600'
};

const BookVaultPage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [seriesFilter, setSeriesFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [seeding, setSeeding] = useState(false);
  
  // Create form state
  const [newWork, setNewWork] = useState({
    title: '',
    subtitle: '',
    series_key: 'OTHER',
    work_type: 'book',
    order_key: '',
    status: 'planned',
    description: '',
    tags: ''
  });
  
  // Check role access
  const isSuperAdmin = user?.roles?.includes('super_admin') || 
                       user?.roles?.includes('admin') || 
                       user?.roles?.includes('founder');
  
  // Fetch works
  const fetchWorks = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (seriesFilter) params.append('series_key', seriesFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('work_type', typeFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/works?${params.toString()}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setWorks(data.works || []);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Failed to fetch works');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, seriesFilter, statusFilter, typeFilter, searchQuery]);
  
  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);
  
  // Seed initial data
  const handleSeed = async () => {
    if (!confirm('Seed the vault with canonical works? This only works if the vault is empty.')) {
      return;
    }
    
    setSeeding(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/book-vault/seed`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Vault seeded successfully!');
        fetchWorks();
      } else {
        alert(data.message || 'Seed failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSeeding(false);
    }
  };
  
  // Create new work
  const handleCreateWork = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...newWork,
        tags: newWork.tags ? newWork.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      
      const response = await fetch(`${BACKEND_URL}/api/book-vault/works`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowCreateModal(false);
        setNewWork({
          title: '',
          subtitle: '',
          series_key: 'OTHER',
          work_type: 'book',
          order_key: '',
          status: 'planned',
          description: '',
          tags: ''
        });
        // Navigate to the new work
        navigate(`/admin/books/${data.work.id}`);
      } else {
        const errData = await response.json();
        alert(errData.detail || 'Failed to create work');
      }
    } catch (err) {
      alert('Network error');
    }
  };
  
  // Export work
  const handleExport = async (workId, workTitle) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/works/${workId}/export/markdown`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${workTitle.replace(/\s+/g, '_')}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert('Export failed');
      }
    } catch (err) {
      alert('Export error');
    }
  };
  
  // Access denied view
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
          <p className="text-red-400">
            Book Vault is restricted to Founder and Admin users only.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
              <Library className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Book Vault</h1>
              <p className="text-gray-400 text-sm">Founder&apos;s Literary Works Library</p>
            </div>
            <div className="ml-auto flex gap-2">
              <button
                onClick={handleSeed}
                disabled={seeding}
                className="px-3 py-1.5 text-xs bg-gray-800 text-gray-400 rounded border border-gray-700 hover:bg-gray-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : 'Seed Vault'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Work
              </button>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-200 font-medium mb-1">Vault preserves drafts & versions — nothing is overwritten.</p>
                <p className="text-amber-300/70 text-sm">
                  All edits create new versions. Locked entries require a new version to change content.
                  Exports include a watermark for internal use only.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search works..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
            
            {/* Series Filter */}
            <select
              value={seriesFilter}
              onChange={(e) => setSeriesFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            >
              {SERIES_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
            >
              {WORK_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {/* Works List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-20">
            <Library className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No works found</h3>
            <p className="text-gray-500 mb-4">
              {seriesFilter || statusFilter || typeFilter || searchQuery
                ? 'Try adjusting your filters'
                : 'Click "Seed Vault" to add canonical works, or create a new work'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
            >
              Create First Work
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {works.map(work => (
              <div
                key={work.id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors cursor-pointer group"
                onClick={() => navigate(`/admin/books/${work.id}`)}
              >
                <div className="flex items-start gap-4">
                  {/* Work Icon */}
                  <div className={`p-3 rounded-lg ${SERIES_COLORS[work.series_key] || SERIES_COLORS.OTHER} border`}>
                    <BookOpen className="w-6 h-6" />
                  </div>
                  
                  {/* Work Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {work.order_key && (
                        <span className="text-xs text-gray-500 font-mono">{work.order_key}</span>
                      )}
                      <h3 className="text-lg font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                        {work.title}
                      </h3>
                    </div>
                    
                    {work.subtitle && (
                      <p className="text-gray-400 text-sm mb-2 truncate">{work.subtitle}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[work.status] || STATUS_COLORS.planned}`}>
                        {work.status}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {work.work_type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${SERIES_COLORS[work.series_key] || SERIES_COLORS.OTHER}`}>
                        {work.series_key}-Series
                      </span>
                    </div>
                    
                    {work.description && (
                      <p className="text-gray-500 text-sm line-clamp-2">{work.description}</p>
                    )}
                    
                    {work.tags && work.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {work.tags.slice(0, 5).map((tag, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                        {work.tags.length > 5 && (
                          <span className="text-xs text-gray-500">+{work.tags.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(work.id, work.title);
                      }}
                      className="p-2 text-gray-500 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
                      title="Export Markdown"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-amber-400 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Create Work Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-400" />
                  Create New Work
                </h2>
              </div>
              
              <form onSubmit={handleCreateWork} className="p-6 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newWork.title}
                    onChange={(e) => setNewWork({...newWork, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="e.g., The Devil's Dismissive Argument"
                  />
                </div>
                
                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={newWork.subtitle}
                    onChange={(e) => setNewWork({...newWork, subtitle: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                
                {/* Series & Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Series</label>
                    <select
                      value={newWork.series_key}
                      onChange={(e) => setNewWork({...newWork, series_key: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="D">D-Series</option>
                      <option value="G">G-Series</option>
                      <option value="O">O-Series</option>
                      <option value="BANIBS">BANIBS</option>
                      <option value="LIFE">Life</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                    <select
                      value={newWork.work_type}
                      onChange={(e) => setNewWork({...newWork, work_type: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="book">Book</option>
                      <option value="volume">Volume</option>
                      <option value="companion">Companion</option>
                      <option value="appendix">Appendix</option>
                      <option value="module">Module</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                </div>
                
                {/* Order Key & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Order Key</label>
                    <input
                      type="text"
                      value={newWork.order_key}
                      onChange={(e) => setNewWork({...newWork, order_key: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                      placeholder="e.g., D-1, G-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                    <select
                      value={newWork.status}
                      onChange={(e) => setNewWork({...newWork, status: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="planned">Planned</option>
                      <option value="drafting">Drafting</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    value={newWork.description}
                    onChange={(e) => setNewWork({...newWork, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                
                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                  <input
                    type="text"
                    value={newWork.tags}
                    onChange={(e) => setNewWork({...newWork, tags: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                    placeholder="Comma-separated tags"
                  />
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
                  >
                    Create Work
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default BookVaultPage;
