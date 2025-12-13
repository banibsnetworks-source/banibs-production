/**
 * Book Vault - Work Detail Page
 * /admin/books/:workId
 * 
 * Tabs: Overview, Entries, Editor, Export
 * Features: CRUD for entries, version history, content editing, export
 * 
 * GUIDING PRINCIPLES:
 * 1) Nothing gets lost: "Save New Version" creates versions
 * 2) "Pull Down / Copy" for fast retrieval
 * 3) Locked entry badge shown when locked
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Library,
  BookOpen,
  FileText,
  Edit3,
  Save,
  Download,
  ArrowLeft,
  Plus,
  Clock,
  Tag,
  Lock,
  Unlock,
  Copy,
  Check,
  AlertTriangle,
  Trash2,
  ChevronRight,
  History,
  Eye
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Entry type options
const ENTRY_TYPE_OPTIONS = [
  { value: 'chapter', label: 'Chapter', icon: '📖' },
  { value: 'section', label: 'Section', icon: '📑' },
  { value: 'blurb', label: 'Blurb', icon: '💬' },
  { value: 'page_copy', label: 'Page Copy', icon: '📄' },
  { value: 'outline', label: 'Outline', icon: '📋' },
  { value: 'scripture_note', label: 'Scripture Note', icon: '✝️' },
  { value: 'research_note', label: 'Research Note', icon: '🔬' },
  { value: 'appendix', label: 'Appendix', icon: '📎' },
  { value: 'asset', label: 'Asset', icon: '🖼️' }
];

// Status colors
const STATUS_COLORS = {
  planned: 'bg-gray-700 text-gray-300',
  drafting: 'bg-amber-900/50 text-amber-300',
  review: 'bg-blue-900/50 text-blue-300',
  published: 'bg-green-900/50 text-green-300',
  archived: 'bg-red-900/30 text-red-400'
};

const BookVaultDetailPage = () => {
  const { workId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken: token } = useAuth();
  
  // State
  const [work, setWork] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview | entries | editor | export
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Form states
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    entry_type: 'chapter',
    title: '',
    order_index: null,
    tags: '',
    content: ''
  });
  const [editorContent, setEditorContent] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  
  // Edit metadata state
  const [editingMetadata, setEditingMetadata] = useState(false);
  const [metadataForm, setMetadataForm] = useState({});
  
  // Check role access
  const isSuperAdmin = user?.roles?.includes('super_admin') || 
                       user?.roles?.includes('admin') || 
                       user?.roles?.includes('founder');
  
  // Fetch work details
  const fetchWork = useCallback(async () => {
    if (!token || !workId) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/works/${workId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setWork(data.work);
        setMetadataForm(data.work);
      } else {
        setError('Work not found');
      }
    } catch (err) {
      setError('Failed to load work');
    }
  }, [token, workId]);
  
  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!token || !workId) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/works/${workId}/entries`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  }, [token, workId]);
  
  // Fetch entry with version
  const fetchEntry = async (entryId) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/entries/${entryId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSelectedEntry(data.entry);
        setCurrentVersion(data.current_version);
        setEditorContent(data.current_version?.content || '');
        
        // Fetch version history
        fetchVersions(entryId);
      }
    } catch (err) {
      console.error('Failed to fetch entry:', err);
    }
  };
  
  // Fetch versions
  const fetchVersions = async (entryId) => {
    if (!token) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/entries/${entryId}/versions`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setVersions(data.versions || []);
      }
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchWork();
      await fetchEntries();
      setLoading(false);
    };
    loadData();
  }, [fetchWork, fetchEntries]);
  
  // Create new entry
  const handleCreateEntry = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        entry_type: newEntry.entry_type,
        title: newEntry.title,
        order_index: newEntry.order_index ? parseInt(newEntry.order_index) : null,
        tags: newEntry.tags ? newEntry.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        content: newEntry.content || null,
        content_format: 'markdown'
      };
      
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/works/${workId}/entries`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setShowAddEntry(false);
        setNewEntry({
          entry_type: 'chapter',
          title: '',
          order_index: null,
          tags: '',
          content: ''
        });
        fetchEntries();
        // Select the new entry
        fetchEntry(data.entry.id);
        setActiveTab('editor');
      } else {
        const errData = await response.json();
        alert(errData.detail || 'Failed to create entry');
      }
    } catch (err) {
      alert('Network error');
    }
  };
  
  // Save new version
  const handleSaveVersion = async () => {
    if (!selectedEntry || !editorContent.trim()) return;
    
    if (selectedEntry.is_locked) {
      alert('Entry is locked. Cannot create new versions.');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/entries/${selectedEntry.id}/versions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: editorContent,
            content_format: 'markdown',
            source: 'user',
            notes: versionNotes || null
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setCurrentVersion(data.version);
        setVersionNotes('');
        fetchVersions(selectedEntry.id);
        alert('Version saved!');
      } else {
        const errData = await response.json();
        alert(errData.detail || 'Failed to save version');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };
  
  // Copy content to clipboard
  const handleCopyContent = async () => {
    if (!editorContent) return;
    
    try {
      await navigator.clipboard.writeText(editorContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert('Failed to copy');
    }
  };
  
  // Update work metadata
  const handleUpdateMetadata = async () => {
    setSaving(true);
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/works/${workId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: metadataForm.title,
            subtitle: metadataForm.subtitle,
            status: metadataForm.status,
            order_key: metadataForm.order_key,
            description: metadataForm.description,
            tags: metadataForm.tags
          })
        }
      );
      
      if (response.ok) {
        setEditingMetadata(false);
        fetchWork();
      } else {
        const errData = await response.json();
        alert(errData.detail || 'Failed to update');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSaving(false);
    }
  };
  
  // Export work
  const handleExport = async () => {
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
        a.download = `${work?.title?.replace(/\s+/g, '_') || 'export'}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      alert('Export failed');
    }
  };
  
  // Export single entry
  const handleExportEntry = async () => {
    if (!selectedEntry) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/entries/${selectedEntry.id}/export/markdown`,
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
        a.download = `${selectedEntry.title?.replace(/\s+/g, '_') || 'entry'}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      alert('Export failed');
    }
  };
  
  // Lock/unlock entry
  const handleToggleLock = async () => {
    if (!selectedEntry) return;
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/book-vault/entries/${selectedEntry.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ is_locked: !selectedEntry.is_locked })
        }
      );
      
      if (response.ok) {
        fetchEntry(selectedEntry.id);
      }
    } catch (err) {
      alert('Failed to toggle lock');
    }
  };
  
  // Access denied
  if (!user || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
          <p className="text-red-400">Book Vault is restricted to Founder and Admin users only.</p>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (error || !work) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Work not found'}</p>
          <button
            onClick={() => navigate('/admin/books')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Back to Library
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/books')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </button>
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30">
              <BookOpen className="w-8 h-8 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {work.order_key && (
                  <span className="text-sm text-gray-500 font-mono">{work.order_key}</span>
                )}
                <h1 className="text-2xl font-bold text-white">{work.title}</h1>
                <span className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[work.status] || STATUS_COLORS.planned}`}>
                  {work.status}
                </span>
              </div>
              {work.subtitle && (
                <p className="text-gray-400">{work.subtitle}</p>
              )}
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Work
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-4 overflow-x-auto">
          {[
            { id: 'overview', icon: Eye, label: 'Overview' },
            { id: 'entries', icon: FileText, label: `Entries (${entries.length})` },
            { id: 'editor', icon: Edit3, label: 'Editor' },
            { id: 'export', icon: Download, label: 'Export' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                Work Overview
              </h2>
              <button
                onClick={() => setEditingMetadata(!editingMetadata)}
                className="px-3 py-1.5 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                {editingMetadata ? 'Cancel' : 'Edit Metadata'}
              </button>
            </div>
            
            {editingMetadata ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={metadataForm.title || ''}
                      onChange={(e) => setMetadataForm({...metadataForm, title: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={metadataForm.subtitle || ''}
                      onChange={(e) => setMetadataForm({...metadataForm, subtitle: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Order Key</label>
                    <input
                      type="text"
                      value={metadataForm.order_key || ''}
                      onChange={(e) => setMetadataForm({...metadataForm, order_key: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                    <select
                      value={metadataForm.status || 'planned'}
                      onChange={(e) => setMetadataForm({...metadataForm, status: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                      <option value="planned">Planned</option>
                      <option value="drafting">Drafting</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Description</label>
                  <textarea
                    value={metadataForm.description || ''}
                    onChange={(e) => setMetadataForm({...metadataForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <button
                  onClick={handleUpdateMetadata}
                  disabled={saving}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Series</p>
                    <p className="text-white font-medium">{work.series_key}-Series</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Type</p>
                    <p className="text-white font-medium capitalize">{work.work_type}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Entries</p>
                    <p className="text-white font-medium">{entries.length}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Created</p>
                    <p className="text-white font-medium">
                      {new Date(work.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {work.description && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Description</p>
                    <p className="text-white">{work.description}</p>
                  </div>
                )}
                
                {work.tags && work.tags.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {work.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* ENTRIES TAB */}
        {activeTab === 'entries' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Entries
              </h2>
              <button
                onClick={() => setShowAddEntry(true)}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Entry
              </button>
            </div>
            
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500">No entries yet. Add your first entry.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map(entry => {
                  const typeInfo = ENTRY_TYPE_OPTIONS.find(t => t.value === entry.entry_type);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => {
                        fetchEntry(entry.id);
                        setActiveTab('editor');
                      }}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id
                          ? 'bg-amber-900/20 border-amber-500'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{typeInfo?.icon || '📄'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {entry.order_index != null && (
                              <span className="text-xs text-gray-500 font-mono">#{entry.order_index}</span>
                            )}
                            <h3 className="font-medium text-white truncate">{entry.title}</h3>
                            {entry.is_locked && (
                              <Lock className="w-4 h-4 text-amber-400" title="Locked" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 capitalize">{entry.entry_type.replace('_', ' ')}</span>
                            {entry.tags && entry.tags.length > 0 && (
                              <span className="text-xs text-gray-600">• {entry.tags.join(', ')}</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </div>
                      {entry.content_preview && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{entry.content_preview}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Add Entry Modal */}
            {showAddEntry && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-white">Add New Entry</h2>
                  </div>
                  
                  <form onSubmit={handleCreateEntry} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Type</label>
                        <select
                          value={newEntry.entry_type}
                          onChange={(e) => setNewEntry({...newEntry, entry_type: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        >
                          {ENTRY_TYPE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Order</label>
                        <input
                          type="number"
                          value={newEntry.order_index || ''}
                          onChange={(e) => setNewEntry({...newEntry, order_index: e.target.value})}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                          placeholder="e.g., 1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Title *</label>
                      <input
                        type="text"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                        required
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Tags</label>
                      <input
                        type="text"
                        value={newEntry.tags}
                        onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        placeholder="Comma-separated"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Initial Content (Markdown)</label>
                      <textarea
                        value={newEntry.content}
                        onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                        rows={6}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                        placeholder="Optional initial content..."
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddEntry(false)}
                        className="flex-1 py-2 px-4 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
                      >
                        Create Entry
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* EDITOR TAB */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Entry List (sidebar) */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 lg:col-span-1 max-h-[600px] overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Entries</h3>
              {entries.length === 0 ? (
                <p className="text-gray-600 text-sm">No entries</p>
              ) : (
                <div className="space-y-1">
                  {entries.map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => fetchEntry(entry.id)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        selectedEntry?.id === entry.id
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {entry.is_locked && <Lock className="w-3 h-3" />}
                        <span className="truncate">{entry.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Editor Area */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 lg:col-span-2">
              {!selectedEntry ? (
                <div className="text-center py-12">
                  <Edit3 className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">Select an entry to edit</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Entry Header */}
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">{selectedEntry.title}</h3>
                        {selectedEntry.is_locked && (
                          <span className="px-2 py-0.5 bg-amber-900/30 text-amber-400 text-xs rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" /> LOCKED
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 capitalize">{selectedEntry.entry_type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleToggleLock}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                        title={selectedEntry.is_locked ? 'Unlock' : 'Lock'}
                      >
                        {selectedEntry.is_locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleCopyContent}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                        title="Pull Down / Copy"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleExportEntry}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
                        title="Export Entry"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Locked Warning */}
                  {selectedEntry.is_locked && (
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-amber-300 text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        LOCKED — create new version to change content
                      </p>
                    </div>
                  )}
                  
                  {/* Content Editor */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Content (Markdown)</label>
                    <textarea
                      value={editorContent}
                      onChange={(e) => setEditorContent(e.target.value)}
                      disabled={selectedEntry.is_locked}
                      rows={15}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                  
                  {/* Version Notes */}
                  {!selectedEntry.is_locked && (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Version Notes (optional)</label>
                      <input
                        type="text"
                        value={versionNotes}
                        onChange={(e) => setVersionNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        placeholder="What changed in this version?"
                      />
                    </div>
                  )}
                  
                  {/* Save Button */}
                  <button
                    onClick={handleSaveVersion}
                    disabled={saving || selectedEntry.is_locked || !editorContent.trim()}
                    className="w-full py-3 px-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save New Version
                      </>
                    )}
                  </button>
                  
                  {/* Version History */}
                  {versions.length > 0 && (
                    <div className="border-t border-gray-800 pt-4">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Version History ({versions.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {versions.map(v => (
                          <div
                            key={v.id}
                            className={`p-2 rounded-lg text-sm ${
                              v.id === currentVersion?.id
                                ? 'bg-amber-900/20 border border-amber-500/30'
                                : 'bg-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white font-mono">v{v.version_number}</span>
                              <span className="text-gray-500 text-xs">
                                {new Date(v.created_at).toLocaleString()}
                              </span>
                            </div>
                            {v.notes && (
                              <p className="text-gray-400 text-xs mt-1">{v.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <Download className="w-5 h-5 text-amber-400" />
              Export Options
            </h2>
            
            <div className="space-y-4">
              {/* Export Work */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-white">Export Entire Work</h3>
                    <p className="text-sm text-gray-400">
                      Download all entries as compiled Markdown with watermark
                    </p>
                  </div>
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Work
                  </button>
                </div>
              </div>
              
              {/* Export Selected Entry */}
              {selectedEntry && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white">Export Selected Entry</h3>
                      <p className="text-sm text-gray-400">
                        &quot;{selectedEntry.title}&quot; as Markdown
                      </p>
                    </div>
                    <button
                      onClick={handleExportEntry}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Entry
                    </button>
                  </div>
                </div>
              )}
              
              {/* Watermark Notice */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4">
                <p className="text-amber-300 text-sm">
                  All exports include a watermark: &quot;BANIBS Book Vault — Internal Draft — Not for distribution&quot;
                </p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default BookVaultDetailPage;
