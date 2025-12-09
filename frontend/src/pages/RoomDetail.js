/**
 * Room Detail Page - Visitor View
 * Phase 5: Visitor-Side UI
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FullWidthLayout from '../components/layouts/FullWidthLayout';
import KnockModal from '../components/rooms/KnockModal';
import { useWebSocket } from '../contexts/WebSocketContext';
import { 
  getRoomStatus, 
  enterRoom, 
  leaveRoom 
} from '../services/roomsApi';

const RoomDetail = () => {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const { isConnected, subscribeToRoom, unsubscribeFromRoom, addEventListener } = useWebSocket();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomStatus, setRoomStatus] = useState(null);
  const [isKnockModalOpen, setIsKnockModalOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [knockApprovalMessage, setKnockApprovalMessage] = useState(null);

  // Fetch room status
  const fetchRoomStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await getRoomStatus(ownerId);
      setRoomStatus(status);
    } catch (err) {
      console.error('Failed to fetch room status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomStatus();
  }, [ownerId]);

  // WebSocket: Subscribe to room for real-time updates
  useEffect(() => {
    if (!ownerId || !isConnected) return;

    subscribeToRoom(ownerId);

    // Listen for knock approval/denial
    const unsubscribeKnockApproved = addEventListener('ROOM_KNOCK_APPROVED', (data) => {
      if (data.room_owner_id === ownerId) {
        console.log('✅ Knock approved!', data);
        setKnockApprovalMessage('Your knock was approved! You can now enter.');
        fetchRoomStatus(); // Refresh to get updated permissions
        
        // Clear message after 5 seconds
        setTimeout(() => setKnockApprovalMessage(null), 5000);
      }
    });

    const unsubscribeKnockDenied = addEventListener('ROOM_KNOCK_DENIED', (data) => {
      if (data.room_owner_id === ownerId) {
        console.log('❌ Knock denied', data);
        alert('Your knock was denied.');
        fetchRoomStatus();
      }
    });

    const unsubscribeSessionEnded = addEventListener('ROOM_SESSION_ENDED', (data) => {
      if (data.owner_id === ownerId) {
        console.log('🚪 Session ended', data);
        fetchRoomStatus();
      }
    });

    const unsubscribeVisitorEntered = addEventListener('ROOM_VISITOR_ENTERED', (data) => {
      console.log('👥 Visitor entered', data);
      fetchRoomStatus();
    });

    const unsubscribeVisitorLeft = addEventListener('ROOM_VISITOR_LEFT', (data) => {
      console.log('👥 Visitor left', data);
      fetchRoomStatus();
    });

    return () => {
      unsubscribeFromRoom(ownerId);
      unsubscribeKnockApproved();
      unsubscribeKnockDenied();
      unsubscribeSessionEnded();
      unsubscribeVisitorEntered();
      unsubscribeVisitorLeft();
    };
  }, [ownerId, isConnected, subscribeToRoom, unsubscribeFromRoom, addEventListener]);

  const handleEnterRoom = async () => {
    try {
      setIsEntering(true);
      await enterRoom(ownerId);
      await fetchRoomStatus();
    } catch (err) {
      console.error('Failed to enter room:', err);
      alert(err.message || 'Failed to enter room.');
    } finally {
      setIsEntering(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      setIsLeaving(true);
      await leaveRoom(ownerId);
      await fetchRoomStatus();
    } catch (err) {
      console.error('Failed to leave room:', err);
      alert('Failed to leave room.');
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading) {
    return (
      <FullWidthLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading room...</p>
          </div>
        </div>
      </FullWidthLayout>
    );
  }

  if (error) {
    return (
      <FullWidthLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Failed to load room</p>
            <p className="text-red-500 text-sm mt-2">{error}</p>
            <button 
              onClick={fetchRoomStatus}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </FullWidthLayout>
    );
  }

  const { owner, room, permissions, my_status } = roomStatus;
  const ownerInRoom = room?.owner_in_room;
  const doorState = room?.door_state || 'OPEN';
  const amInside = my_status?.am_inside;
  const havePendingKnock = my_status?.have_pending_knock;
  const visitors = room?.visitors || [];

  // Determine available actions
  const canEnter = permissions?.can_enter_direct && ownerInRoom && doorState === 'OPEN' && !amInside;
  const canKnock = permissions?.can_knock && ownerInRoom && doorState === 'OPEN' && !havePendingKnock && !amInside;
  const canLeave = amInside;

  return (
    <FullWidthLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-2xl">
                  {owner?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              
              {/* Owner Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {owner?.name || 'Unknown User'}'s Room
                </h1>
                <p className="text-gray-600">{owner?.email || owner?.handle || ownerId}</p>
                {permissions && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Your tier: {permissions.visitor_tier || 'OTHERS'}
                  </span>
                )}
              </div>
            </div>

            {/* Presence Status */}
            <div className="text-right">
              {ownerInRoom ? (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-green-600 font-medium">In Room</span>
                </div>
              ) : (
                <span className="text-gray-500">Not in room</span>
              )}
              
              {/* WebSocket Live Indicator */}
              {isConnected && (
                <div className="flex items-center justify-end gap-1.5 mt-2 text-sm text-green-600">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>Live</span>
                </div>
              )}
            </div>
          </div>

          {/* Room Status Bar */}
          <div className="mt-4 pt-4 border-t flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Door:</span>
              <span className="font-medium">
                {doorState === 'OPEN' && '🚪 Open'}
                {doorState === 'LOCKED' && '🔒 Locked'}
                {doorState === 'DND' && '⛔ Do Not Disturb'}
              </span>
            </div>
            {room?.visitor_count !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Visitors:</span>
                <span className="font-medium">{room.visitor_count}</span>
              </div>
            )}
            {amInside && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                You're inside
              </span>
            )}
            {havePendingKnock && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                Knock pending
              </span>
            )}
          </div>

          {/* Knock Approval Message */}
          {knockApprovalMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700 font-medium">✅ {knockApprovalMessage}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="flex gap-3">
            {canEnter && (
              <button
                onClick={handleEnterRoom}
                disabled={isEntering}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isEntering ? 'Entering...' : '🚪 Enter Room'}
              </button>
            )}
            {canKnock && (
              <button
                onClick={() => setIsKnockModalOpen(true)}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
              >
                👊 Knock on Door
              </button>
            )}
            {canLeave && (
              <button
                onClick={handleLeaveRoom}
                disabled={isLeaving}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLeaving ? 'Leaving...' : '🚪 Leave Room'}
              </button>
            )}
            {!canEnter && !canKnock && !canLeave && (
              <div className="text-gray-500">
                {doorState === 'LOCKED' && '🔒 Room is locked'}
                {doorState === 'DND' && '⛔ Owner is in Do Not Disturb mode'}
                {!ownerInRoom && 'Owner is not in their room'}
                {havePendingKnock && 'Your knock is pending approval'}
                {!permissions?.can_see_room && '🚫 You do not have permission to access this room'}
              </div>
            )}
          </div>
        </div>

        {/* Visitors List (if visible) */}
        {visitors.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Current Visitors ({visitors.length})</h2>
            <div className="space-y-3">
              {visitors.map((visitor) => (
                <div key={visitor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {visitor.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{visitor.name || visitor.handle || 'Unknown'}</p>
                    {visitor.tier && (
                      <p className="text-xs text-gray-500">{visitor.tier} tier</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-primary hover:underline"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Knock Modal */}
      <KnockModal
        isOpen={isKnockModalOpen}
        onClose={() => setIsKnockModalOpen(false)}
        ownerId={ownerId}
        ownerName={owner?.name || 'this user'}
        onKnockSent={fetchRoomStatus}
      />
    </FullWidthLayout>
  );
};

export default RoomDetail;
