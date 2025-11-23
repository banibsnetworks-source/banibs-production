/**
 * BANIBS Module Registry - Phase 11+ Infrastructure
 * 
 * Centralized module configuration for scalable feature additions.
 * This registry allows new portals/features to be plugged in without
 * modifying core routing or layout files.
 * 
 * Module Structure:
 * - id: Unique module identifier
 * - name: Display name
 * - route: Base route path
 * - enabled: Feature flag for gradual rollout
 * - layout: Layout component to use
 * - permissions: Required roles/capabilities
 * - icon: Navigation icon
 * - phase: Development phase number
 */

export const MODULE_REGISTRY = {
  // ============= PHASE 8-10: STABLE MODULES =============
  
  SOCIAL: {
    id: 'social',
    name: 'BANIBS Social',
    route: '/portal/social',
    enabled: true,
    layout: 'SocialLayout',
    theme: 'social',
    color: '#3B82F6', // Blue
    permissions: ['user'],
    phase: '8.0',
    description: 'Personal social feed and community'
  },
  
  BUSINESS: {
    id: 'business',
    name: 'BANIBS Connect',
    route: '/portal/business',
    enabled: true,
    layout: 'BusinessLayout',
    theme: 'connect',
    color: '#EAB308', // Gold
    permissions: ['user', 'business_owner'],
    phase: '8.0',
    description: 'Business networking and tools'
  },
  
  HELPING_HANDS: {
    id: 'helping_hands',
    name: 'Helping Hands',
    route: '/portal/helping-hands',
    enabled: true,
    layout: 'BusinessLayout',
    theme: 'connect',
    color: '#E8B657', // Gold variant
    permissions: ['user'],
    phase: '10.0',
    description: 'Donation-based crowdfunding'
  },
  
  NEWS: {
    id: 'news',
    name: 'BANIBS News',
    route: '/portal/news',
    enabled: true,
    layout: 'NewsLayout',
    theme: 'news',
    color: '#1F2937', // Dark
    permissions: ['public'],
    phase: '7.6',
    description: 'News aggregation and commentary'
  },
  
  MESSAGING: {
    id: 'messaging',
    name: 'Messages',
    route: '/messages',
    enabled: true,
    layout: 'MessagingLayout',
    theme: 'social',
    color: '#3B82F6',
    permissions: ['user'],
    phase: '3.0',
    description: 'Direct and group messaging'
  },
  
  // ============= PHASE 11+: PLANNED MODULES =============
  
  PRAYER_ROOMS: {
    id: 'prayer_rooms',
    name: 'Prayer Rooms',
    route: '/portal/prayer',
    enabled: true, // ✅ Phase 11.0 Complete
    layout: 'SpiritualLayout',
    theme: 'spiritual',
    color: '#8B5CF6', // Purple
    permissions: ['user'],
    phase: '11.0',
    description: 'Multi-faith prayer circles and meditation',
    subModules: [
      'unified_prayer_circles',
      'emergency_prayer',
      'prayer_wall',
      'meditation_rooms',
      'healing_tracks'
    ]
  },
  
  BEAUTY_MARKETPLACE: {
    id: 'beauty_marketplace',
    name: 'Beauty & Wellness',
    route: '/portal/beauty',
    enabled: true, // ✅ Phase 11.1 Complete
    layout: 'BeautyLayout',
    theme: 'beauty',
    color: '#EC4899', // Pink
    permissions: ['user'],
    phase: '11.1',
    description: 'Black-owned beauty products and services',
    subModules: [
      'beauty_directory',
      'sisters_wealth_circles',
      'beauty_accelerator',
      'product_marketplace'
    ]
  },
  
  SNEAKER_FASHION: {
    id: 'sneaker_fashion',
    name: 'Sneakers & Fashion',
    route: '/portal/fashion',
    enabled: true, // ✅ Phase 11.2 Complete
    layout: 'FashionLayout',
    theme: 'fashion',
    color: '#3B82F6', // Blue
    permissions: ['user'],
    phase: '11.2',
    description: 'Black-owned sneaker and fashion marketplace',
    subModules: [
      'sneaker_marketplace',
      'fashion_accelerator',
      'youth_design_program',
      'resale_platform'
    ]
  },
  
  DIASPORA_CONNECT: {
    id: 'diaspora_connect',
    name: 'Diaspora Connect',
    route: '/portal/diaspora',
    enabled: true, // ✅ Phase 12.0 Complete
    layout: 'DiasporaLayout',
    theme: 'diaspora',
    color: '#D97706', // Deep gold/amber
    permissions: ['public'], // Public access
    phase: '12.0',
    description: 'Connecting the global Black diaspora',
    subModules: [
      'regions_and_hubs',
      'stories_and_journeys',
      'business_directory',
      'education_library',
      'diaspora_snapshot'
    ]
  },
  
  CULTURAL_MESSAGING: {
    id: 'cultural_messaging',
    name: 'Cultural Network',
    route: '/portal/cwmn',
    enabled: false,
    layout: 'CulturalLayout',
    theme: 'cultural',
    color: '#10B981', // Green
    permissions: ['user'],
    phase: '11.0',
    description: 'Cultural wealth messaging network',
    subModules: [
      'support_black_first',
      'wealth_reinforcement',
      'unity_moments',
      'community_uplift'
    ]
  },
  
  DIASPORA_MODE: {
    id: 'diaspora',
    name: 'Diaspora Connect',
    route: '/portal/diaspora',
    enabled: false,
    layout: 'DiasporaLayout',
    theme: 'diaspora',
    color: '#06B6D4', // Cyan
    permissions: ['user'],
    phase: '12.0',
    description: 'Global African diaspora networking',
    subModules: [
      'country_circles',
      'cultural_exchange',
      'diaspora_business',
      'heritage_stories'
    ]
  },
  
  YOUTH_CURRICULUM: {
    id: 'youth_curriculum',
    name: 'BANIBS Academy',
    route: '/portal/academy',
    enabled: false,
    layout: 'EducationLayout',
    theme: 'education',
    color: '#8B5CF6', // Purple
    permissions: ['user'],
    phase: '13.0',
    description: 'Youth education and mentorship',
    subModules: [
      'financial_literacy',
      'entrepreneurship',
      'cultural_history',
      'mental_wellness',
      'gambling_prevention'
    ]
  },
  
  STOCK_WATCHLIST: {
    id: 'stock_watchlist',
    name: 'Stock Watchlist',
    route: '/portal/stocks',
    enabled: false,
    layout: 'FinanceLayout',
    theme: 'finance',
    color: '#059669', // Green
    permissions: ['user'],
    phase: '8.5',
    description: 'Black-owned business stock tracking',
    subModules: [
      'watchlist',
      'ticker_display',
      'market_news',
      'investment_education'
    ]
  },
  
  BANIBS_WALLET: {
    id: 'wallet',
    name: 'BANIBS Wallet',
    route: '/portal/wallet',
    enabled: false,
    layout: 'FinanceLayout',
    theme: 'finance',
    color: '#059669',
    permissions: ['user', 'verified'],
    phase: '14.0',
    description: 'Digital wallet and financial services',
    subModules: [
      'payments',
      'transfers',
      'savings',
      'investments'
    ]
  }
};

/**
 * Get all enabled modules
 */
export const getEnabledModules = () => {
  return Object.values(MODULE_REGISTRY).filter(module => module.enabled);
};

/**
 * Get module by ID
 */
export const getModule = (moduleId) => {
  return MODULE_REGISTRY[moduleId.toUpperCase()];
};

/**
 * Check if user has permission to access module
 */
export const canAccessModule = (module, userRoles = []) => {
  if (!module.permissions || module.permissions.includes('public')) {
    return true;
  }
  return module.permissions.some(permission => userRoles.includes(permission));
};

/**
 * Get modules by phase
 */
export const getModulesByPhase = (phase) => {
  return Object.values(MODULE_REGISTRY).filter(module => module.phase === phase);
};

/**
 * Get upcoming (disabled) modules
 */
export const getUpcomingModules = () => {
  return Object.values(MODULE_REGISTRY).filter(module => !module.enabled);
};

export default MODULE_REGISTRY;
