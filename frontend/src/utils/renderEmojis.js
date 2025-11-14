/**
 * Utility to render emojis in post content
 * Replaces [emoji:ID] placeholders with actual <img> tags
 */

/**
 * Parse emoji placeholders and render them as images
 * @param {string} text - The post text with [emoji:ID] placeholders
 * @returns {Array} - Array of React elements (text and images)
 */
export function renderTextWithEmojis(text) {
  if (!text) return null;
  
  // Pattern to match [emoji:pack_id]
  const emojiPattern = /\[emoji:([^\]]+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = emojiPattern.exec(text)) !== null) {
    // Add text before emoji
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }
    
    // Add emoji
    const emojiId = match[1]; // e.g., "banibs_full_banibs_023"
    parts.push({
      type: 'emoji',
      id: emojiId,
      placeholder: match[0]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }
  
  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}

/**
 * Get image URL for an emoji ID
 * @param {string} emojiId - Full emoji ID like "banibs_full_banibs_023"
 * @returns {string} - Image URL
 */
export function getEmojiImageUrl(emojiId) {
  // Extract pack and filename from ID
  // Format: banibs_full_banibs_023
  // Extract: pack=banibs_full, filename=banibs_023.png
  
  const match = emojiId.match(/^([^_]+_[^_]+)_(.+)$/);
  if (!match) {
    console.warn('Invalid emoji ID format:', emojiId);
    return null;
  }
  
  const pack = match[1]; // e.g., "banibs_full"
  const filename = match[2]; // e.g., "banibs_023"
  
  return `/static/emojis/${pack}/${filename}.png`;
}
