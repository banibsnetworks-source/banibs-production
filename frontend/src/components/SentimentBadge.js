import React from 'react';

/**
 * SentimentBadge Component
 * Displays sentiment analysis result as a colored badge
 * 
 * Props:
 * - score: float (-1.0 to 1.0)
 * - label: string ("positive" | "neutral" | "negative")
 * - size: "sm" | "md" | "lg" (default: "sm")
 * - showLabel: boolean (default: false) - show text label
 */

function SentimentBadge({ score, label, size = 'sm', showLabel = false }) {
  // Return null if no sentiment data
  if (score === null || score === undefined || !label) {
    return null;
  }

  // Determine color based on label
  const getColors = () => {
    switch (label) {
      case 'positive':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/40',
          text: 'text-green-600',
          dot: 'bg-green-500',
          emoji: '🟢',
          displayLabel: 'Positive'
        };
      case 'negative':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/40',
          text: 'text-red-600',
          dot: 'bg-red-500',
          emoji: '🔴',
          displayLabel: 'Critical'
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-gray-500/20',
          border: 'border-gray-500/40',
          text: 'text-gray-600',
          dot: 'bg-gray-500',
          emoji: '⚪',
          displayLabel: 'Neutral'
        };
    }
  };

  const colors = getColors();

  // Size variants
  const sizeClasses = {
    sm: {
      badge: 'px-2 py-0.5 text-xs',
      dot: 'w-1.5 h-1.5',
      emoji: 'text-xs'
    },
    md: {
      badge: 'px-3 py-1 text-sm',
      dot: 'w-2 h-2',
      emoji: 'text-sm'
    },
    lg: {
      badge: 'px-4 py-1.5 text-base',
      dot: 'w-2.5 h-2.5',
      emoji: 'text-base'
    }
  };

  const sizes = sizeClasses[size] || sizeClasses.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${colors.bg} ${colors.border} ${colors.text} border rounded-full ${sizes.badge} font-medium`}
      title={`Sentiment: ${colors.displayLabel} (${score.toFixed(2)})`}
    >
      {/* Emoji indicator */}
      <span className={sizes.emoji}>{colors.emoji}</span>
      
      {/* Text label (optional) */}
      {showLabel && <span>{colors.displayLabel}</span>}
    </span>
  );
}

export default SentimentBadge;
