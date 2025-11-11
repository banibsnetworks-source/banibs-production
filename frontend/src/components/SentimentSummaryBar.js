import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * SentimentSummaryBar - Phase 7.6.4
 * Displays sentiment distribution across news stories
 * Visual bar showing positive/neutral/negative ratio
 */
const SentimentSummaryBar = ({ summary, title }) => {
  if (!summary) return null;

  const total = summary.positive + summary.neutral + summary.negative;
  
  if (total === 0) return null;

  // Calculate percentages
  const percentages = {
    positive: (summary.positive / total) * 100,
    neutral: (summary.neutral / total) * 100,
    negative: (summary.negative / total) * 100,
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/60 backdrop-blur-md px-4 py-4 shadow-lg">
      {/* Header */}
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <BarChart3 className="text-blue-400" size={16} />
          <h2 className="text-xs font-bold tracking-wide text-white uppercase">
            {title || 'News Sentiment'}
          </h2>
        </div>
        <span className="text-[10px] text-gray-500">
          {total} stories
        </span>
      </header>

      {/* Bar Chart */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-900 mb-3">
        {/* Positive */}
        {percentages.positive > 0 && (
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${percentages.positive}%` }}
            title={`Positive: ${summary.positive}`}
          />
        )}
        
        {/* Neutral */}
        {percentages.neutral > 0 && (
          <div
            className="h-full bg-gray-400 transition-all duration-500"
            style={{ width: `${percentages.neutral}%` }}
            title={`Neutral: ${summary.neutral}`}
          />
        )}
        
        {/* Negative */}
        {percentages.negative > 0 && (
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${percentages.negative}%` }}
            title={`Negative: ${summary.negative}`}
          />
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        {/* Positive */}
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
          <div className="flex flex-col min-w-0">
            <span className="text-gray-400 text-[10px]">Positive</span>
            <span className="text-white font-semibold">{summary.positive}</span>
          </div>
        </div>

        {/* Neutral */}
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0"></div>
          <div className="flex flex-col min-w-0">
            <span className="text-gray-400 text-[10px]">Neutral</span>
            <span className="text-white font-semibold">{summary.neutral}</span>
          </div>
        </div>

        {/* Negative */}
        <div className="flex items-center space-x-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
          <div className="flex flex-col min-w-0">
            <span className="text-gray-400 text-[10px]">Negative</span>
            <span className="text-white font-semibold">{summary.negative}</span>
          </div>
        </div>
      </div>

      {/* Dominant Sentiment */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 uppercase">Dominant Tone:</span>
          <span className={`text-xs font-bold ${
            summary.positive > summary.neutral && summary.positive > summary.negative
              ? 'text-green-400'
              : summary.negative > summary.neutral && summary.negative > summary.positive
              ? 'text-red-400'
              : 'text-gray-400'
          }`}>
            {summary.positive > summary.neutral && summary.positive > summary.negative
              ? '🟢 Optimistic'
              : summary.negative > summary.neutral && summary.negative > summary.positive
              ? '🔴 Concerned'
              : '⚪ Balanced'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SentimentSummaryBar;
