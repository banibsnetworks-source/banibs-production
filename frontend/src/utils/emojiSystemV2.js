/**
 * BANIBS Emoji System V2
 * Future-proof architecture supporting both Unicode (Phase 1) and Image-based (Phase 2) emojis
 * 
 * Type Definitions (TypeScript-style for documentation):
 * 
 * type EmojiPackType = 'unicode' | 'image';
 * 
 * interface EmojiDefinitionBase {
 *   id: string;
 *   shortcodes: string[];
 *   keywords: string[];
 *   category: string;
 * }
 * 
 * interface UnicodeEmojiDefinition extends EmojiDefinitionBase {
 *   type: 'unicode';
 *   char: string;
 * }
 * 
 * interface ImageEmojiDefinition extends EmojiDefinitionBase {
 *   type: 'image';
 *   spriteSheet: string;
 *   x: number;
 *   y: number;
 *   width: number;
 *   height: number;
 * }
 * 
 * type EmojiDefinition = UnicodeEmojiDefinition | ImageEmojiDefinition;
 * 
 * interface EmojiPack {
 *   id: string;
 *   label: string;
 *   description?: string;
 *   type: EmojiPackType;
 *   version: number;
 *   featured?: boolean;
 *   tier: string;
 *   categories: string[];
 *   emojis: EmojiDefinition[];
 * }
 */

// Configuration
const DEFAULT_EMOJI_PACK_ID = 'banibs_standard';

// Available emoji pack manifests
const EMOJI_PACK_MANIFESTS = [
  '/static/emojis/packs/banibs_standard/manifest.json',
  '/static/emojis/packs/base_yellow/manifest.json',
  // Future packs can be added here:
  // '/static/emojis/packs/banibs_gold_spark/manifest.json',
  // '/static/emojis/packs/banibs_culture/manifest.json',
];

/**
 * Load all available emoji packs from their manifests
 * @returns {Promise<Array<EmojiPack>>}
 */
export const loadEmojiPacks = async () => {
  const packs = [];
  
  for (const manifestPath of EMOJI_PACK_MANIFESTS) {
    try {
      const response = await fetch(manifestPath);
      if (response.ok) {
        const manifest = await response.json();
        packs.push(manifest);
      }
    } catch (error) {
      console.warn(`Failed to load emoji pack from ${manifestPath}:`, error);
    }
  }
  
  // Sort packs: featured first, then by ID
  packs.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    if (a.id === DEFAULT_EMOJI_PACK_ID) return -1;
    if (b.id === DEFAULT_EMOJI_PACK_ID) return 1;
    return a.label.localeCompare(b.label);
  });
  
  return packs;
};

/**
 * Get user's available emoji packs based on subscription tier
 * @param {string} userTier - User's subscription tier
 * @returns {string[]} Array of pack IDs the user can access
 */
export const getUserEmojiPacks = (userTier = 'free') => {
  const tierMap = {
    'free': ['banibs_standard', 'base_yellow'],
    'basic': ['banibs_standard', 'base_yellow'],
    'banibs_plus': ['banibs_standard', 'banibs_gold_spark', 'base_yellow'],
    'elite': ['banibs_standard', 'banibs_gold_spark', 'banibs_culture', 'base_yellow'],
    'business_pro': ['banibs_standard', 'banibs_gold_spark', 'banibs_culture', 'base_yellow']
  };

  return tierMap[userTier] || tierMap['free'];
};

/**
 * Check if user can access a specific emoji pack
 * @param {string} packId - Pack ID to check
 * @param {string} userTier - User's subscription tier
 * @returns {boolean}
 */
export const canAccessPack = (packId, userTier = 'free') => {
  const userPacks = getUserEmojiPacks(userTier);
  return userPacks.includes(packId);
};

/**
 * Get default emoji pack ID
 * @returns {string}
 */
export const getDefaultPackId = () => {
  return DEFAULT_EMOJI_PACK_ID;
};

/**
 * Render an emoji based on its type
 * This is the key extensibility point for Phase 2
 * 
 * @param {EmojiDefinition} emoji - Emoji definition
 * @returns {object} Rendering instructions
 */
export const renderEmoji = (emoji) => {
  if (emoji.type === 'unicode') {
    // Phase 1: Render Unicode character
    return {
      type: 'unicode',
      content: emoji.char,
      className: 'emoji-unicode'
    };
  }
  
  if (emoji.type === 'image') {
    // Phase 2: Render from sprite sheet
    return {
      type: 'image',
      spriteSheet: emoji.spriteSheet,
      style: {
        backgroundImage: `url(${emoji.spriteSheet})`,
        backgroundPosition: `-${emoji.x}px -${emoji.y}px`,
        width: `${emoji.width}px`,
        height: `${emoji.height}px`,
        display: 'inline-block'
      },
      className: 'emoji-image',
      alt: emoji.shortcodes[0]
    };
  }
  
  // Fallback
  return {
    type: 'unicode',
    content: '❓',
    className: 'emoji-unknown'
  };
};

/**
 * Search emojis across all packs
 * @param {Array<EmojiPack>} packs - All loaded packs
 * @param {string} query - Search query
 * @returns {Array<{emoji: EmojiDefinition, packId: string}>}
 */
export const searchEmojis = (packs, query) => {
  const results = [];
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) return results;
  
  for (const pack of packs) {
    for (const emoji of pack.emojis) {
      // Search in shortcodes
      const matchesShortcode = emoji.shortcodes.some(code => 
        code.toLowerCase().includes(lowerQuery)
      );
      
      // Search in keywords
      const matchesKeyword = emoji.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );
      
      if (matchesShortcode || matchesKeyword) {
        results.push({
          emoji,
          packId: pack.id,
          packLabel: pack.label
        });
      }
    }
  }
  
  return results;
};

/**
 * Group emojis by category
 * @param {Array<EmojiDefinition>} emojis - Array of emojis
 * @returns {object} Emojis grouped by category
 */
export const groupByCategory = (emojis) => {
  return emojis.reduce((groups, emoji) => {
    const category = emoji.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(emoji);
    return groups;
  }, {});
};

/**
 * Get category display information
 * @param {string} categoryId - Category ID
 * @returns {object} Category display info
 */
export const getCategoryInfo = (categoryId) => {
  const categories = {
    'faces': { label: 'Faces & Smileys', icon: '😊' },
    'hands': { label: 'Hand Gestures', icon: '👍🏿' },
    'reactions': { label: 'Reactions', icon: '🎉' },
    'hearts': { label: 'Hearts & Love', icon: '❤️' },
    'symbols': { label: 'Symbols', icon: '⭐' },
    'other': { label: 'Other', icon: '📦' }
  };
  
  return categories[categoryId] || categories['other'];
};

/**
 * Convert emoji shortcode to emoji character (for backward compatibility)
 * @param {string} shortcode - Shortcode like :smile:
 * @param {Array<EmojiPack>} packs - Loaded packs
 * @returns {string|null} Emoji character or null
 */
export const shortcodeToEmoji = (shortcode, packs) => {
  for (const pack of packs) {
    for (const emoji of pack.emojis) {
      if (emoji.shortcodes.includes(shortcode)) {
        if (emoji.type === 'unicode') {
          return emoji.char;
        }
        // For image emojis, return the shortcode (will be rendered as image)
        return shortcode;
      }
    }
  }
  return null;
};

export default {
  loadEmojiPacks,
  getUserEmojiPacks,
  canAccessPack,
  getDefaultPackId,
  renderEmoji,
  searchEmojis,
  groupByCategory,
  getCategoryInfo,
  shortcodeToEmoji,
  DEFAULT_EMOJI_PACK_ID
};
