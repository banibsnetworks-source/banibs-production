// BANIBS Connect - Unified Messaging API
// Automatically switches between mock and real API based on environment

import { mockApi } from './mockApi';
import { realMessagingApi } from './apiClientMessaging';

// Check environment variable to determine which API to use
// REACT_APP_MESSAGING_SOURCE can be:
// - "mock" (default): Use mock data for development/testing
// - "api": Use real FastAPI backend
const MESSAGING_SOURCE = process.env.REACT_APP_MESSAGING_SOURCE || 'mock';

/**
 * Unified messaging API that switches between mock and real based on config
 */
export const messagingApi = MESSAGING_SOURCE === 'api' ? realMessagingApi : mockApi;

/**
 * Check if we're using real API
 */
export const isUsingRealApi = () => MESSAGING_SOURCE === 'api';

/**
 * Export both for explicit use
 */
export { mockApi, realMessagingApi };
