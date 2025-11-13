import React, { useState } from 'react';
import HighFiveAnim, { useHighFiveVariant } from './HighFiveAnim';
import './HighFiveButton.css';

/**
 * BANIBS High Five Reaction Button
 * 
 * Used in social feeds, comments, and reactions
 * Plays tier-appropriate animation on interaction
 */
const HighFiveButton = ({
  postId,
  hasHighFived = false,
  highFiveCount = 0,
  userTier = 'free',
  onHighFive = null,
  size = 32,
  showCount = true
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [localHasHighFived, setLocalHasHighFived] = useState(hasHighFived);
  const [localCount, setLocalCount] = useState(highFiveCount);
  
  const variant = useHighFiveVariant(userTier);

  const handleClick = async () => {
    if (isAnimating) return;

    // Optimistic update
    const newState = !localHasHighFived;
    setLocalHasHighFived(newState);
    setLocalCount(prev => newState ? prev + 1 : prev - 1);
    setIsAnimating(true);

    // Call parent handler
    if (onHighFive) {
      try {
        await onHighFive(postId, newState);
      } catch (error) {
        // Revert on error
        setLocalHasHighFived(!newState);
        setLocalCount(prev => newState ? prev - 1 : prev + 1);
      }
    }
  };

  const handleAnimComplete = () => {
    setIsAnimating(false);
  };

  return (
    <button
      className={`highfive-button ${localHasHighFived ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
      onClick={handleClick}
      disabled={isAnimating}
      aria-label=\"High Five\"
    >
      <div className=\"highfive-icon\">
        {isAnimating ? (
          <HighFiveAnim
            variant={variant}
            size={size}
            mode=\"once\"
            fps={12}
            onComplete={handleAnimComplete}
          />
        ) : (
          <div 
            className=\"highfive-static\"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundImage: `url(${process.env.REACT_APP_BACKEND_URL}/api/static/emojis/highfive/${variant}/banibs_highfive_${variant}_strip_${size > 64 ? 128 : 128}.png)`,
              backgroundPosition: '0 0',
              backgroundSize: 'auto 100%',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
      </div>
      {showCount && localCount > 0 && (
        <span className=\"highfive-count\">{localCount}</span>
      )}
    </button>
  );
};

/**
 * High Five Upsell Modal (for free users trying premium variants)
 */
export const HighFiveUpsellModal = ({ isOpen, onClose, targetTier = 'banibs_plus' }) => {
  if (!isOpen) return null;

  const tierInfo = {
    'banibs_plus': {
      name: 'BANIBS+',
      feature: 'Spark High Five',
      price: '$4.99/mo'
    },
    'elite': {
      name: 'BANIBS Elite',
      feature: 'Big Gold Spark High Five',
      price: '$9.99/mo'
    }
  };

  const info = tierInfo[targetTier] || tierInfo['banibs_plus'];

  return (
    <div className=\"highfive-upsell-overlay\" onClick={onClose}>
      <div className=\"highfive-upsell-modal\" onClick={(e) => e.stopPropagation()}>
        <div className=\"upsell-header\">
          <HighFiveAnim variant=\"spark_big\" size={128} mode=\"loop\" fps={10} />
        </div>
        <h2>Unlock {info.feature}</h2>
        <p>Upgrade to {info.name} to use premium High Five animations</p>
        <div className=\"upsell-actions\">
          <button className=\"upgrade-btn\">
            Upgrade to {info.name} - {info.price}
          </button>
          <button className=\"cancel-btn\" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default HighFiveButton;
