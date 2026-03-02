import React, { useState, useEffect, useRef } from 'react';
import { Globe, Users, ChevronDown, Lock, Check, Clock } from 'lucide-react';
import { getMyCircles } from '../../api/circleApi';

/**
 * CircleTargetSelector - Circle visibility selector for post composer
 * 
 * Features:
 * - Global (default) - visible to everyone
 * - Circle-targeted - visible only to circle members with required tier
 * - Min tier selector when circle is selected
 */

const TIERS = [
  { value: 'OTHERS', label: 'All Members', description: 'Anyone in the circle' },
  { value: 'ALRIGHT', label: 'Alright+', description: 'Alright tier and above' },
  { value: 'COOL', label: 'Cool+', description: 'Cool tier and above' },
  { value: 'PEOPLES', label: 'Peoples Only', description: 'Your closest connections' }
];

const CircleTargetSelector = ({ 
  targetType, 
  targetCircleId, 
  minTierToView,
  expiresAt,
  onTargetChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTierDropdown, setShowTierDropdown] = useState(false);
  const [myCircles, setMyCircles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const tierDropdownRef = useRef(null);

  // Fetch user's circles on mount
  useEffect(() => {
    const fetchCircles = async () => {
      setLoading(true);
      try {
        const data = await getMyCircles();
        setMyCircles(data.circles || []);
      } catch (err) {
        console.error('Failed to load circles:', err);
        setError('Could not load your circles');
      } finally {
        setLoading(false);
      }
    };
    fetchCircles();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (tierDropdownRef.current && !tierDropdownRef.current.contains(event.target)) {
        setShowTierDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCircle = myCircles.find(c => c.id === targetCircleId);
  const selectedTier = TIERS.find(t => t.value === minTierToView) || TIERS[0];

  const handleSelectGlobal = () => {
    onTargetChange({
      target_type: 'GLOBAL',
      target_circle_id: null,
      min_tier_to_view: 'OTHERS'
    });
    setIsOpen(false);
  };

  const handleSelectCircle = (circle) => {
    onTargetChange({
      target_type: 'CIRCLE',
      target_circle_id: circle.id,
      min_tier_to_view: minTierToView || 'OTHERS'
    });
    setIsOpen(false);
  };

  const handleSelectTier = (tier) => {
    onTargetChange({
      target_type: targetType,
      target_circle_id: targetCircleId,
      min_tier_to_view: tier.value
    });
    setShowTierDropdown(false);
  };

  // Format expiry time
  const formatExpiry = (date) => {
    if (!date) return null;
    const expires = new Date(date);
    const now = new Date();
    const diff = expires - now;
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d remaining`;
    if (hours > 0) return `${hours}h remaining`;
    return 'Expiring soon';
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Target Selector */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border text-sm transition-colors"
          data-testid="circle-target-selector"
        >
          {targetType === 'GLOBAL' ? (
            <>
              <Globe size={14} className="text-blue-400" />
              <span className="text-card-foreground">Global</span>
            </>
          ) : (
            <>
              <Users size={14} className="text-amber-500" />
              <span className="text-card-foreground truncate max-w-[120px]">
                {selectedCircle?.name || 'Circle'}
              </span>
            </>
          )}
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            {/* Global Option */}
            <button
              onClick={handleSelectGlobal}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                targetType === 'GLOBAL' ? 'bg-muted/30' : ''
              }`}
            >
              <Globe size={18} className="text-blue-400 flex-shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-card-foreground">Global</p>
                <p className="text-xs text-muted-foreground">Visible to everyone</p>
              </div>
              {targetType === 'GLOBAL' && (
                <Check size={16} className="text-green-500" />
              )}
            </button>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Circles Section */}
            <div className="py-2">
              <p className="px-4 py-1 text-xs font-medium text-muted-foreground uppercase">
                Your Circles
              </p>
              
              {loading && (
                <p className="px-4 py-2 text-sm text-muted-foreground">Loading...</p>
              )}
              
              {error && (
                <p className="px-4 py-2 text-sm text-red-400">{error}</p>
              )}
              
              {!loading && !error && myCircles.length === 0 && (
                <p className="px-4 py-2 text-sm text-muted-foreground">
                  Join circles to post to them
                </p>
              )}

              <div className="max-h-48 overflow-y-auto">
                {myCircles.map((circle) => (
                  <button
                    key={circle.id}
                    onClick={() => handleSelectCircle(circle)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors ${
                      targetCircleId === circle.id ? 'bg-muted/30' : ''
                    }`}
                  >
                    <Users size={16} className="text-amber-500 flex-shrink-0" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {circle.name}
                      </p>
                      {circle.expires_at && (
                        <p className="text-xs text-amber-400 flex items-center gap-1">
                          <Clock size={10} />
                          {formatExpiry(circle.expires_at)}
                        </p>
                      )}
                    </div>
                    {targetCircleId === circle.id && (
                      <Check size={16} className="text-green-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tier Selector - Only show when circle is selected */}
      {targetType === 'CIRCLE' && (
        <div className="relative" ref={tierDropdownRef}>
          <button
            type="button"
            onClick={() => setShowTierDropdown(!showTierDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted border border-border text-sm transition-colors"
            data-testid="tier-selector"
          >
            <Lock size={14} className="text-purple-400" />
            <span className="text-card-foreground">{selectedTier.label}</span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {showTierDropdown && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase">
                Who can see this?
              </p>
              {TIERS.map((tier) => (
                <button
                  key={tier.value}
                  onClick={() => handleSelectTier(tier)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors ${
                    minTierToView === tier.value ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-card-foreground">{tier.label}</p>
                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                  </div>
                  {minTierToView === tier.value && (
                    <Check size={16} className="text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ephemeral indicator */}
      {expiresAt && (
        <span className="flex items-center gap-1 px-2 py-1 text-xs text-amber-400 bg-amber-500/10 rounded-md">
          <Clock size={12} />
          {formatExpiry(expiresAt)}
        </span>
      )}
    </div>
  );
};

export default CircleTargetSelector;
