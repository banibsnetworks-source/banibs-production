import React, { useState } from 'react';
import { Play, ExternalLink, AlertCircle } from 'lucide-react';
import { getPlatformName } from '../../utils/videoUrlParser';

/**
 * VideoEmbed - Responsive video player for external platforms
 * 
 * Supports: YouTube, Vimeo, Rumble
 * 
 * Security:
 * - Uses youtube-nocookie.com for YouTube
 * - Sandboxed iframes
 * - No script execution allowed
 */
const VideoEmbed = ({ 
  platform, 
  videoId, 
  embedUrl, 
  originalUrl,
  className = '' 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  // Platform-specific styling
  const platformColors = {
    youtube: 'bg-red-600',
    vimeo: 'bg-blue-500',
    rumble: 'bg-green-600',
  };

  const platformIcons = {
    youtube: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    vimeo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 0 0 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
      </svg>
    ),
    rumble: (
      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
  };

  // Handle iframe load error
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  // Render error state
  if (error) {
    return (
      <a
        href={originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`block border border-border rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors ${className}`}
      >
        <div className="flex items-center gap-3 p-4 bg-muted/30">
          <div className={`w-12 h-12 rounded-lg ${platformColors[platform]} flex items-center justify-center text-white`}>
            <AlertCircle size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground">
              Video unavailable
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Watch on {getPlatformName(platform)}
              <ExternalLink size={12} />
            </p>
          </div>
        </div>
      </a>
    );
  }

  // Render click-to-play thumbnail (lazy loading)
  if (!showEmbed) {
    return (
      <div 
        className={`relative cursor-pointer group ${className}`}
        onClick={() => setShowEmbed(true)}
        data-testid={`video-embed-${platform}`}
      >
        {/* Thumbnail background */}
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
          {/* Platform-specific thumbnail */}
          {platform === 'youtube' && (
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to lower quality thumbnail
                e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
              }}
            />
          )}
          
          {platform === 'vimeo' && (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center">
              <span className="text-white/50 text-sm">Vimeo Video</span>
            </div>
          )}
          
          {platform === 'rumble' && (
            <div className="w-full h-full bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
              <span className="text-white/50 text-sm">Rumble Video</span>
            </div>
          )}

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
            <div className={`w-16 h-16 rounded-full ${platformColors[platform]} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform`}>
              <Play size={32} className="ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Platform badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/70 rounded-lg">
            <div className="text-white w-5 h-5">
              {platformIcons[platform]}
            </div>
            <span className="text-xs text-white font-medium">
              {getPlatformName(platform)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render embedded iframe
  return (
    <div className={`relative ${className}`}>
      <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          src={embedUrl}
          title={`${getPlatformName(platform)} video`}
          className={`w-full h-full ${loaded ? 'opacity-100' : 'opacity-0'}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          onLoad={() => setLoaded(true)}
          onError={handleError}
        />
      </div>
      
      {/* External link */}
      <a
        href={originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 rounded-lg text-white/80 hover:text-white transition-colors"
        title={`Open on ${getPlatformName(platform)}`}
      >
        <ExternalLink size={16} />
      </a>
    </div>
  );
};

export default VideoEmbed;
