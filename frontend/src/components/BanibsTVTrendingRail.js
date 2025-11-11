import React from 'react';
import { Play } from 'lucide-react';

/**
 * BanibsTVTrendingRail - Phase 7.6.4 (Stub)
 * Horizontal scroll of trending video clips
 * To be enhanced when BANIBS TV has actual video content
 */
const BanibsTVTrendingRail = ({ items }) => {
  // For now, return null until we have real TV content
  // This is a placeholder for future implementation
  if (!items || items.length === 0) {
    return null;
  }

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-4">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold tracking-wide text-white uppercase flex items-center space-x-2">
          <Play size={14} className="text-red-500" />
          <span>BANIBS TV • Trending Clips</span>
        </h2>
        <a
          href="/tv"
          className="text-[11px] font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          View all
        </a>
      </header>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {items.map((clip) => (
          <a
            key={clip.id}
            href={clip.url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-[160px] max-w-[180px] flex-shrink-0 group"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-900">
              <img
                src={clip.thumbnail_url}
                alt={clip.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80';
                }}
              />
              
              {/* Duration Badge */}
              {clip.duration_seconds && (
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {formatDuration(clip.duration_seconds)}
                </span>
              )}
              
              {/* Play Indicator */}
              <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center space-x-1">
                <Play size={8} fill="white" />
                <span>Watch</span>
              </span>
            </div>
            
            {/* Title */}
            <p className="mt-1.5 text-[12px] font-semibold leading-snug text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
              {clip.title}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default BanibsTVTrendingRail;
