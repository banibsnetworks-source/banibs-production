/**
 * Video URL Parser & Embed Utility
 * 
 * Supports:
 * - YouTube (youtube.com, youtu.be)
 * - Vimeo (vimeo.com)
 * - Rumble (rumble.com)
 * 
 * Security: Uses iframe sandbox and CSP-safe embedding
 */

// Video platform patterns
const VIDEO_PATTERNS = {
  youtube: [
    // Standard watch URLs: youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:[&?].*)?/,
    // Short URLs: youtu.be/VIDEO_ID
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?/,
    // Embed URLs: youtube.com/embed/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?.*)?/,
    // Shorts: youtube.com/shorts/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?/,
  ],
  vimeo: [
    // Standard: vimeo.com/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)(?:\?.*)?/,
    // Player: player.vimeo.com/video/VIDEO_ID
    /(?:https?:\/\/)?player\.vimeo\.com\/video\/(\d+)(?:\?.*)?/,
  ],
  rumble: [
    // Embed URL: rumble.com/embed/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?rumble\.com\/embed\/([a-zA-Z0-9]+)\/?/,
    // Standard URL: rumble.com/VIDEO_ID-title.html
    /(?:https?:\/\/)?(?:www\.)?rumble\.com\/([a-zA-Z0-9]+)-[^\/]+\.html/,
  ],
};

/**
 * Parse a URL to detect video platform and extract video ID
 * @param {string} url - The URL to parse
 * @returns {object|null} - { platform, videoId, embedUrl } or null if not a video
 */
export const parseVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const trimmedUrl = url.trim();
  
  // Check YouTube
  for (const pattern of VIDEO_PATTERNS.youtube) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return {
        platform: 'youtube',
        videoId: match[1],
        embedUrl: `https://www.youtube-nocookie.com/embed/${match[1]}?rel=0&modestbranding=1`,
        originalUrl: trimmedUrl,
      };
    }
  }
  
  // Check Vimeo
  for (const pattern of VIDEO_PATTERNS.vimeo) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return {
        platform: 'vimeo',
        videoId: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}?dnt=1`,
        originalUrl: trimmedUrl,
      };
    }
  }
  
  // Check Rumble
  for (const pattern of VIDEO_PATTERNS.rumble) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return {
        platform: 'rumble',
        videoId: match[1],
        embedUrl: `https://rumble.com/embed/${match[1]}/`,
        originalUrl: trimmedUrl,
      };
    }
  }
  
  return null;
};

/**
 * Extract all video URLs from text
 * @param {string} text - Text to search for video URLs
 * @returns {array} - Array of parsed video objects
 */
export const extractVideoUrls = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  // URL regex to find all URLs in text
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const urls = text.match(urlRegex) || [];
  
  const videos = [];
  const seenIds = new Set();
  
  for (const url of urls) {
    const parsed = parseVideoUrl(url);
    if (parsed && !seenIds.has(`${parsed.platform}-${parsed.videoId}`)) {
      seenIds.add(`${parsed.platform}-${parsed.videoId}`);
      videos.push(parsed);
    }
  }
  
  return videos;
};

/**
 * Check if a URL is a supported video URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export const isVideoUrl = (url) => {
  return parseVideoUrl(url) !== null;
};

/**
 * Get platform display name
 * @param {string} platform - Platform key
 * @returns {string}
 */
export const getPlatformName = (platform) => {
  const names = {
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    rumble: 'Rumble',
  };
  return names[platform] || platform;
};

export default {
  parseVideoUrl,
  extractVideoUrls,
  isVideoUrl,
  getPlatformName,
};
