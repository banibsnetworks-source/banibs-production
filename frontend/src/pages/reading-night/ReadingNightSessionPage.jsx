/**
 * Reading Night - Session Detail/Player Page
 * /reading-night/:sessionId
 * 
 * Session detail with:
 * - Synopsis and metadata
 * - Join Live / Replay button
 * - Audio player with text display
 * - Post-session reflection form
 * - Link to discussion room
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen,
  Clock,
  Calendar,
  Users,
  Play,
  Pause,
  ArrowLeft,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const ReadingNightSessionPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken: token } = useAuth();
  const audioRef = useRef(null);
  
  // State
  const [session, setSession] = useState(null);
  const [userRsvp, setUserRsvp] = useState(null);
  const [userReflection, setUserReflection] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [reflectionPrompts, setReflectionPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  
  // RSVP state
  const [rsvpLoading, setRsvpLoading] = useState(false);
  
  // Reflection form state
  const [reflectionForm, setReflectionForm] = useState({
    prompt_1_response: '',
    prompt_2_response: '',
    prompt_3_response: ''
  });
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionSubmitted, setReflectionSubmitted] = useState(false);
  
  // Fetch session details
  const fetchSession = useCallback(async () => {
    if (!token || !sessionId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/reading-night/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setUserRsvp(data.user_rsvp);
        setUserReflection(data.user_reflection);
        setHasAccess(data.has_access);
        setReflectionPrompts(data.reflection_prompts || []);
        
        // Pre-fill reflection form if exists
        if (data.user_reflection) {
          setReflectionForm({
            prompt_1_response: data.user_reflection.prompt_1_response || '',
            prompt_2_response: data.user_reflection.prompt_2_response || '',
            prompt_3_response: data.user_reflection.prompt_3_response || ''
          });
          setReflectionSubmitted(true);
        }
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Failed to load session');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, sessionId]);
  
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);
  
  // Request Access (RSVP)
  const handleRequestAccess = async () => {
    if (!token) return;
    
    setRsvpLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/reading-night/sessions/${sessionId}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserRsvp(data.rsvp);
        if (data.status === 'approved') {
          setHasAccess(true);
        }
      }
    } catch (err) {
      console.error('RSVP failed:', err);
    } finally {
      setRsvpLoading(false);
    }
  };
  
  // Audio Controls
  const togglePlay = async () => {
    if (!audioRef.current) {
      // Load audio first time
      setAudioLoading(true);
      setAudioError(null);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/reading-night/sessions/${sessionId}/audio`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          
          const audio = new Audio(url);
          audioRef.current = audio;
          
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
            setAudioLoading(false);
            audio.play();
            setIsPlaying(true);
          });
          
          audio.addEventListener('timeupdate', () => {
            setCurrentTime(audio.currentTime);
          });
          
          audio.addEventListener('ended', () => {
            setIsPlaying(false);
          });
          
          audio.addEventListener('error', () => {
            setAudioError('Failed to load audio');
            setAudioLoading(false);
          });
        } else {
          const errData = await response.json();
          setAudioError(errData.detail || 'Audio not available');
          setAudioLoading(false);
        }
      } catch (err) {
        setAudioError('Failed to load audio');
        setAudioLoading(false);
      }
    } else {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };
  
  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Submit Reflection
  const handleSubmitReflection = async (e) => {
    e.preventDefault();
    
    setReflectionLoading(true);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/reading-night/sessions/${sessionId}/reflection`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          ...reflectionForm
        })
      });
      
      if (response.ok) {
        setReflectionSubmitted(true);
      }
    } catch (err) {
      console.error('Reflection submission failed:', err);
    } finally {
      setReflectionLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'On-demand';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }
  
  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => navigate('/reading-night')}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg"
          >
            Back to Reading Night
          </button>
        </div>
      </div>
    );
  }
  
  const isLive = session.status === 'live';
  const isReplay = session.status === 'replay';
  const canPlay = hasAccess && session.audio_status === 'ready';
  
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/reading-night')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reading Night
        </button>
        
        {/* Session Header */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-6">
          <div className="flex items-start gap-5">
            {/* Episode Badge */}
            {session.episode_number && (
              <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-white/70 text-xs block">EPISODE</span>
                  <span className="text-white font-bold text-2xl">{session.episode_number}</span>
                </div>
              </div>
            )}
            
            <div className="flex-1">
              {/* Status Badge */}
              <div className="mb-2">
                {isLive && (
                  <span className="px-3 py-1 bg-green-900/50 text-green-300 text-sm font-medium rounded-full border border-green-500/30 animate-pulse">
                    ● LIVE NOW
                  </span>
                )}
                {isReplay && (
                  <span className="px-3 py-1 bg-purple-900/50 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">
                    REPLAY AVAILABLE
                  </span>
                )}
                {session.status === 'scheduled' && (
                  <span className="px-3 py-1 bg-blue-900/50 text-blue-300 text-sm font-medium rounded-full border border-blue-500/30">
                    UPCOMING PREMIERE
                  </span>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{session.title}</h1>
              {session.subtitle && (
                <p className="text-gray-400 text-lg mb-3">{session.subtitle}</p>
              )}
              
              {/* Work Reference */}
              {session.work_title && (
                <p className="text-indigo-400 mb-4">
                  <BookOpen className="w-4 h-4 inline mr-2" />
                  Reading from: <span className="font-medium">{session.work_title}</span>
                </p>
              )}
              
              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {session.premiere_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(session.premiere_at)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {session.estimated_duration_minutes || 60} minutes
                </span>
                {session.word_count && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    {session.word_count.toLocaleString()} words
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {session.rsvp_count || 0} registered
                </span>
              </div>
            </div>
          </div>
          
          {/* Synopsis */}
          {session.synopsis && (
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">About This Session</h3>
              <p className="text-gray-300">{session.synopsis}</p>
            </div>
          )}
        </div>
        
        {/* Access Section */}
        {!hasAccess && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <Lock className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-amber-200 font-semibold mb-2">
                  {session.commitment_label || 'Commitment Pass'} Required
                </h3>
                <p className="text-amber-300/80 text-sm mb-4">
                  Request access to join this Reading Night session. 
                  {session.commitment_fee_cents > 0 && (
                    <span className="block mt-1">
                      Display fee: ${(session.commitment_fee_cents / 100).toFixed(2)} (not charged in pilot)
                    </span>
                  )}
                </p>
                
                {userRsvp ? (
                  <div className="flex items-center gap-2">
                    {userRsvp.status === 'pending' && (
                      <span className="px-3 py-1.5 bg-yellow-900/50 text-yellow-300 rounded-lg text-sm">
                        Access Pending Approval
                      </span>
                    )}
                    {userRsvp.status === 'denied' && (
                      <span className="px-3 py-1.5 bg-red-900/50 text-red-300 rounded-lg text-sm">
                        Access Not Approved
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleRequestAccess}
                    disabled={rsvpLoading}
                    className="px-5 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {rsvpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4" />
                        Request Access
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Audio Player */}
        {hasAccess && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-400" />
              Reading Session
            </h3>
            
            {session.audio_status !== 'ready' ? (
              <div className="text-center py-8">
                {session.audio_status === 'generating' ? (
                  <>
                    <Loader2 className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-spin" />
                    <p className="text-gray-400">Audio is being generated...</p>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Audio not yet available</p>
                  </>
                )}
              </div>
            ) : (
              <div>
                {/* Audio Error */}
                {audioError && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-4">
                    <p className="text-red-400 text-sm">{audioError}</p>
                  </div>
                )}
                
                {/* Player Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlay}
                    disabled={audioLoading}
                    className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {audioLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </button>
                  
                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div
                      onClick={handleSeek}
                      className="h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
                    >
                      <div
                        className="h-full bg-indigo-500 transition-all"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Reading Info */}
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-400 text-sm">
                    📖 This session is paced at the recommended comprehension speed (155–165 WPM).
                    No background music — pure focus on the text.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Discussion Link */}
        {session.discussion_room_link && hasAccess && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              Join the Discussion
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              After the reading, continue the conversation in the Peoples Room.
            </p>
            <a
              href={session.discussion_room_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
            >
              Go to Discussion Room
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
        
        {/* Reflection Form */}
        {hasAccess && reflectionPrompts.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Post-Session Reflection
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Take a moment to capture your thoughts. These are private to you and the session host.
            </p>
            
            {reflectionSubmitted && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Reflection saved! You can update it anytime.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmitReflection} className="space-y-5">
              {reflectionPrompts.map((prompt, idx) => (
                <div key={prompt.id}>
                  <label className="block text-white font-medium mb-1">
                    {prompt.prompt}
                  </label>
                  <p className="text-gray-500 text-sm mb-2">{prompt.description}</p>
                  <textarea
                    value={reflectionForm[`prompt_${idx + 1}_response`]}
                    onChange={(e) => setReflectionForm({
                      ...reflectionForm,
                      [`prompt_${idx + 1}_response`]: e.target.value
                    })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    placeholder="Your thoughts..."
                  />
                </div>
              ))}
              
              <button
                type="submit"
                disabled={reflectionLoading}
                className="w-full py-3 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-500 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reflectionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {reflectionSubmitted ? 'Update Reflection' : 'Submit Reflection'}
                  </>
                )}
              </button>
            </form>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ReadingNightSessionPage;
