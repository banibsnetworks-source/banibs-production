import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

/**
 * MoodMeter - Phase 7.6.5
 * Circular gauge widget showing global news sentiment
 * Displays in top navigation bar
 * 
 * NOTE: This is a READ-ONLY indicator showing current news sentiment.
 * It is NOT a mode selector - it reflects the actual sentiment of news content.
 */
const MoodMeter = () => {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    fetchGlobalSentiment();
    // Refresh every 5 minutes
    const interval = setInterval(fetchGlobalSentiment, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchGlobalSentiment = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/news/homepage`);
      if (response.ok) {
        const data = await response.json();
        if (data.sentiment_summary) {
          setSentiment(data.sentiment_summary);
        }
      }
    } catch (error) {
      console.error('Error fetching sentiment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !sentiment) {
    return null;
  }

  const { dominant_tone } = sentiment;

  // Determine color and icon based on dominant tone
  const getMoodConfig = () => {
    switch (dominant_tone) {
      case 'Optimistic':
        return {
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          ringColor: 'ring-green-500/50',
          icon: '🟢',
          label: 'Optimistic',
        };
      case 'Concerned':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500/20',
          ringColor: 'ring-red-500/50',
          icon: '🔴',
          label: 'Concerned',
        };
      default:
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/20',
          ringColor: 'ring-gray-500/50',
          icon: '⚪',
          label: 'Balanced',
        };
    }
  };

  const config = getMoodConfig();

  return (
    <div className="relative group">
      {/* Mood Meter Indicator (Read-Only) */}
      <div
        className={`
          flex items-center space-x-2 px-3 py-1.5 rounded-full
          ${config.bgColor} ring-1 ${config.ringColor}
          cursor-default select-none transition-opacity
        `}
        title="News Mood Indicator"
        data-testid="mood-meter"
      >
        <Activity size={14} className={config.color} />
        <span className={`text-xs font-semibold ${config.color}`}>
          {config.icon} {config.label}
        </span>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Activity size={14} className={config.color} />
            <span className="text-xs font-bold text-card-foreground">News Mood</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Current sentiment: <span className={`font-semibold ${config.color}`}>{dominant_tone}</span>
          </p>
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">🟢 Positive:</span>
              <span className="text-green-400 font-semibold">{sentiment.positive}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">⚪ Neutral:</span>
              <span className="text-muted-foreground font-semibold">{sentiment.neutral}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">🔴 Negative:</span>
              <span className="text-red-400 font-semibold">{sentiment.negative}</span>
            </div>
          </div>
          {/* Clarification that this is read-only */}
          <div className="mt-3 pt-2 border-t border-border">
            <p className="text-[9px] text-muted-foreground italic">
              This reflects the current mood of news content. Feed modes roll out in phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodMeter;
