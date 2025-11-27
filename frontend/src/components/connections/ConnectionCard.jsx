import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, MoreVertical } from 'lucide-react';
import RelationshipTierBadge from './RelationshipTierBadge';

/**
 * ConnectionCard - Phase 8.2
 * Displays a single connection with tier management actions
 * Uses BANIBS UI v2.0 design system
 */
const ConnectionCard = ({ 
  connection, 
  onChangeTier, 
  onBlock, 
  onUnblock, 
  onRemove 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { target_user_id, tier, status, user } = connection;
  const isBlocked = status === 'BLOCKED';

  const handleChangeTier = async (newTier) => {
    setIsProcessing(true);
    try {
      await onChangeTier(target_user_id, newTier);
      setShowActions(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBlock = async () => {
    setIsProcessing(true);
    try {
      await onBlock(target_user_id);
      setShowActions(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnblock = async () => {
    setIsProcessing(true);
    try {
      await onUnblock(target_user_id);
      setShowActions(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this connection? They will return to "Others" tier.')) {
      setIsProcessing(true);
      try {
        await onRemove(target_user_id);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <article className="card-v2 card-v2-interactive hover-lift clean-spacing-md">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link 
          to={`/portal/social/id/${target_user_id}`}
          className="flex-shrink-0"
        >
          {user?.avatar_url || user?.profile_photo ? (
            <img
              src={user.avatar_url || user.profile_photo}
              alt={user.display_name || 'User'}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </Link>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link 
                to={`/portal/social/id/${target_user_id}`}
                className="text-foreground-v2 font-semibold hover:text-primary-v2 transition-colors block truncate"
              >
                {user?.display_name || 'Unknown User'}
              </Link>
              {user?.handle && (
                <p className="text-secondary-v2 text-sm">@{user.handle}</p>
              )}
              {user?.location && (
                <p className="text-secondary-v2 text-xs breathing-room-xs">
                  {user.location}
                </p>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="btn-v2 btn-v2-ghost btn-v2-sm p-1"
                disabled={isProcessing}
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-8 z-10 card-v2 min-w-[160px] shadow-lg">
                  <div className="py-1">
                    {!isBlocked && (
                      <>
                        <div className="px-3 py-1 text-xs text-secondary-v2 font-semibold">
                          Change Tier
                        </div>
                        {['PEOPLES', 'COOL', 'ALRIGHT', 'OTHERS'].map((t) => (
                          <button
                            key={t}
                            onClick={() => handleChangeTier(t)}
                            disabled={isProcessing || tier === t}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800 transition-colors ${
                              tier === t ? 'text-primary-v2 font-medium' : 'text-foreground-v2'
                            }`}
                          >
                            {t.charAt(0) + t.slice(1).toLowerCase()}
                          </button>
                        ))}
                        <div className="border-t border-gray-700 my-1"></div>
                      </>
                    )}
                    
                    {isBlocked ? (
                      <button
                        onClick={handleUnblock}
                        disabled={isProcessing}
                        className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-gray-800 transition-colors"
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        onClick={handleBlock}
                        disabled={isProcessing}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                      >
                        Block
                      </button>
                    )}
                    
                    <button
                      onClick={handleRemove}
                      disabled={isProcessing}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tier Badge */}
          <div className="breathing-room-sm">
            <RelationshipTierBadge tier={tier} />
          </div>
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="text-xs text-secondary-v2 breathing-room-xs">
          Processing...
        </div>
      )}
    </article>
  );
};

export default ConnectionCard;
