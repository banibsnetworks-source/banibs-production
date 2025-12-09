/**
 * Room Highlights Timeline Component
 * Shows timeline of room events with filters
 * Phase 6.1: Room Highlights Timeline
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../utils/apiClient';
import { useWebSocket } from '../../contexts/WebSocketContext';

const HighlightsTimeline = ({ roomOwnerId, isOwnerView = false }) => {
  const { addEventListener } = useWebSocket();
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [total, setTotal] = useState(0);

  // Fetch highlights
  const fetchHighlights = async (filterType = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = isOwnerView 
        ? `/api/rooms/me/highlights?filter=${filterType}&limit=50`
        : `/api/rooms/${roomOwnerId}/highlights?filter=${filterType}&limit=50`;
      
      const response = await apiClient(endpoint);
      if (!response.ok) {
        throw new Error('Failed to fetch highlights');
      }
      
      const data = await response.json();
      setHighlights(data.highlights || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch highlights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights(filter);
  }, [roomOwnerId, filter]);

  // WebSocket: Listen for new highlights
  useEffect(() => {
    const unsubscribe = addEventListener('HIGHLIGHT_NEW', (data) => {
      if (data.owner_id === roomOwnerId || (isOwnerView && data.owner_id === getCurrentUserId())) {
        // Refresh highlights
        fetchHighlights(filter);
      }
    });

    return unsubscribe;
  }, [addEventListener, roomOwnerId, filter, isOwnerView]);

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || null;
  };

  const getEventIcon = (eventType) => {
    const icons = {
      'SESSION_STARTED': '🟢',
      'SESSION_ENDED': '🔴',
      'DOOR_LOCKED': '🔒',
      'DOOR_UNLOCKED': '🔓',
      'VISITOR_ENTERED': '👤',
      'VISITOR_LEFT': '👋',
      'KNOCK_CREATED': '✊',
      'KNOCK_APPROVED': '✔️',
      'KNOCK_DENIED': '✖️',
      'SPECIAL_MOMENT': '⭐'
    };
    return icons[eventType] || '📌';
  };

  const getEventColor = (eventType) => {
    const colors = {
      'SESSION_STARTED': 'bg-green-100 text-green-700 border-green-200',
      'SESSION_ENDED': 'bg-red-100 text-red-700 border-red-200',
      'DOOR_LOCKED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'DOOR_UNLOCKED': 'bg-blue-100 text-blue-700 border-blue-200',
      'VISITOR_ENTERED': 'bg-blue-100 text-blue-700 border-blue-200',
      'VISITOR_LEFT': 'bg-gray-100 text-gray-700 border-gray-200',
      'KNOCK_CREATED': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'KNOCK_APPROVED': 'bg-green-100 text-green-700 border-green-200',
      'KNOCK_DENIED': 'bg-red-100 text-red-700 border-red-200',
      'SPECIAL_MOMENT': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[eventType] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    // Less than 1 hour
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins}m ago`;
    }
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    // More than 24 hours
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading timeline...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => fetchHighlights(filter)}
          className="mt-2 text-xs text-red-700 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          All Events
        </button>
        <button
          onClick={() => setFilter('visitors')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            filter === 'visitors'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Visitors
        </button>
        <button
          onClick={() => setFilter('knocks')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            filter === 'knocks'
              ? 'bg-primary text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Knocks
        </button>
        {isOwnerView && (
          <button
            onClick={() => setFilter('my_activity')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              filter === 'my_activity'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Activity
          </button>
        )}
        <span className="ml-auto text-xs text-gray-500">
          {total} {total === 1 ? 'event' : 'events'}
        </span>
      </div>

      {/* Timeline */}
      {highlights.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">📌 No highlights yet</p>
          <p className="text-sm">Room activity will appear here as it happens</p>
        </div>
      ) : (
        <div className="space-y-3">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className={`flex gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${getEventColor(highlight.event_type)}`}
              style={{
                animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
              }}
            >
              {/* Icon */}
              <div className="text-2xl flex-shrink-0">
                {getEventIcon(highlight.event_type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">
                  {highlight.title}
                </p>
                {highlight.description && (
                  <p className="text-xs mt-1 opacity-75">
                    {highlight.description}
                  </p>
                )}
                {highlight.visitor_info && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-xs">
                      {highlight.visitor_info.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-xs font-medium">
                      {highlight.visitor_info.name || highlight.visitor_info.handle}
                    </span>
                    {highlight.metadata?.visitor_tier && (
                      <span className="text-xs px-1.5 py-0.5 bg-white/50 rounded">
                        {highlight.metadata.visitor_tier}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs mt-1 opacity-60">
                  {formatTimestamp(highlight.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HighlightsTimeline;
