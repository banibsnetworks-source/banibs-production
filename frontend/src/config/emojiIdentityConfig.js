/**
 * BANIBS Emoji Identity System - Configuration
 * Defines all available identity attributes for personalized emojis
 */

export const SKIN_TONES = [
  { id: 'tone1', label: 'Very Light', example: '👍🏻', modifier: '\u{1F3FB}' },
  { id: 'tone2', label: 'Light / Medium-Light', example: '👍🏼', modifier: '\u{1F3FC}' },
  { id: 'tone3', label: 'Medium', example: '👍🏽', modifier: '\u{1F3FD}' },
  { id: 'tone4', label: 'Medium-Dark (BANIBS Default)', example: '👍🏾', modifier: '\u{1F3FE}' },
  { id: 'tone5', label: 'Dark', example: '👍🏿', modifier: '\u{1F3FF}' }
];

export const HAIR_TEXTURES = [
  { id: 'straight', label: 'Straight' },
  { id: 'wavy', label: 'Wavy' },
  { id: 'curly', label: 'Curly' },
  { id: 'coily', label: 'Coily / Kinky' },
  { id: 'locked', label: 'Locs / Dreads' },
  { id: 'bald', label: 'Bald / Shaved' },
  { id: 'other', label: 'Other' }
];

export const HAIR_LENGTHS = [
  { id: 'bald', label: 'Bald' },
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'extra_long', label: 'Extra Long' }
];

export const HAIR_COLORS = [
  { id: 'black', label: 'Black' },
  { id: 'dark_brown', label: 'Dark Brown' },
  { id: 'medium_brown', label: 'Medium Brown' },
  { id: 'light_brown', label: 'Light Brown' },
  { id: 'red', label: 'Red' },
  { id: 'blonde', label: 'Blonde' },
  { id: 'platinum', label: 'Platinum' },
  { id: 'auburn', label: 'Auburn' },
  { id: 'gray', label: 'Gray / Silver' },
  { id: 'colored', label: 'Colored / Fun' }
];

export const FACIAL_HAIR = [
  { id: 'none', label: 'None' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'goatee', label: 'Goatee' },
  { id: 'mustache', label: 'Mustache' },
  { id: 'beard_short', label: 'Short Beard' },
  { id: 'beard_full', label: 'Full Beard' }
];

export const ACCESSORIES = [
  { id: 'glasses', label: 'Glasses' },
  { id: 'sunglasses', label: 'Sunglasses' },
  { id: 'earrings', label: 'Earrings' },
  { id: 'headwrap', label: 'Headwrap' },
  { id: 'hat', label: 'Hat / Cap' },
  { id: 'hoop_earrings', label: 'Hoop Earrings' },
  { id: 'necklace', label: 'Necklace' }
];

/**
 * Default BANIBS emoji identity
 * Optimized for Black representation and visibility
 */
export const DEFAULT_EMOJI_IDENTITY = {
  skinTone: 'tone4', // Medium-dark (BANIBS default)
  hairTexture: 'coily',
  hairLength: 'short',
  hairColor: 'black',
  facialHair: 'none',
  accessories: []
};
