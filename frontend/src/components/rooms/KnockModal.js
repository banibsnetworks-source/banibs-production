/**
 * Knock Modal Component
 * Polished modal for visitors to knock on doors
 * Phase 5: Visitor-Side UI
 */

import React, { useState } from 'react';
import { knockOnRoom } from '../../services/roomsApi';

const KnockModal = ({ isOpen, onClose, ownerId, ownerName, onKnockSent }) => {
  const [message, setMessage] = useState('');
  const [isKnocking, setIsKnocking] = useState(false);
  const [error, setError] = useState(null);

  const handleKnock = async () => {
    try {
      setIsKnocking(true);
      setError(null);
      
      await knockOnRoom(ownerId, message || null);
      
      // Success
      if (onKnockSent) {
        onKnockSent();
      }
      
      setMessage('');
      onClose();
    } catch (err) {
      console.error('Failed to knock:', err);
      setError(err.message || 'Failed to knock. Please try again.');
    } finally {
      setIsKnocking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              👊 Knock on {ownerName}'s Door
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Send a knock request to {ownerName}. They'll be notified and can approve or deny your request.
          </p>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optional Message (max 500 characters)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              placeholder="Hey! Mind if I come in?"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {message.length}/500
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800">
              💡 <strong>Tip:</strong> Your knock will expire after 30 minutes. You can knock up to 3 times per hour.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isKnocking}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleKnock}
              disabled={isKnocking}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isKnocking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Knocking...
                </span>
              ) : (
                '👊 Send Knock'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnockModal;
