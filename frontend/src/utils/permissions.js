/**
 * BANIBS Permissions & Capabilities System - Phase 11+ Infrastructure
 * 
 * Centralized permission checking for feature access control.
 * Supports role-based and capability-based permissions.
 */

/**
 * User Roles (from backend)
 */
export const ROLES = {
  PUBLIC: 'public',
  USER: 'user',
  MEMBER: 'member',
  BUSINESS_OWNER: 'business_owner',
  VERIFIED: 'verified',
  CONTRIBUTOR: 'contributor',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

/**
 * Feature Capabilities
 * More granular than roles - specific actions/features
 */
export const CAPABILITIES = {
  // Social
  CREATE_POST: 'create_post',
  CREATE_COMMENT: 'create_comment',
  CREATE_HIGH_FIVE: 'create_high_five',
  CREATE_STORY: 'create_story',
  SEND_MESSAGE: 'send_message',
  
  // Business
  CREATE_BUSINESS: 'create_business',
  MANAGE_BUSINESS: 'manage_business',
  POST_JOB: 'post_job',
  ACCESS_ANALYTICS: 'access_analytics',
  
  // Helping Hands
  CREATE_CAMPAIGN: 'create_campaign',
  DONATE: 'donate',
  
  // Future Modules (Phase 11+)
  ACCESS_PRAYER_ROOMS: 'access_prayer_rooms',
  CREATE_PRAYER_CIRCLE: 'create_prayer_circle',
  ACCESS_BEAUTY_MARKETPLACE: 'access_beauty_marketplace',
  SELL_BEAUTY_PRODUCTS: 'sell_beauty_products',
  ACCESS_SNEAKER_MARKETPLACE: 'access_sneaker_marketplace',
  ACCESS_DIASPORA: 'access_diaspora',
  ACCESS_ACADEMY: 'access_academy',
  MENTOR_YOUTH: 'mentor_youth',
  ACCESS_WALLET: 'access_wallet',
  SEND_MONEY: 'send_money',
  ACCESS_STOCK_WATCHLIST: 'access_stock_watchlist',
  
  // Moderation
  MODERATE_CONTENT: 'moderate_content',
  BAN_USER: 'ban_user',
  VIEW_REPORTS: 'view_reports'
};

/**
 * Role -> Capabilities mapping
 */
const ROLE_CAPABILITIES = {
  [ROLES.PUBLIC]: [
    CAPABILITIES.DONATE
  ],
  
  [ROLES.USER]: [
    CAPABILITIES.CREATE_POST,
    CAPABILITIES.CREATE_COMMENT,
    CAPABILITIES.CREATE_HIGH_FIVE,
    CAPABILITIES.CREATE_STORY,
    CAPABILITIES.SEND_MESSAGE,
    CAPABILITIES.CREATE_CAMPAIGN,
    CAPABILITIES.DONATE,
    CAPABILITIES.ACCESS_PRAYER_ROOMS,
    CAPABILITIES.ACCESS_BEAUTY_MARKETPLACE,
    CAPABILITIES.ACCESS_SNEAKER_MARKETPLACE,
    CAPABILITIES.ACCESS_DIASPORA,
    CAPABILITIES.ACCESS_ACADEMY,
    CAPABILITIES.ACCESS_STOCK_WATCHLIST
  ],
  
  [ROLES.VERIFIED]: [
    // Inherits USER capabilities, plus:
    CAPABILITIES.ACCESS_WALLET,
    CAPABILITIES.SEND_MONEY
  ],
  
  [ROLES.BUSINESS_OWNER]: [
    // Inherits USER capabilities, plus:
    CAPABILITIES.CREATE_BUSINESS,
    CAPABILITIES.MANAGE_BUSINESS,
    CAPABILITIES.POST_JOB,
    CAPABILITIES.ACCESS_ANALYTICS,
    CAPABILITIES.SELL_BEAUTY_PRODUCTS
  ],
  
  [ROLES.MODERATOR]: [
    CAPABILITIES.MODERATE_CONTENT,
    CAPABILITIES.VIEW_REPORTS
  ],
  
  [ROLES.ADMIN]: [
    CAPABILITIES.MODERATE_CONTENT,
    CAPABILITIES.BAN_USER,
    CAPABILITIES.VIEW_REPORTS
  ]
};

/**
 * Check if user has specific role
 */
export const hasRole = (user, requiredRole) => {
  if (!user) return requiredRole === ROLES.PUBLIC;
  return user.roles?.includes(requiredRole) || false;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user, requiredRoles = []) => {
  if (requiredRoles.includes(ROLES.PUBLIC)) return true;
  if (!user) return false;
  return requiredRoles.some(role => user.roles?.includes(role));
};

/**
 * Check if user has specific capability
 */
export const hasCapability = (user, capability) => {
  if (!user) {
    return ROLE_CAPABILITIES[ROLES.PUBLIC]?.includes(capability) || false;
  }
  
  // Check each user role's capabilities
  const userRoles = user.roles || [ROLES.USER];
  return userRoles.some(role => {
    const capabilities = ROLE_CAPABILITIES[role] || [];
    return capabilities.includes(capability);
  });
};

/**
 * Check if user can access a module
 */
export const canAccessModule = (user, module) => {
  if (!module.permissions || module.permissions.includes(ROLES.PUBLIC)) {
    return true;
  }
  
  if (!user) return false;
  
  return hasAnyRole(user, module.permissions);
};

/**
 * Get all capabilities for a user
 */
export const getUserCapabilities = (user) => {
  if (!user) {
    return ROLE_CAPABILITIES[ROLES.PUBLIC] || [];
  }
  
  const userRoles = user.roles || [ROLES.USER];
  const capabilities = new Set();
  
  userRoles.forEach(role => {
    const roleCaps = ROLE_CAPABILITIES[role] || [];
    roleCaps.forEach(cap => capabilities.add(cap));
  });
  
  return Array.from(capabilities);
};

/**
 * Permission guard hook for components
 * Returns { allowed, loading }
 */
export const usePermission = (requiredCapability, user) => {
  if (!user) {
    return {
      allowed: false,
      loading: false
    };
  }
  
  return {
    allowed: hasCapability(user, requiredCapability),
    loading: false
  };
};

/**
 * Higher-order component for permission-protected components
 */
export const withPermission = (Component, requiredCapability, fallback = null) => {
  return (props) => {
    const { user } = props;
    const { allowed } = usePermission(requiredCapability, user);
    
    if (!allowed) {
      return fallback || (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">
            You don't have permission to access this feature.
          </p>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
};

export default {
  ROLES,
  CAPABILITIES,
  hasRole,
  hasAnyRole,
  hasCapability,
  canAccessModule,
  getUserCapabilities,
  usePermission,
  withPermission
};
