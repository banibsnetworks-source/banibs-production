/**
 * Visitor List Component
 * Shows current visitors in the room
 */

import React from 'react';

const VisitorList = ({ session, inSession, onRefresh }) => {
  if (!inSession) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">🚪 You're not in your room</p>
        <p className="text-sm text-gray-400">Enter your room to see visitors</p>
      </div>
    );
  }

  const visitors = session?.current_visitors || [];

  if (visitors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">🤷 No visitors yet</p>
        <p className="text-sm text-gray-400">Visitors will appear here when they enter your room</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Current Visitors ({visitors.length})</h3>
        <button
          onClick={onRefresh}
          className="text-sm text-primary hover:underline"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-3">
        {visitors.map((visitor) => (
          <div
            key={visitor.user_id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-medium">
                  {visitor.user_id?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
              
              {/* Visitor Info */}
              <div>
                <p className="font-medium text-gray-900">
                  {visitor.user_id || 'Unknown Visitor'}
                </p>
                <p className="text-sm text-gray-500">
                  Entered {new Date(visitor.joined_at).toLocaleTimeString()}
                  {visitor.tier && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                      {visitor.tier}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Presence Indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitorList;
