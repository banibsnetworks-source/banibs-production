/**
 * Knock List Component
 * Shows pending knocks and allows owner to approve/deny
 */

import React, { useState } from 'react';
import { respondToKnock } from '../../services/roomsApi';

const KnockList = ({ knocks, onRefresh }) => {
  const [responding, setResponding] = useState({});

  const handleRespond = async (visitorId, action) => {
    try {
      setResponding(prev => ({ ...prev, [visitorId]: action }));
      
      const rememberAccess = action === 'APPROVE' ? 
        window.confirm('Add this visitor to your Access List for future direct entry?') : 
        false;

      await respondToKnock(visitorId, action, rememberAccess);
      await onRefresh();
      
    } catch (err) {
      console.error('Failed to respond to knock:', err);
      alert('Failed to respond. Please try again.');
    } finally {
      setResponding(prev => ({ ...prev, [visitorId]: null }));
    }
  };

  if (knocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">🚪 No pending knocks</p>
        <p className="text-sm text-gray-400">Visitors will appear here when they knock on your door</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Pending Knocks ({knocks.length})</h3>
        <button
          onClick={onRefresh}
          className="text-sm text-primary hover:underline"
        >
          🔄 Refresh
        </button>
      </div>

      <div className="space-y-4">
        {knocks.map((knock) => (
          <div
            key={knock.visitor_id}
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Visitor Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium text-lg">
                      {knock.visitor_info?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {knock.visitor_info?.name || 'Unknown Visitor'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {knock.visitor_info?.email || knock.visitor_id}
                    </p>
                  </div>
                </div>

                {/* Knock Message */}
                {knock.knock_message && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm text-gray-700">"{knock.knock_message}"</p>
                  </div>
                )}

                {/* Knock Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>🕒 {new Date(knock.created_at).toLocaleString()}</span>
                  {knock.visitor_tier && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {knock.visitor_tier} tier
                    </span>
                  )}
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                    Expires: {new Date(knock.expires_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleRespond(knock.visitor_id, 'APPROVE')}
                  disabled={responding[knock.visitor_id]}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {responding[knock.visitor_id] === 'APPROVE' ? 'Approving...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleRespond(knock.visitor_id, 'DENY')}
                  disabled={responding[knock.visitor_id]}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {responding[knock.visitor_id] === 'DENY' ? 'Denying...' : '✗ Deny'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KnockList;
