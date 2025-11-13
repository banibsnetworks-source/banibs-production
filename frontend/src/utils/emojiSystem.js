/**
 * Emoji system utilities for BANIBS.
 * Phase 1: Unicode-only, but fully ready for image-based packs in Phase 2.
 */

/**
 * @typedef {'unicode' | 'image'} EmojiPackType
 */

/**
 * @typedef {'unicode' | 'image'} EmojiType
 */

/**
 * @typedef EmojiDefinitionBase
 * @property {string} id            - Unique ID (e.g. "banibs_smile_warm")
 * @property {string[]} shortcodes  - e.g. [":smile:", ":happy:"]
 * @property {string[]} keywords    - Search tags
 * @property {string} category      - e.g. "faces", "hands", "reactions"
 */

/**
 * @typedef UnicodeEmojiDefinition
 * @property {'unicode'} type
 * @property {string} char          - Actual Unicode emoji
 * @property {string} id
 * @property {string[]} shortcodes
 * @property {string[]} keywords
 * @property {string} category
 */

/**
 * @typedef ImageEmojiDefinition
 * @property {'image'} type
 * @property {string} spriteSheet   - URL to sprite sheet (Phase 2)
 * @property {number} x             - X offset in sprite
 * @property {number} y             - Y offset in sprite
 * @property {number} width
 * @property {number} height
 * @property {string} id
 * @property {string[]} shortcodes
 * @property {string[]} keywords
 * @property {string} category
 */

/**
 * @typedef {UnicodeEmojiDefinition | ImageEmojiDefinition} EmojiDefinition
 */

/**
 * @typedef EmojiPack
 * @property {string} id            - "banibs_standard", "base_yellow", etc.
 * @property {string} label         - Display label in UI
 * @property {EmojiPackType} type   - "unicode" or "image"
 * @property {EmojiDefinition[]} emojis
 */

// ---- CONSTANTS -------------------------------------------------------------

export const DEFAULT_EMOJI_PACK_ID = 'banibs_standard';

/**
 * Phase 1: Unicode-based manifests
 * Note: Using async fetch instead of direct JSON imports for flexibility
 */
let cachedPacks = null;

/**
 * Normalize a raw manifest.json into an EmojiPack.
 * This lets us change manifest structure later without breaking the rest of the app.
 *
 * @param {any} manifest
 * @returns {EmojiPack}
 */
function normalizeManifest(manifest) {
  const {
    id,
    label,
    title,
    type,
    emojis = [],
    categories = [],
  } = manifest || {};

  // Handle both formats: flat emojis array (new) and nested categories (old)
  let normalizedEmojis = [];

  if (emojis.length > 0) {
    // New format: flat emoji array with full definitions
    normalizedEmojis = emojis.map((raw) => {
      if (raw.type === 'image') {
        /** @type {ImageEmojiDefinition} */
        const imageDef = {
          type: 'image',
          id: raw.id,
          shortcodes: raw.shortcodes || [],
          keywords: raw.keywords || [],
          category: raw.category || 'misc',
          spriteSheet: raw.spriteSheet,
          x: raw.x || 0,
          y: raw.y || 0,
          width: raw.width || 40,
          height: raw.height || 40,
        };
        return imageDef;
      }

      /** @type {UnicodeEmojiDefinition} */
      const unicodeDef = {
        type: 'unicode',
        id: raw.id,
        shortcodes: raw.shortcodes || [],
        keywords: raw.keywords || [],
        category: raw.category || 'misc',
        char: raw.char,
        supportsSkinTone: raw.supportsSkinTone || false, // CRITICAL: Preserve tone support flag
      };
      return unicodeDef;
    });
  } else if (categories.length > 0) {
    // Old format: nested categories with emoji char arrays
    categories.forEach((cat) => {
      const categoryId = cat.id || 'misc';
      const categoryEmojis = cat.emojis || [];
      
      categoryEmojis.forEach((emojiChar, idx) => {
        normalizedEmojis.push({
          type: 'unicode',
          id: `${id}_${categoryId}_${idx}`,
          char: emojiChar,
          shortcodes: [`:${categoryId}_${idx}:`],
          keywords: [categoryId],
          category: categoryId,
          supportsSkinTone: false, // Old format doesn't specify, default to false
        });
      });
    });
  }

  return {
    id: id || 'unknown_pack',
    label: label || title || id || 'Unknown Pack',
    type: type === 'image' ? 'image' : 'unicode', // default to 'unicode'
    emojis: normalizedEmojis,
  };
}

/**
 * Load emoji packs from manifest files
 * Order: BANIBS Standard (default) → BANIBS Gold Spark (premium) → Base Yellow (classic)
 * @returns {Promise<EmojiPack[]>}
 */
async function loadEmojiPacksFromManifests() {
  const packIds = [
    'banibs_standard',    // BANIBS first - our brand identity
    'banibs_gold_spark',  // BANIBS premium - gold sparkle
    'base_yellow'         // Classic yellow - fallback
  ];
  const loadedPacks = [];

  for (const packId of packIds) {
    try {
      const response = await fetch(`/static/emojis/packs/${packId}/manifest.json`);
      if (response.ok) {
        const manifest = await response.json();
        loadedPacks.push(normalizeManifest(manifest));
      }
    } catch (error) {
      console.warn(`Failed to load emoji pack: ${packId}`, error);
    }
  }

  return loadedPacks;
}

/**
 * Get all emoji packs (with caching)
 * @returns {Promise<EmojiPack[]>}
 */
export async function getAllEmojiPacks() {
  if (!cachedPacks) {
    cachedPacks = await loadEmojiPacksFromManifests();
  }
  return cachedPacks;
}

/**
 * Get a pack by ID.
 * @param {string} packId
 * @returns {Promise<EmojiPack | undefined>}
 */
export async function getEmojiPackById(packId) {
  const packs = await getAllEmojiPacks();
  return packs.find((pack) => pack.id === packId);
}

/**
 * Get the default BANIBS-first emoji pack.
 * @returns {Promise<EmojiPack>}
 */
export async function getDefaultEmojiPack() {
  const packs = await getAllEmojiPacks();
  return (
    packs.find((p) => p.id === DEFAULT_EMOJI_PACK_ID) ||
    packs[0]
  );
}

/**
 * Simple search across a pack's emojis by shortcode or keyword.
 *
 * @param {EmojiPack} pack
 * @param {string} query
 * @returns {EmojiDefinition[]}
 */
export function searchEmojisInPack(pack, query) {
  if (!query) return pack.emojis;
  const q = query.toLowerCase();

  return pack.emojis.filter((emoji) => {
    const inShortcodes = (emoji.shortcodes || []).some((code) =>
      code.toLowerCase().includes(q),
    );
    const inKeywords = (emoji.keywords || []).some((kw) =>
      kw.toLowerCase().includes(q),
    );
    return inShortcodes || inKeywords;
  });
}

/**
 * Utility: flatten all emojis from all packs (if you ever need global search).
 *
 * @returns {Promise<EmojiDefinition[]>}
 */
export async function getAllEmojis() {
  const packs = await getAllEmojiPacks();
  return packs.flatMap((pack) => pack.emojis);
}

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

/**
 * Check if user can access Gold Spark pack based on tier
 */
export const canAccessGoldSpark = (userTier = 'free') => {
  const premiumTiers = ['banibs_plus', 'gold', 'elite', 'business_pro'];
  return premiumTiers.includes(userTier);
};
