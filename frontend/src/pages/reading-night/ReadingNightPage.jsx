/**
 * Reading Night - Landing Page
 * /reading-night
 * 
 * Lists upcoming premieres and available replays for BANIBS Reading Night.
 * Guided communal reading experience for comprehension-focused engagement.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  Calendar,
  Users,
  Play,
  ChevronRight,
  Lock,
  Unlock,
  Volume2,
  Info
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Status badge styles
const STATUS_STYLES = {
  scheduled: 'bg-blue-900/50 text-blue-300 border-blue-500/30',
  live: 'bg-green-900/50 text-green-300 border-green-500/30 animate-pulse',
  replay: 'bg-purple-900/50 text-purple-300 border-purple-500/30',
  draft: 'bg-gray-700/50 text-gray-400 border-gray-600'
};

const ReadingNightPage = () => {
  const { user, accessToken: token } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/reading-night/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Failed to load sessions');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);
  
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'On-demand';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Format duration
  const formatDuration = (minutes) => {
    if (!minutes) return '~60 min';
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };
  
  // Separate upcoming and replays
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'live');
  const replaySessions = sessions.filter(s => s.status === 'replay');
  
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30">
              <BookOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Reading Night</h1>
              <p className="text-gray-400">Guided Communal Reading Experience</p>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <Volume2 className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-indigo-200 font-semibold mb-2">Comprehension-First Reading</h3>
                <ul className="text-indigo-300/80 text-sm space-y-1">
                  <li>• Paced at 155–165 words per minute for optimal comprehension</li>
                  <li>• No background music during reading — pure focus</li>
                  <li>• Silent reflection time built into each session</li>
                  <li>• Discussion follows in the Peoples Room</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Upcoming Premieres */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Upcoming Premieres
                {upcomingSessions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-900/50 text-blue-300 text-sm rounded-full">
                    {upcomingSessions.length}
                  </span>
                )}
              </h2>
              
              {upcomingSessions.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming premieres scheduled</p>
                  <p className="text-gray-600 text-sm mt-1">Check back soon for new sessions</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map(session => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      navigate={navigate}
                      formatDate={formatDate}
                      formatDuration={formatDuration}
                    />
                  ))}
                </div>
              )}
            </section>
            
            {/* Available Replays */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-400" />
                Available Replays
                {replaySessions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-900/50 text-purple-300 text-sm rounded-full">
                    {replaySessions.length}
                  </span>
                )}
              </h2>
              
              {replaySessions.length === 0 ? (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
                  <Play className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500">No replays available yet</p>
                  <p className="text-gray-600 text-sm mt-1">Sessions become available for replay after the premiere</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {replaySessions.map(session => (
                    <SessionCard 
                      key={session.id} 
                      session={session} 
                      navigate={navigate}
                      formatDate={formatDate}
                      formatDuration={formatDuration}
                      compact
                    />
                  ))}
                </div>
              )}
            </section>
            
            {/* Empty state */}
            {sessions.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No Reading Nights Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Reading Night sessions will appear here once scheduled. 
                  These are guided communal reading experiences designed for deep comprehension.
                </p>
              </div>
            )}
          </>
        )}
        
      </div>
    </div>
  );
};

// Session Card Component
const SessionCard = ({ session, navigate, formatDate, formatDuration, compact = false }) => {
  const statusStyle = STATUS_STYLES[session.status] || STATUS_STYLES.draft;
  const isLive = session.status === 'live';
  
  return (
    <div
      onClick={() => navigate(`/reading-night/${session.id}`)}
      className={`bg-gray-900 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-all cursor-pointer group ${
        isLive ? 'ring-2 ring-green-500/50' : ''
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Episode badge */}
        {session.episode_number && !compact && (
          <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">E{session.episode_number}</span>
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          {/* Title & Status */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {session.title}
              </h3>
              {session.subtitle && (
                <p className="text-gray-400 text-sm">{session.subtitle}</p>
              )}
            </div>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusStyle}`}>
              {isLive ? '● LIVE' : session.status.toUpperCase()}
            </span>
          </div>
          
          {/* Work reference */}
          {session.work_title && (
            <p className="text-indigo-400/80 text-sm mb-2">
              Reading from: {session.work_title}
            </p>
          )}
          
          {/* Synopsis */}
          {session.synopsis && !compact && (
            <p className="text-gray-500 text-sm mb-3 line-clamp-2">{session.synopsis}</p>
          )}
          
          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {session.premiere_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(session.premiere_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDuration(session.estimated_duration_minutes)}
            </span>
            {session.rsvp_count > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {session.rsvp_count} registered
              </span>
            )}
            {session.audio_status === 'ready' && (
              <span className="flex items-center gap-1.5 text-green-400">
                <Volume2 className="w-4 h-4" />
                Audio ready
              </span>
            )}
          </div>
          
          {/* Commitment Pass indicator */}
          {session.commitment_fee_cents > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-900/30 text-amber-400 text-xs rounded">
              <Lock className="w-3 h-3" />
              {session.commitment_label}: ${(session.commitment_fee_cents / 100).toFixed(2)}
            </div>
          )}
        </div>
        
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
      </div>
    </div>
  );
};

export default ReadingNightPage;
