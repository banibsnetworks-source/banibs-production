/**
 * Room Settings Component
 * Configure room visibility, door state, and tier rules
 */

import React, { useState } from 'react';
import { updateRoomSettings, lockRoomDoors, unlockRoomDoors } from '../../services/roomsApi';

const RoomSettings = ({ room, onUpdate }) => {
  const [saving, setSaving] = useState(false);
  const [doorAction, setDoorAction] = useState(null);

  const handleLockToggle = async () => {
    const isLocked = room?.door_state === 'LOCKED';
    const action = isLocked ? 'unlock' : 'lock';

    if (!isLocked && !window.confirm('Lock your room? New knocks and entries will be blocked.')) {
      return;
    }

    try {
      setDoorAction(action);
      if (isLocked) {
        await unlockRoomDoors();
      } else {
        await lockRoomDoors();
      }
      await onUpdate();
    } catch (err) {
      console.error(`Failed to ${action} room:`, err);
      alert(`Failed to ${action} room. Please try again.`);
    } finally {
      setDoorAction(null);
    }
  };

  const handlePresenceModeChange = async (mode) => {
    try {
      setSaving(true);
      await updateRoomSettings({ presence_mode: mode });
      await onUpdate();
    } catch (err) {
      console.error('Failed to update presence mode:', err);
      alert('Failed to update setting. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const doorState = room?.door_state || 'OPEN';
  const isLocked = doorState === 'LOCKED';
  const presenceMode = room?.presence_mode || 'PUBLIC_ROOM_PRESENCE';

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Room Settings</h3>
        <p className="text-sm text-gray-600">
          Configure how your room behaves and who can see it.
        </p>
      </div>

      <div className="space-y-6">
        {/* Door State Control */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium">Door Lock</h4>
              <p className="text-sm text-gray-600">
                {isLocked 
                  ? '🔒 Room is locked - no new knocks or entries allowed'
                  : '🚪 Room is open - visitors can knock and enter based on permissions'
                }
              </p>
            </div>
            <button
              onClick={handleLockToggle}
              disabled={doorAction !== null}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLocked
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {doorAction 
                ? `${doorAction === 'lock' ? 'Locking' : 'Unlocking'}...`
                : isLocked 
                  ? '🔓 Unlock Doors' 
                  : '🔒 Lock Doors'
              }
            </button>
          </div>
        </div>

        {/* Presence Mode */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-3">Presence Mode</h4>
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="presence_mode"
                value="PUBLIC_ROOM_PRESENCE"
                checked={presenceMode === 'PUBLIC_ROOM_PRESENCE'}
                onChange={(e) => handlePresenceModeChange(e.target.value)}
                disabled={saving}
                className="mt-1"
              />
              <div>
                <p className="font-medium">👁️ Public Room Presence</p>
                <p className="text-sm text-gray-600">
                  Others can see when you're in your room (default)
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="presence_mode"
                value="GHOST_ROOM_PRESENCE"
                checked={presenceMode === 'GHOST_ROOM_PRESENCE'}
                onChange={(e) => handlePresenceModeChange(e.target.value)}
                disabled={saving}
                className="mt-1"
              />
              <div>
                <p className="font-medium">👻 Ghost Mode</p>
                <p className="text-sm text-gray-600">
                  Your room presence is hidden from others
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Visible to Tiers */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Visible to Tiers</h4>
          <p className="text-sm text-gray-600 mb-3">
            Current: {room?.room_visible_to_tiers?.join(', ') || 'None'}
          </p>
          <p className="text-xs text-gray-500">
            Advanced tier visibility controls coming in next update
          </p>
        </div>

        {/* Show Visitor List Mode */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Visitor List Visibility</h4>
          <p className="text-sm text-gray-600 mb-3">
            Current: {room?.show_visitor_list_mode || 'FULL'}
          </p>
          <p className="text-xs text-gray-500">
            Advanced visibility controls coming in next update
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">⚙️ Room Configuration</h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Locked rooms prevent all new knocks and entries</li>
            <li>• Existing visitors remain until they leave or you exit</li>
            <li>• Access List always overrides tier restrictions</li>
            <li>• Ghost Mode hides your presence from the network</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomSettings;
