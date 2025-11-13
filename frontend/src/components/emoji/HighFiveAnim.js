import React, { useEffect, useRef, useState } from 'react';
import './HighFiveAnim.css';

/**
 * BANIBS High Five Sprite Animation Component
 * 
 * Plays sprite-strip based high five animation with tier-based variants
 * 
 * @param {string} variant - 'clean', 'spark_small', or 'spark_big'
 * @param {number} size - Frame size (128, 256, or 512)
 * @param {string} mode - 'once' or 'loop'
 * @param {number} fps - Frames per second (default: 10)
 * @param {function} onComplete - Callback when animation completes (for 'once' mode)
 */
const HighFiveAnim = ({ 
  variant = 'clean',
  size = 128,
  mode = 'once',
  fps = 10,
  onComplete = null,
  className = ''
}) => {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  // Construct sprite path
  const spritePath = `/api/static/emojis/highfive/${variant}/banibs_highfive_${variant}_strip_${size}.png`;

  useEffect(() => {
    if (!containerRef.current || isPlaying) return;

    const el = containerRef.current;
    const frames = 8;
    const frameWidth = size;
    let frame = 0;
    const interval = 1000 / fps;

    setIsPlaying(true);

    timerRef.current = setInterval(() => {
      el.style.backgroundPosition = `-${frame * frameWidth}px 0px`;
      frame++;

      if (frame >= frames) {
        if (mode === 'once') {
          clearInterval(timerRef.current);
          setIsPlaying(false);
          // Hold on last frame
          el.style.backgroundPosition = `-${(frames - 1) * frameWidth}px 0px`;
          if (onComplete) onComplete();
        } else {
          frame = 0; // Loop
        }
      }
    }, interval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [variant, size, mode, fps, isPlaying, onComplete]);

  // Allow replaying by resetting state
  const replay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsPlaying(false);
    if (containerRef.current) {
      containerRef.current.style.backgroundPosition = '0 0';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`highfive-anim highfive-variant-${variant} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundImage: `url(${process.env.REACT_APP_BACKEND_URL}${spritePath})`,
        backgroundPosition: '0 0'
      }}
      onClick={mode === 'once' ? replay : undefined}
      title="BANIBS High Five"
    />
  );
};

/**
 * Hook to get user's high five variant based on tier
 */
export const useHighFiveVariant = (userTier = 'free') => {
  // Tier mapping
  const tierMap = {
    'free': 'clean',
    'basic': 'clean',
    'banibs_plus': 'spark_small',
    'gold': 'spark_small',
    'elite': 'spark_big',
    'business_pro': 'spark_big',
    'premium': 'spark_big'
  };

  return tierMap[userTier] || 'clean';
};

export default HighFiveAnim;
