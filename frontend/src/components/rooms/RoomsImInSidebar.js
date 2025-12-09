/**
 * Rooms I'm In Sidebar
 * Shows list of rooms user is currently visiting
 * Phase 5: Visitor-Side UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../contexts/WebSocketContext';

const RoomsImInSidebar = () => {
  const navigate = useNavigate();
  const { addEventListener } = useWebSocket();
  const [activeRooms, setActiveRooms] = useState([]);

  // Load active rooms from localStorage
  useEffect(() => {
    const storedRooms = localStorage.getItem('active_rooms');
    if (storedRooms) {
      try {
        setActiveRooms(JSON.parse(storedRooms));
      } catch (err) {
        console.error('Failed to parse active rooms:', err);
      }
    }
  }, []);

  // Listen for room events to update active rooms
  useEffect(() => {
    const unsubscribeEntered = addEventListener('ROOM_VISITOR_ENTERED', (data) => {
      // Add room to active list
      const roomId = data.room_owner_id;
      const newRoom = {
        owner_id: roomId,
        entered_at: new Date().toISOString()
      };
      
      setActiveRooms(prev => {
        const updated = [...prev.filter(r => r.owner_id !== roomId), newRoom];
        localStorage.setItem('active_rooms', JSON.stringify(updated));
        return updated;
      });
    });

    const unsubscribeLeft = addEventListener('ROOM_VISITOR_LEFT', (data) => {
      // Remove room from active list
      const roomId = data.room_owner_id;
      
      setActiveRooms(prev => {
        const updated = prev.filter(r => r.owner_id !== roomId);
        localStorage.setItem('active_rooms', JSON.stringify(updated));
        return updated;
      });
    });

    const unsubscribeSessionEnded = addEventListener('ROOM_SESSION_ENDED', (data) => {
      // Remove room when session ends
      const roomId = data.owner_id;
      
      setActiveRooms(prev => {
        const updated = prev.filter(r => r.owner_id !== roomId);
        localStorage.setItem('active_rooms', JSON.stringify(updated));
        return updated;
      });
    });

    return () => {
      unsubscribeEntered();
      unsubscribeLeft();
      unsubscribeSessionEnded();
    };
  }, [addEventListener]);

  if (activeRooms.length === 0) {
    return null; // Don't show sidebar if no active rooms
  }

  return (
    <div className="fixed right-4 top-20 w-64 bg-white rounded-lg shadow-lg border p-4 z-40">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        Rooms I'm In ({activeRooms.length})
      </h3>
      
      <div className="space-y-2">
        {activeRooms.map((room) => (
          <div
            key={room.owner_id}
            onClick={() => navigate(`/room/${room.owner_id}`)}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 truncate">
                  Room {room.owner_id.slice(0, 8)}...
                </p>
                <p className="text-xs text-gray-500">
                  Since {new Date(room.entered_at).toLocaleTimeString()}
                </p>
              </div>
              <span className="text-xl">🚪</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsImInSidebar;
