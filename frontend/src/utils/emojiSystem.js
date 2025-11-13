/**
 * BANIBS Emoji System - Phase 1 (Unicode)
 * Central utility for emoji pack management and rendering
 * Architecture designed to support future image-based packs
 */

/**
 * Data Models (TypeScript-style definitions for documentation)
 * 
 * @typedef {'unicode' | 'image'} EmojiPackType
 * 
 * @typedef {Object} EmojiDefinition
 * @property {string} id - Unique identifier
 * @property {EmojiPackType} type - 'unicode' or 'image'
 * @property {string} [char] - Unicode character (for type='unicode')
 * @property {string} [url] - Image URL (for type='image')
 * @property {string[]} shortcodes - Shortcode aliases like ':smile:'
 * @property {string} category - Category slug (faces, hands, hearts, etc.)
 * @property {string[]} keywords - Search keywords
 * 
 * @typedef {Object} EmojiPack
 * @property {string} id - Unique pack identifier
 * @property {string} label - Display name
 * @property {string} description - Pack description
 * @property {EmojiPackType} type - Pack type
 * @property {number} version - Pack version
 * @property {boolean} featured - Is this pack featured?
 * @property {string} tier - Required tier (free, plus, elite)
 * @property {string[]} categories - List of category slugs
 * @property {EmojiDefinition[]} emojis - Array of emoji definitions
 */

// Constants
export const DEFAULT_EMOJI_PACK_ID = 'banibs_standard';
export const EMOJI_SIZE_DEFAULT = '32px'; // Large enough to see expressions clearly

// Central Emoji Pack Registry
let emojiPackRegistry = [];

/**
 * Load all available emoji packs from manifest files
 */
export const loadEmojiPacks = async () => {
  const packIds = [
    'banibs_standard',  // BANIBS first - our brand identity
    'base_yellow'       // Classic yellow emojis second
  ];

  const loadedPacks = [];

  for (const packId of packIds) {
    try {
      const response = await fetch(`/static/emojis/packs/${packId}/manifest.json`);
      if (response.ok) {
        const manifest = await response.json();
        loadedPacks.push(manifest);
      }
    } catch (error) {
      console.warn(`Failed to load emoji pack: ${packId}`, error);
    }
  }

  emojiPackRegistry = loadedPacks;
  return loadedPacks;
};

/**
 * Get the emoji pack registry
 */
export const getEmojiPackRegistry = () => {
  return emojiPackRegistry;
};

/**
 * Get a specific emoji pack by ID
 */
export const getEmojiPack = (packId) => {
  return emojiPackRegistry.find(pack => pack.id === packId);
};

/**
 * Get user's available emoji packs based on subscription tier
 * BANIBS packs are ALWAYS listed first - they're our primary brand identity
 */
export const getUserEmojiPacks = (userTier = 'free') => {
  const tierMap = {
    'free': ['banibs_standard', 'base_yellow'],
    'basic': ['banibs_standard', 'base_yellow'],
    'banibs_plus': ['banibs_standard', 'banibs_gold_spark', 'base_yellow'],
    'elite': ['banibs_standard', 'banibs_gold_spark', 'base_yellow'],
    'business_pro': ['banibs_standard', 'banibs_gold_spark', 'base_yellow']
  };

  return tierMap[userTier] || tierMap['free'];
};

/**
 * Check if user can access a specific emoji pack
 */
export const canAccessPack = (packId, userTier = 'free') => {
  const userPacks = getUserEmojiPacks(userTier);
  return userPacks.includes(packId);
};

/**
 * Group emojis by category
 * Handles both flat emoji arrays (new format) and nested categories (old format)
 */
export const groupEmojisByCategory = (pack) => {
  if (!pack) return {};

  // Handle old format with nested categories
  if (pack.categories && Array.isArray(pack.categories) && pack.categories[0]?.emojis) {
    const grouped = {};
    pack.categories.forEach(cat => {
      grouped[cat.id] = {
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        emojis: cat.emojis || []
      };
    });
    return grouped;
  }

  // Handle new format with flat emoji array
  if (pack.emojis && Array.isArray(pack.emojis)) {
    const grouped = {};
    
    pack.emojis.forEach(emoji => {
      const category = emoji.category || 'other';
      
      if (!grouped[category]) {
        grouped[category] = {
          id: category,
          name: getCategoryDisplayName(category),
          icon: getCategoryIcon(category),
          emojis: []
        };
      }
      
      // For unicode emojis, store the character
      // For image emojis (future), store the definition
      grouped[category].emojis.push(emoji.type === 'unicode' ? emoji.char : emoji);
    });
    
    return grouped;
  }

  return {};
};

/**
 * Get display name for category slug
 */
const getCategoryDisplayName = (categorySlug) => {
  const names = {
    'faces': 'Smileys & Faces',
    'hands': 'Hand Gestures',
    'reactions': 'Reactions',
    'hearts': 'Hearts & Love',
    'symbols': 'Symbols',
    'celebration': 'Celebration',
    'objects': 'Objects',
    'other': 'Other'
  };
  return names[categorySlug] || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
};

/**
 * Get icon for category slug
 */
const getCategoryIcon = (categorySlug) => {
  const icons = {
    'faces': '😊',
    'hands': '👍🏿',
    'reactions': '🔥',
    'hearts': '❤️',
    'symbols': '✨',
    'celebration': '🎉',
    'objects': '💼',
    'other': '📦'
  };
  return icons[categorySlug] || '📦';
};

/**
 * Render emoji based on type
 */
export const renderEmoji = (emoji) => {
  if (typeof emoji === 'string') {
    // Simple unicode emoji character
    return emoji;
  }
  
  if (emoji.type === 'unicode') {
    return emoji.char;
  }
  
  if (emoji.type === 'image') {
    // Future: return <img> element or URL for image-based emojis
    return emoji.url;
  }
  
  return emoji;
};

/**
 * Get high-five animation variant based on user tier
 */
export const getHighFiveVariant = (userTier = 'free') => {
  const tierMap = {
    'free': 'clean',
    'basic': 'clean',
    'banibs_plus': 'spark_small',
    'gold': 'spark_small',
    'elite': 'spark_big',
    'business_pro': 'spark_big'
  };

  return tierMap[userTier] || 'clean';
};

export default {
  DEFAULT_EMOJI_PACK_ID,
  EMOJI_SIZE_DEFAULT,
  loadEmojiPacks,
  getEmojiPackRegistry,
  getEmojiPack,
  getUserEmojiPacks,
  canAccessPack,
  groupEmojisByCategory,
  renderEmoji,
  getHighFiveVariant
};
