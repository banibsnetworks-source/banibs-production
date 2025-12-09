/**
 * Room Discovery Card Component
 * Shows room preview with trust-aware permissions
 * Phase 5: Visitor-Side UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRoomStatus } from '../../services/roomsApi';

const RoomDiscoveryCard = ({ ownerId, ownerInfo }) => {
  const navigate = useNavigate();
  const [roomStatus, setRoomStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomStatus = async () => {
      try {
        const status = await getRoomStatus(ownerId);
        setRoomStatus(status);
      } catch (err) {
        console.error('Failed to fetch room status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomStatus();
  }, [ownerId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-4 animate-pulse">
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!roomStatus) {
    return null;
  }

  const { owner, room, permissions } = roomStatus;
  const ownerInRoom = room?.owner_in_room;
  const doorState = room?.door_state || 'OPEN';
  const visitorCount = room?.visitor_count || 0;

  // Determine call-to-action based on permissions
  const getActionButton = () => {
    if (!permissions?.can_see_room) {
      return null; // Can't see room
    }

    if (doorState === 'LOCKED' || doorState === 'DND') {
      return (
        <button
          disabled
          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
        >
          🔒 {doorState === 'DND' ? 'Do Not Disturb' : 'Locked'}
        </button>
      );
    }

    if (!ownerInRoom) {
      return (
        <button
          disabled
          className="px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
        >
          Owner Not In
        </button>
      );
    }

    if (permissions?.can_enter_direct) {
      return (
        <button
          onClick={() => navigate(`/room/${ownerId}`)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🚪 Enter Room
        </button>
      );
    }

    if (permissions?.can_knock) {
      return (
        <button
          onClick={() => navigate(`/room/${ownerId}`)}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          👊 Knock
        </button>
      );
    }

    return (
      <button
        disabled
        className="px-4 py-2 bg-red-400 text-white rounded-lg cursor-not-allowed"
      >
        🚫 Not Allowed
      </button>
    );
  };

  return (
    <div 
      className="bg-white rounded-lg border hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md"
      onClick={() => navigate(`/room/${ownerId}`)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-lg">
                {owner?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            
            {/* Owner Info */}
            <div>
              <h3 className="font-semibold text-gray-900">
                {owner?.name || 'Unknown User'}'s Room
              </h3>
              <p className="text-sm text-gray-500">
                {owner?.email || owner?.handle || ownerId}
              </p>
            </div>
          </div>

          {/* Presence Indicator */}
          {ownerInRoom && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-600 font-medium">In Room</span>
            </div>
          )}
        </div>

        {/* Room Status */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>
            {doorState === 'OPEN' && '🚪 Open'}
            {doorState === 'LOCKED' && '🔒 Locked'}
            {doorState === 'DND' && '⛔ Do Not Disturb'}
          </span>
          {visitorCount > 0 && (
            <span>👥 {visitorCount} {visitorCount === 1 ? 'visitor' : 'visitors'}</span>
          )}
        </div>

        {/* Action Button */}
        <div onClick={(e) => e.stopPropagation()}>
          {getActionButton()}
        </div>

        {/* Permission Badge */}
        {permissions && (
          <div className="mt-3 pt-3 border-t">
            <span className="text-xs text-gray-500">
              Your access: 
              <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {permissions.visitor_tier || 'OTHERS'}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDiscoveryCard;
