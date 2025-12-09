/**
 * My Room Page - Peoples Room Owner Dashboard
 * Phase 3: Basic UI Implementation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullWidthLayout from '../components/layouts/FullWidthLayout';
import { useWebSocket } from '../contexts/WebSocketContext';
import KnockList from '../components/rooms/KnockList';
import VisitorList from '../components/rooms/VisitorList';
import AccessListManager from '../components/rooms/AccessListManager';
import RoomSettings from '../components/rooms/RoomSettings';
import HighlightsTimeline from '../components/rooms/HighlightsTimeline';
import { 
  getMyRoom, 
  enterMyRoom, 
  exitMyRoom,
  getMyKnocks 
} from '../services/roomsApi';

const MyRoom = () => {
  const navigate = useNavigate();
  const { isConnected, subscribeToRoom, unsubscribeFromRoom, addEventListener } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Room state
  const [room, setRoom] = useState(null);
  const [session, setSession] = useState(null);
  const [knocks, setKnocks] = useState([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState('visitors');
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // Get current user ID
  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || null;
  };

  // Fetch room data
  const fetchRoomData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMyRoom();
      setRoom(data.room);
      setSession(data.session);
      
      // Fetch knocks if session is active
      if (data.session) {
        const knocksData = await getMyKnocks('PENDING');
        setKnocks(knocksData.knocks || []);
      }
      
    } catch (err) {
      console.error('Failed to fetch room data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomData();
  }, []);

  // WebSocket: Subscribe to own room for real-time updates
  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId || !isConnected) return;

    // Subscribe to room updates
    subscribeToRoom(userId);

    // Event listeners
    const unsubscribeKnockCreated = addEventListener('ROOM_KNOCK_CREATED', (data) => {
      console.log('🚪 New knock received:', data);
      // Refresh knocks list
      fetchRoomData();
    });

    const unsubscribeVisitorEntered = addEventListener('ROOM_VISITOR_ENTERED', (data) => {
      console.log('👤 Visitor entered:', data);
      // Update session with new visitor
      setSession(data.session);
    });

    const unsubscribeVisitorLeft = addEventListener('ROOM_VISITOR_LEFT', (data) => {
      console.log('👤 Visitor left:', data);
      // Refresh data to update visitor list
      fetchRoomData();
    });

    const unsubscribeDoorLocked = addEventListener('ROOM_DOOR_LOCKED', (data) => {
      console.log('🔒 Door locked:', data);
      setRoom(data.room);
    });

    const unsubscribeDoorUnlocked = addEventListener('ROOM_DOOR_UNLOCKED', (data) => {
      console.log('🔓 Door unlocked:', data);
      setRoom(data.room);
    });

    // Cleanup
    return () => {
      unsubscribeFromRoom(userId);
      unsubscribeKnockCreated();
      unsubscribeVisitorEntered();
      unsubscribeVisitorLeft();
      unsubscribeDoorLocked();
      unsubscribeDoorUnlocked();
    };
  }, [isConnected, subscribeToRoom, unsubscribeFromRoom, addEventListener]);

  // Enter room handler
  const handleEnterRoom = async () => {
    try {
      setIsEntering(true);
      const result = await enterMyRoom();
      setSession(result.session);
      await fetchRoomData(); // Refresh all data
    } catch (err) {
      console.error('Failed to enter room:', err);
      alert('Failed to enter room. Please try again.');
    } finally {
      setIsEntering(false);
    }
  };

  // Exit room handler
  const handleExitRoom = async () => {
    if (!window.confirm('Exit your room? This will end the session and remove all visitors.')) {
      return;
    }
    
    try {
      setIsExiting(true);
      await exitMyRoom();
      setSession(null);
      setKnocks([]);
      await fetchRoomData();
    } catch (err) {
      console.error('Failed to exit room:', err);
      alert('Failed to exit room. Please try again.');
    } finally {
      setIsExiting(false);
    }
  };

  const inSession = session && session.is_active;

  if (loading) {
    return (
      <FullWidthLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your room...</p>
          </div>
        </div>
      </FullWidthLayout>
    );
  }

  if (error) {
    return (
      <FullWidthLayout>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load room</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
            <button 
              onClick={fetchRoomData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </FullWidthLayout>
    );
  }

  return (
    <FullWidthLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Room</h1>
              <p className="text-gray-600 mt-1">
                Your personal, trust-aware social space
              </p>
            </div>
            
            {/* WebSocket Status Indicator */}
            {isConnected && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>Live</span>
              </div>
            )}
            
            {/* Presence Indicator */}
            <div className="flex items-center gap-4">
              {inSession ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-green-600 font-medium">In Room</span>
                  </div>
                  <button
                    onClick={handleExitRoom}
                    disabled={isExiting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isExiting ? 'Exiting...' : '🚪 Exit Room'}
                  </button>
                </>
              ) : (
                <>
                  <span className="text-gray-500">Not in room</span>
                  <button
                    onClick={handleEnterRoom}
                    disabled={isEntering}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isEntering ? 'Entering...' : '🚪 Enter Room'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Room Status Bar */}
          {room && (
            <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Door State:</span>
                <span className="font-medium">
                  {room.door_state === 'OPEN' && '🚪 Open'}
                  {room.door_state === 'LOCKED' && '🔒 Locked'}
                  {room.door_state === 'DND' && '⛔ Do Not Disturb'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Visitors:</span>
                <span className="font-medium">
                  {session?.current_visitors?.length || 0}
                </span>
              </div>
              {knocks.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Pending Knocks:</span>
                  <span className="font-medium text-yellow-600">
                    {knocks.length}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('visitors')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'visitors'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                👥 Visitors
                {inSession && session?.current_visitors?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white text-primary rounded-full text-xs">
                    {session.current_visitors.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('knocks')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'knocks'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🚪 Knocks
                {knocks.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white text-primary rounded-full text-xs">
                    {knocks.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('access-list')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'access-list'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔐 Access List
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => setActiveTab('highlights')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'highlights'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📌 Highlights
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'visitors' && (
              <VisitorList 
                session={session}
                inSession={inSession}
                onRefresh={fetchRoomData}
              />
            )}
            {activeTab === 'knocks' && (
              <KnockList 
                knocks={knocks}
                onRefresh={fetchRoomData}
              />
            )}
            {activeTab === 'access-list' && (
              <AccessListManager 
                room={room}
                onUpdate={fetchRoomData}
              />
            )}
            {activeTab === 'settings' && (
              <RoomSettings 
                room={room}
                onUpdate={fetchRoomData}
              />
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">🏠 About Your Peoples Room</h3>
          <p className="text-blue-800 text-sm">
            Your Peoples Room is your personal, sovereign social space. You control who can see it, 
            knock on it, and enter. Visitors respect your Circle Trust Order, and your Access List 
            can override any tier restrictions.
          </p>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default MyRoom;
