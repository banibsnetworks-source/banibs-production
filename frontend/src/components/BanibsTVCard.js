import React from 'react';
import { Play } from 'lucide-react';

/**
 * BANIBS TV Featured Card
 * Glassmorphism-styled video card for right rail
 * 16:9 thumbnail with play button overlay
 */
const BanibsTVCard = ({ media }) => {
  if (!media) {
    return (
      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
            BANIBS TV
          </span>
        </div>
        <p className="text-gray-400 text-sm">Content coming soon...</p>
      </div>
    );
  }

  const handleClick = () => {
    if (media.videoUrl) {
      window.open(media.videoUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-md rounded-xl overflow-hidden border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer group">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
            BANIBS TV
          </span>
          <span className="text-xs text-gray-400">Featured</span>
        </div>
      </div>

      {/* Thumbnail with Play Button */}
      <div
        onClick={handleClick}
        className="relative aspect-video bg-gray-900 overflow-hidden cursor-pointer"
      >
        <img
          src={media.thumbnailUrl}
          alt={media.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80';
          }}
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
            <Play className="text-gray-900 ml-1" size={28} fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge (if available) */}
        {media.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
            {media.duration}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors">
          {media.title}
        </h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-3">
          {media.description}
        </p>
        
        {/* Watch Now Link */}
        <button
          onClick={handleClick}
          className="inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition-colors"
        >
          <Play size={16} />
          <span>Watch now →</span>
        </button>
      </div>
    </div>
  );
};

export default BanibsTVCard;
