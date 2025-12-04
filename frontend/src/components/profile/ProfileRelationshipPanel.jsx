import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Shield, ShieldOff } from 'lucide-react';
import RelationshipTierBadge from '../connections/RelationshipTierBadge';

/**
 * ProfileRelationshipPanel - Phase 8.3
 * Displays and manages relationship with another user
 * Uses BANIBS UI v2.0 design system
 */
const ProfileRelationshipPanel = ({ profileUserId, currentUserId }) => {
  const navigate = useNavigate();
  
  const [tier, setTier] = useState('OTHERS');
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('access_token');

  const isBlocked = status === 'BLOCKED';

  // Fetch current relationship
  useEffect(() => {
    const fetchRelationship = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_URL}/api/relationships/${profileUserId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.status === 404) {
          // No relationship exists - default to OTHERS
          setTier('OTHERS');
          setStatus('ACTIVE');
        } else if (response.ok) {
          const data = await response.json();
          setTier(data.tier);
          setStatus(data.status);
        } else {
          throw new Error('Failed to load relationship');
        }
      } catch (err) {
        console.error('Error fetching relationship:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profileUserId && currentUserId && profileUserId !== currentUserId) {
      fetchRelationship();
    }
  }, [profileUserId, currentUserId, API_URL, token]);

  // Change tier
  const handleChangeTier = async (newTier) => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/relationships`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: profileUserId,
          tier: newTier
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update relationship');
      }

      const data = await response.json();
      setTier(data.tier);
      setStatus(data.status);
    } catch (err) {
      console.error('Error changing tier:', err);
      alert('Failed to update relationship tier');
    } finally {
      setIsProcessing(false);
    }
  };

  // Block user
  const handleBlock = async () => {
    if (!window.confirm('Block this user? They will no longer be able to interact with you.')) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/relationships/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: profileUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to block user');
      }

      const data = await response.json();
      setStatus(data.status);
      setTier(data.tier);
    } catch (err) {
      console.error('Error blocking user:', err);
      alert('Failed to block user');
    } finally {
      setIsProcessing(false);
    }
  };

  // Unblock user
  const handleUnblock = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`${API_URL}/api/relationships/unblock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_user_id: profileUserId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to unblock user');
      }

      const data = await response.json();
      setStatus(data.status);
    } catch (err) {
      console.error('Error unblocking user:', err);
      alert('Failed to unblock user');
    } finally {
      setIsProcessing(false);
    }
  };

  // Navigate to messages
  const handleMessage = () => {
    navigate(`/messages/${profileUserId}`);
  };

  // Don't show panel if viewing own profile
  if (!profileUserId || profileUserId === currentUserId) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="card-v2 clean-spacing-md">
        <p className="text-secondary-v2 text-sm">Loading relationship...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="card-v2 clean-spacing-md">
        <p className="text-red-400 text-sm">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="card-v2 clean-spacing-md">
      {/* Header */}
      <div className="breathing-room-sm">
        <h3 className="text-foreground-v2 font-semibold text-sm">Relationship</h3>
      </div>

      {/* Current Tier Badge */}
      <div className="breathing-room-md">
        <RelationshipTierBadge tier={tier} />
        {isBlocked && (
          <div className="text-xs text-red-400 breathing-room-xs">
            This user is blocked
          </div>
        )}
      </div>

      {/* Tier Buttons */}
      {!isBlocked && (
        <div className="breathing-room-md">
          <p className="text-secondary-v2 text-xs breathing-room-xs">Change tier:</p>
          <div className="grid grid-cols-2 gap-2">
            {['PEOPLES', 'COOL', 'ALRIGHT', 'OTHERS'].map((t) => (
              <button
                key={t}
                onClick={() => handleChangeTier(t)}
                disabled={isProcessing || tier === t}
                className={`btn-v2 ${
                  tier === t ? 'btn-v2-primary' : 'btn-v2-secondary'
                } btn-v2-sm`}
                title={t === 'OTHERS' ? 'Others: People you just met, coworkers, or acquaintances. Lowest access. Protects your inner circle.' : ''}
              >
                {t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 breathing-room-xs mt-2 italic">
            💡 Higher tiers = more access. Lower tiers = less access. Always protect your inner circle.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="breathing-room-md space-y-2">
        {/* Message Button */}
        <button
          onClick={handleMessage}
          disabled={isBlocked}
          className="btn-v2 btn-v2-ghost btn-v2-sm w-full flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>

        {/* Block/Unblock Button */}
        {isBlocked ? (
          <button
            onClick={handleUnblock}
            disabled={isProcessing}
            className="btn-v2 btn-v2-secondary btn-v2-sm w-full flex items-center justify-center gap-2"
            style={{ borderColor: '#10b981', color: '#10b981' }}
          >
            <ShieldOff className="w-4 h-4" />
            Unblock User
          </button>
        ) : (
          <button
            onClick={handleBlock}
            disabled={isProcessing}
            className="btn-v2 btn-v2-ghost btn-v2-sm w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300"
          >
            <Shield className="w-4 h-4" />
            Block User
          </button>
        )}
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-xs text-secondary-v2 text-center breathing-room-xs">
          Processing...
        </div>
      )}
    </div>
  );
};

export default ProfileRelationshipPanel;
