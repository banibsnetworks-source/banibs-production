/**
 * BANIBS Emoji System
 * Central utility for emoji pack management and rendering
 */

// Load all available emoji packs
export const loadEmojiPacks = async () => {
  const packs = [
    'base_yellow',
    'banibs_standard',
    'banibs_gold_spark'
  ];

  const loadedPacks = [];

  for (const packId of packs) {
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

  return loadedPacks;
};

// Get user's available emoji packs based on tier
// BANIBS packs are ALWAYS listed first - they're our primary brand identity
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

// Parse text with emoji rendering
export const parseTextWithEmojis = (text) => {
  // Simple emoji regex - matches basic emoji unicode ranges
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;
  
  return text;
};

// Check if user can access emoji pack
export const canAccessPack = (packId, userTier = 'free') => {
  const userPacks = getUserEmojiPacks(userTier);
  return userPacks.includes(packId);
};

// Get high-five variant based on tier
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
  loadEmojiPacks,
  getUserEmojiPacks,
  parseTextWithEmojis,
  canAccessPack,
  getHighFiveVariant
};
