/**
 * BANIBS Emoji Identity - Tone Application Utilities
 * Applies Fitzpatrick skin tone modifiers to Unicode emojis
 */

import { SKIN_TONES } from '../config/emojiIdentityConfig';

// Skin tone modifiers (Fitzpatrick scale)
const SKIN_TONE_MODIFIERS = {
  tone1: '\u{1F3FB}', // 🏻 light
  tone2: '\u{1F3FC}', // 🏼 medium-light
  tone3: '\u{1F3FD}', // 🏽 medium
  tone4: '\u{1F3FE}', // 🏾 medium-dark (BANIBS default)
  tone5: '\u{1F3FF}'  // 🏿 dark
};

/**
 * Apply a skin tone modifier to a base emoji character
 * 
 * @param {string} baseChar - Base emoji character without tone modifier
 * @param {string} toneKey - Tone key (tone1-tone5)
 * @param {boolean} supportsSkinTone - Whether this emoji supports skin tones
 * @returns {string} Emoji with tone applied or base char if not supported
 */
export function applySkinTone(baseChar, toneKey = 'tone4', supportsSkinTone = true) {
  // If emoji doesn't support tones or no tone specified, return base
  if (!supportsSkinTone || !toneKey || !SKIN_TONE_MODIFIERS[toneKey]) {
    return baseChar;
  }

  const modifier = SKIN_TONE_MODIFIERS[toneKey];
  return `${baseChar}${modifier}`;
}

/**
 * Remove skin tone modifier from an emoji
 * Useful for getting the base character
 * 
 * @param {string} emojiWithTone - Emoji that may have a tone modifier
 * @returns {string} Base emoji without tone modifier
 */
export function removeSkinTone(emojiWithTone) {
  // Remove all Fitzpatrick modifiers
  return emojiWithTone.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '');
}

/**
 * Get tone label by key
 * 
 * @param {string} toneKey - Tone key (tone1-tone5)
 * @returns {string} Human-readable label
 */
export function getToneLabel(toneKey) {
  const tone = SKIN_TONES.find(t => t.id === toneKey);
  return tone ? tone.label : 'Unknown';
}

/**
 * Get tone modifier character by key
 * 
 * @param {string} toneKey - Tone key (tone1-tone5)
 * @returns {string} Unicode modifier character
 */
export function getToneModifier(toneKey) {
  return SKIN_TONE_MODIFIERS[toneKey] || '';
}

/**
 * Check if an emoji supports skin tone modifiers
 * Basic heuristic: if it's in the "people" or "hands" category
 * 
 * @param {string} category - Emoji category
 * @returns {boolean} True if likely supports tone
 */
export function categorySupportsT one(category) {
  const toneCategories = ['people', 'hands', 'gestures', 'faces'];
  return toneCategories.includes(category?.toLowerCase());
}

export default {
  applySkinTone,
  removeSkinTone,
  getToneLabel,
  getToneModifier,
  categorySupportsT one
};
