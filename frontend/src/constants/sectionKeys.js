/**
 * Section Keys and Configuration
 * Phase 7.6.3 - Canonical section mapping for BANIBS News
 * Phase B.0 - Updated labels to align with News Taxonomy v2
 */

export const SECTION_MAP = {
  'top-stories': { label: 'Top Stories', icon: '⭐' },
  'black': { label: 'Black News', icon: '🖤' },
  'us': { label: 'U.S.', icon: '🇺🇸' },
  'world': { label: 'World', icon: '🌍' },
  'politics': { label: 'Politics', icon: '⚖️' },  // Shortened from "Politics & Government"
  'healthwatch': { label: 'Health', icon: '🏥' },
  'moneywatch': { label: 'MoneyWatch', icon: '💰' },
  'entertainment': { label: 'Entertainment', icon: '🎬' },
  'crime': { label: 'Crime', icon: '🚨' },
  'sports': { label: 'Sports', icon: '⚽' },
  'culture': { label: 'Culture', icon: '🎨' },
  'science-tech': { label: 'Sci & Tech', icon: '🔬' },  // Shortened from "Science & Tech"
  'civil-rights': { label: 'Civil Rights', icon: '✊' },
  // 'business': { label: 'Business', icon: '📈' },  // HIDDEN - redundant with MoneyWatch (v2 alignment)
  'education': { label: 'Education', icon: '🎓' },
};

export const VALID_SECTIONS = Object.keys(SECTION_MAP);

export const getSectionLabel = (sectionKey) => {
  return SECTION_MAP[sectionKey]?.label || sectionKey;
};

export const getSectionIcon = (sectionKey) => {
  return SECTION_MAP[sectionKey]?.icon || '📰';
};

export const isValidSection = (sectionKey) => {
  return VALID_SECTIONS.includes(sectionKey);
};
