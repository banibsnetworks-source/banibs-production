/**
 * BANIBS Route Configuration - Phase 11+ Infrastructure
 * 
 * Centralized route definitions for all portal modules.
 * Makes it easy to add new routes without touching App.js directly.
 */

import { 
  PrayerRoomsPlaceholder,
  BeautyMarketplacePlaceholder,
  SneakerFashionPlaceholder,
  DiasporaPlaceholder,
  YouthAcademyPlaceholder,
  WalletPlaceholder
} from '../components/portals/PortalPlaceholder';

/**
 * Phase 11+ Portal Routes
 * These routes are registered but show placeholder pages until features are built
 */
export const PHASE_11_ROUTES = [
  {
    path: '/portal/prayer',
    element: PrayerRoomsPlaceholder,
    name: 'Prayer Rooms',
    phase: '11.0',
    enabled: true, // Route exists but shows placeholder
    requiresAuth: true
  },
  {
    path: '/portal/beauty',
    element: BeautyMarketplacePlaceholder,
    name: 'Beauty & Wellness',
    phase: '11.0',
    enabled: true,
    requiresAuth: true
  },
  {
    path: '/portal/fashion',
    element: SneakerFashionPlaceholder,
    name: 'Sneakers & Fashion',
    phase: '11.0',
    enabled: true,
    requiresAuth: true
  },
  {
    path: '/portal/diaspora',
    element: DiasporaPlaceholder,
    name: 'Diaspora Connect',
    phase: '12.0',
    enabled: true,
    requiresAuth: true
  },
  {
    path: '/portal/academy',
    element: YouthAcademyPlaceholder,
    name: 'BANIBS Academy',
    phase: '13.0',
    enabled: true,
    requiresAuth: true
  },
  {
    path: '/portal/wallet',
    element: WalletPlaceholder,
    name: 'BANIBS Wallet',
    phase: '14.0',
    enabled: true,
    requiresAuth: true
  }
];

/**
 * Get enabled Phase 11+ routes
 */
export const getPhase11Routes = () => {
  return PHASE_11_ROUTES.filter(route => route.enabled);
};

/**
 * Route generator helper
 * Converts route config to React Router Route component props
 */
export const generateRouteProps = (routeConfig) => {
  const Component = routeConfig.element;
  
  return {
    path: routeConfig.path,
    element: routeConfig.requiresAuth ? (
      // Placeholder pages don't need ProtectedRoute since they don't show sensitive data
      <Component />
    ) : (
      <Component />
    )
  };
};

/**
 * Example usage in App.js:
 * 
 * import { getPhase11Routes, generateRouteProps } from './config/routeConfig';
 * 
 * function App() {
 *   return (
 *     <Routes>
 *       {getPhase11Routes().map((routeConfig) => (
 *         <Route key={routeConfig.path} {...generateRouteProps(routeConfig)} />
 *       ))}
 *     </Routes>
 *   );
 * }
 */

export default {
  PHASE_11_ROUTES,
  getPhase11Routes,
  generateRouteProps
};
