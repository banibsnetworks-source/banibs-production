/**
 * Reading Night - Admin Page
 * /admin/reading-night
 * 
 * Admin tool to create and manage Reading Night sessions from Book Vault content.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Users,
  Volume2,
  Play,
  Settings,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Upload
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Status badge styles
const STATUS_STYLES = {
  draft: 'bg-gray-700 text-gray-300',
  scheduled: 'bg-blue-900/50 text-blue-300',
  live: 'bg-green-900/50 text-green-300',
  replay: 'bg-purple-900/50 text-purple-300',
  archived: 'bg-gray-800 text-gray-500'
};

// Audio status styles
const AUDIO_STATUS_STYLES = {
  pending: 'text-gray-400',
  generating: 'text-yellow-400 animate-pulse',
  ready: 'text-green-400',
  failed: 'text-red-400'
};

const ReadingNightAdminPage = () => {
  const { user, accessToken: token } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [sessions, setSessions] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState({});
  
  // Create form state
  const [newSession, setNewSession] = useState({
    title: '',
    subtitle: '',
    synopsis: '',
    work_id: '',
    episode_number: '',
    premiere_at: '',
    estimated_duration_minutes: 60,
    discussion_room_link: '',
    commitment_fee_cents: 0,
    commitment_label: 'Commitment Pass'
  });
  
  // Check role access
  const isAdmin = user?.roles?.includes('super_admin') || 
                  user?.roles?.includes('admin') || 
                  user?.roles?.includes('founder');
  
  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/reading-night/admin/sessions?include_drafts=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, [token]);
  
  // Fetch Book Vault works
  const fetchWorks = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/book-vault/works`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorks(data.works || []);
      }
    } catch (err) {
      console.error('Failed to fetch works:', err);
    }
  }, [token]);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSessions(), fetchWorks()]);
      setLoading(false);
    };
    loadData();
  }, [fetchSessions, fetchWorks]);
  
  // Create session
  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    if (!newSession.work_id) {
      alert('Please select a Book Vault work');
      return;
    }
    
    setCreating(true);
    
    try {
      const payload = {
        title: newSession.title,
        subtitle: newSession.subtitle || null,
        synopsis: newSession.synopsis || null,
        work_id: newSession.work_id,
        episode_number: newSession.episode_number ? parseInt(newSession.episode_number) : null,
        premiere_at: newSession.premiere_at ? new Date(newSession.premiere_at).toISOString() : null,
        estimated_duration_minutes: parseInt(newSession.estimated_duration_minutes) || 60,
        discussion_room_link: newSession.discussion_room_link || null,
        commitment_fee_cents: parseInt(newSession.commitment_fee_cents) || 0,
        commitment_label: newSession.commitment_label || 'Commitment Pass',
        speed_mode: 'standard'
      };
      
      const response = await fetch(`${BACKEND_URL}/api/reading-night/admin/sessions`, {
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
        setNewSession({
          title: '',
          subtitle: '',
          synopsis: '',
          work_id: '',
          episode_number: '',
          premiere_at: '',
          estimated_duration_minutes: 60,
          discussion_room_link: '',
          commitment_fee_cents: 0,
          commitment_label: 'Commitment Pass'
        });
        fetchSessions();
      } else {
        const errData = await response.json();
        alert(errData.detail || 'Failed to create session');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setCreating(false);
    }
  };
  
  // Generate audio
  const handleGenerateAudio = async (sessionId) => {
    setGeneratingAudio(prev => ({ ...prev, [sessionId]: true }));
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/reading-night/admin/sessions/${sessionId}/generate-audio`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        // Refresh sessions to see updated status
        setTimeout(fetchSessions, 1000);
        setTimeout(fetchSessions, 5000);
        setTimeout(fetchSessions, 15000);
      } else {
        const errData = await response.json();
        alert(errData.detail || 'Failed to generate audio');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setGeneratingAudio(prev => ({ ...prev, [sessionId]: false }));
    }
  };
  
  // Publish session
  const handlePublish = async (sessionId) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/reading-night/admin/sessions/${sessionId}/publish`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.ok) {
        fetchSessions();
      }
    } catch (err) {
      alert('Network error');
    }
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    return new Date(dateStr).toLocaleString();
  };
  
  // Access denied
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-300 mb-2">Access Denied</h2>
          <p className="text-red-400">Reading Night admin is restricted to administrators.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
                <BookOpen className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Reading Night Admin</h1>
                <p className="text-gray-400 text-sm">Create and manage reading sessions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Session
            </button>
          </div>
        </div>
        
        {/* Sessions List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No Sessions Yet</h3>
            <p className="text-gray-500 mb-4">Create your first Reading Night session</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Create Session
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div
                key={session.id}
                className="bg-gray-900 rounded-xl border border-gray-800 p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Episode badge */}
                  {session.episode_number && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                      <span className="text-indigo-400 font-bold">E{session.episode_number}</span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{session.title}</h3>
                        {session.subtitle && (
                          <p className="text-gray-400 text-sm">{session.subtitle}</p>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[session.status] || STATUS_STYLES.draft}`}>
                        {session.status.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Work */}
                    {session.work_title && (
                      <p className="text-indigo-400/80 text-sm mb-2">
                        From: {session.work_title}
                      </p>
                    )}
                    
                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(session.premiere_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.estimated_duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.rsvp_count || 0} RSVPs
                      </span>
                      <span className={`flex items-center gap-1 ${AUDIO_STATUS_STYLES[session.audio_status] || 'text-gray-400'}`}>
                        <Volume2 className="w-4 h-4" />
                        Audio: {session.audio_status}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {session.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleGenerateAudio(session.id)}
                            disabled={session.audio_status === 'generating' || generatingAudio[session.id]}
                            className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded hover:bg-amber-500 disabled:opacity-50 flex items-center gap-1"
                          >
                            {session.audio_status === 'generating' || generatingAudio[session.id] ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3" />
                                Generate Audio
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handlePublish(session.id)}
                            disabled={session.audio_status !== 'ready'}
                            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Publish
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/reading-night/${session.id}`)}
                        className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  Create Reading Night Session
                </h2>
              </div>
              
              <form onSubmit={handleCreateSession} className="p-6 space-y-4">
                {/* Work Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Book Vault Work <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={newSession.work_id}
                    onChange={(e) => {
                      const work = works.find(w => w.id === e.target.value);
                      setNewSession({
                        ...newSession,
                        work_id: e.target.value,
                        title: work ? `Reading: ${work.title}` : newSession.title
                      });
                    }}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select a work...</option>
                    {works.map(work => (
                      <option key={work.id} value={work.id}>
                        {work.order_key ? `[${work.order_key}] ` : ''}{work.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Session Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSession.title}
                    onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Reading Night: The Devil's Dismissive Argument"
                  />
                </div>
                
                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={newSession.subtitle}
                    onChange={(e) => setNewSession({...newSession, subtitle: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Episode 1: Recognition"
                  />
                </div>
                
                {/* Episode Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Episode #</label>
                    <input
                      type="number"
                      value={newSession.episode_number}
                      onChange={(e) => setNewSession({...newSession, episode_number: e.target.value})}
                      min="1"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={newSession.estimated_duration_minutes}
                      onChange={(e) => setNewSession({...newSession, estimated_duration_minutes: e.target.value})}
                      min="15"
                      max="180"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                {/* Premiere Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Premiere Date/Time</label>
                  <input
                    type="datetime-local"
                    value={newSession.premiere_at}
                    onChange={(e) => setNewSession({...newSession, premiere_at: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-gray-500 text-xs mt-1">Leave empty for on-demand only</p>
                </div>
                
                {/* Synopsis */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Synopsis</label>
                  <textarea
                    value={newSession.synopsis}
                    onChange={(e) => setNewSession({...newSession, synopsis: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="What this session covers..."
                  />
                </div>
                
                {/* Discussion Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Discussion Room Link</label>
                  <input
                    type="url"
                    value={newSession.discussion_room_link}
                    onChange={(e) => setNewSession({...newSession, discussion_room_link: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="https://..."
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
                    disabled={creating}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Session'
                    )}
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

export default ReadingNightAdminPage;
