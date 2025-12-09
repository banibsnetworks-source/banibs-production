/**
 * Rooms Discovery Page
 * Browse and discover available Peoples Rooms
 * Phase 5: Visitor-Side UI
 */

import React, { useState, useEffect } from 'react';
import FullWidthLayout from '../components/layouts/FullWidthLayout';
import RoomDiscoveryCard from '../components/rooms/RoomDiscoveryCard';
import RoomsImInSidebar from '../components/rooms/RoomsImInSidebar';

const RoomsDiscovery = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, my-tier

  // For MVP, we'll show a placeholder
  // In production, this would fetch from a backend endpoint
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      // For MVP, we can show rooms from the user's network
      // This would come from a backend API in production
      setRooms([]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <FullWidthLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Rooms</h1>
          <p className="text-gray-600">
            Explore Peoples Rooms from your network and join conversations
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Rooms
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'active'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🟢 Active Now
              </button>
              <button
                onClick={() => setFilter('my-tier')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'my-tier'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                My Circle
              </button>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <div className=\"text-center py-12\">
            <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto\"></div>
            <p className=\"mt-4 text-gray-500\">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className=\"bg-white rounded-lg border p-12 text-center\">
            <p className=\"text-gray-500 text-lg mb-4\">🏠 No rooms available yet</p>
            <p className=\"text-gray-400 text-sm mb-6\">
              Rooms will appear here when people in your network create their Peoples Rooms
            </p>
            <a
              href=\"/my-room\"
              className=\"inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors\"
            >
              Create Your Room
            </a>
          </div>
        ) : (
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6\">
            {rooms.map((room) => (
              <RoomDiscoveryCard
                key={room.owner_id}
                ownerId={room.owner_id}
                ownerInfo={room.owner}
              />
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className=\"mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6\">
          <h3 className=\"font-medium text-blue-900 mb-2\">🏠 About Peoples Rooms</h3>
          <p className=\"text-blue-800 text-sm\">
            Peoples Rooms are personal, trust-aware social spaces. Each room respects your Circle 
            Trust tier, and owners have full control over who can enter. Look for the 🟢 indicator 
            to see who's currently in their room!
          </p>
        </div>
      </div>

      {/* Rooms I'm In Sidebar */}
      <RoomsImInSidebar />
    </FullWidthLayout>
  );
};

export default RoomsDiscovery;
