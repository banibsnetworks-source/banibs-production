/**
 * Access List Manager Component
 * Manage per-person access permissions
 */

import React, { useState } from 'react';
import { addToAccessList, removeFromAccessList, formatAccessMode } from '../../services/roomsApi';

const AccessListManager = ({ room, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newAccessMode, setNewAccessMode] = useState('DIRECT_ENTRY');
  const [removing, setRemoving] = useState(null);

  const accessList = room?.access_list || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    
    if (!newUserId.trim()) {
      alert('Please enter a user ID');
      return;
    }

    try {
      setIsAdding(true);
      await addToAccessList(newUserId.trim(), newAccessMode);
      setNewUserId('');
      setNewAccessMode('DIRECT_ENTRY');
      await onUpdate();
    } catch (err) {
      console.error('Failed to add to access list:', err);
      alert('Failed to add user. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this user from your Access List?')) {
      return;
    }

    try {
      setRemoving(userId);
      await removeFromAccessList(userId);
      await onUpdate();
    } catch (err) {
      console.error('Failed to remove from access list:', err);
      alert('Failed to remove user. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Access List</h3>
        <p className="text-sm text-gray-600">
          Control who can access your room. Access List rules override Circle Trust tier defaults.
        </p>
      </div>

      {/* Add User Form */}
      <form onSubmit={handleAdd} className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium mb-3">Add User to Access List</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
            placeholder="User ID or email"
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            value={newAccessMode}
            onChange={(e) => setNewAccessMode(e.target.value)}
            className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="DIRECT_ENTRY">🟢 Direct Entry</option>
            <option value="MUST_KNOCK">🟡 Must Knock</option>
            <option value="NEVER_ALLOW">🔴 Never Allow</option>
          </select>
          <button
            type="submit"
            disabled={isAdding}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isAdding ? 'Adding...' : '+ Add User'}
          </button>
        </div>
      </form>

      {/* Access List Display */}
      {accessList.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">🔓 No access rules set</p>
          <p className="text-sm text-gray-400 mt-1">
            Add users above to grant or restrict access
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {accessList.map((entry) => {
            const modeInfo = formatAccessMode(entry.access_mode);
            return (
              <div
                key={entry.user_id}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {entry.user_id?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{entry.user_id}</p>
                    {entry.notes && (
                      <p className="text-sm text-gray-500">{entry.notes}</p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${modeInfo.color}-100 text-${modeInfo.color}-700`}>
                    {modeInfo.icon} {modeInfo.label}
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(entry.user_id)}
                  disabled={removing === entry.user_id}
                  className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                >
                  {removing === entry.user_id ? '...' : '✕ Remove'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">🔐 Access List Priority</h4>
        <p className="text-sm text-blue-800">
          <strong>Access List &gt; Circle Rules &gt; Tier Defaults</strong>
        </p>
        <ul className="mt-2 space-y-1 text-sm text-blue-700">
          <li>• <strong>Direct Entry</strong>: Can enter without knocking (even if BLOCKED)</li>
          <li>• <strong>Must Knock</strong>: Must knock first (overrides PEOPLES direct entry)</li>
          <li>• <strong>Never Allow</strong>: Cannot access room (blocks everyone)</li>
        </ul>
      </div>
    </div>
  );
};

export default AccessListManager;
