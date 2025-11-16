/**
 * BANIBS Analytics Utilities
 * 
 * Phase 6.2 - News Engagement Analytics (Internal tracking)
 * Phase 7.5.1 - PostHog Integration (Privacy-compliant external analytics)
 * 
 * CRITICAL: Analytics must never block user navigation or degrade UX
 */

import posthog from 'posthog-js';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// =============================================================================
// PHASE 7.5.1 - POSTHOG ANALYTICS
// =============================================================================

let analyticsInitialized = false;

/**
 * Initialize PostHog analytics (cookie-less, privacy-compliant)
 * Call this once on app load
 */
export const initializeAnalytics = () => {
  if (analyticsInitialized) return;
  
  const posthogKey = process.env.REACT_APP_POSTHOG_KEY;
  const posthogHost = process.env.REACT_APP_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!posthogKey) {
    console.log('📊 PostHog not configured - analytics tracking disabled');
    return;
  }
  
  try {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      persistence: 'memory', // Cookie-less
      disable_session_recording: true,
      disable_cookie: true,
      respect_dnt: true,
      autocapture: false, // Manual tracking only
    });
    
    analyticsInitialized = true;
    console.log('📊 PostHog analytics initialized (privacy-compliant)');
  } catch (error) {
    console.error('❌ PostHog initialization failed:', error);
  }
};

/**
 * Track a custom event (privacy-compliant, no PII)
 */
export const trackEvent = (eventName, properties = {}) => {
  if (!analyticsInitialized) return;
  
  try {
    // Sanitize properties to ensure no PII
    const sanitized = { ...properties };
    delete sanitized.email;
    delete sanitized.name;
    delete sanitized.phone;
    
    posthog.capture(eventName, {
      ...sanitized,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Fail silently - analytics should never break UX
  }
};

/**
 * Track page view
 */
export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_name: pageName,
    page_url: window.location.pathname,
  });
};

/**
 * Track user registration
 */
export const trackRegistration = (method = 'email') => {
  trackEvent('user_registration', { method });
};

/**
 * Track user login
 */
export const trackLogin = (method = 'email') => {
  trackEvent('user_login', { method });
};

/**
 * Track job application
 */
export const trackJobApplication = (jobCategory) => {
  trackEvent('job_application_submitted', { job_category: jobCategory });
};

// =============================================================================
// PHASE 7.1.1 - BUSINESS INSIGHTS ANALYTICS (BIA)
// =============================================================================

/**
 * Track BIA event to backend
 * Separate from PostHog - this is for business owner analytics dashboard
 */
const trackBIAEvent = async (eventData) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    await fetch(`${BACKEND_URL}/api/business-analytics/track`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
  } catch (error) {
    // Fail silently - tracking should never block UX
    console.debug('BIA tracking failed:', error);
  }
};

/**
 * Track business profile view
 */
export const trackBIAProfileView = (businessProfileId, source = 'direct') => {
  trackBIAEvent({
    business_profile_id: businessProfileId,
    event_type: 'profile_view',
    source,
    meta: {}
  });
};

/**
 * Track post view/impression
 */
export const trackBIAPostView = (businessProfileId, postId) => {
  trackBIAEvent({
    business_profile_id: businessProfileId,
    event_type: 'post_view',
    source: 'feed',
    meta: { post_id: postId }
  });
};

/**
 * Track job view
 */
export const trackBIAJobView = (businessProfileId, jobId) => {
  trackBIAEvent({
    business_profile_id: businessProfileId,
    event_type: 'job_view',
    source: 'job_board',
    meta: { job_id: jobId }
  });
};

/**
 * Track job application (BIA)
 */
export const trackBIAJobApplication = (businessProfileId, jobId) => {
  trackBIAEvent({
    business_profile_id: businessProfileId,
    event_type: 'job_apply',
    source: 'job_board',
    meta: { job_id: jobId }
  });
};

/**
 * Track search result click
 */
export const trackBIASearchClick = (businessProfileId, query) => {
  trackBIAEvent({
    business_profile_id: businessProfileId,
    event_type: 'search_click',
    source: 'search',
    meta: { query }
  });
};

/**
 * Track category browse click
 */
export const trackBIACategoryClick = (businessProfileId, category) => {
  trackBIAEvent({
    business_profile_id: businessProfileId,
    event_type: 'category_click',
    source: 'category',
    meta: { category }
  });
};

/**
 * Track directory search
 */
export const trackDirectorySearch = (resultsCount) => {
  trackEvent('directory_search', { results_count: resultsCount });
};

/**
 * Track directory filter
 */
export const trackDirectoryFilter = (filterType, filterValue) => {
  trackEvent('directory_filter_used', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

// =============================================================================
// PHASE 6.2 - NEWS ENGAGEMENT ANALYTICS (EXISTING)
// =============================================================================

/**
 * Track a user click on a news story.
 * 
 * @param {string} storyId - The news story ID
 * @param {string} region - The region ("Americas", "Middle East", "Global", etc.)
 * 
 * This function:
 * - Fires async to track engagement
 * - Never blocks or delays user navigation
 * - Fails silently if analytics is down
 * - Rate-limited by backend to prevent abuse
 */
export async function trackNewsClick(storyId, region) {
  // Never block navigation - fire and forget
  try {
    // Use setTimeout to ensure this doesn't block the navigation
    setTimeout(async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/metrics/news-click`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            storyId: storyId,
            region: region
          }),
          // Don't wait too long - user experience is priority
          signal: AbortSignal.timeout(2000)
        });
        
        // We don't actually care about the response
        // The backend always returns success to avoid blocking navigation
        console.log(`📊 Tracked click: ${region} story`);
        
      } catch (error) {
        // Fail completely silently - analytics should never interfere with UX
        console.log('Analytics tracking failed silently (expected behavior)');
      }
    }, 0);
    
  } catch (error) {
    // Even the setTimeout setup failed - that's fine
    console.log('Analytics setup failed silently');
  }
}

/**
 * Fetch trending stories for a region.
 * 
 * @param {string} region - The region to get trending stories for
 * @param {number} limit - Number of stories to return (default 5)
 * @returns {Promise<Object>} - Trending stories response
 */
export async function fetchTrendingStories(region = 'Global', limit = 5) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/news/trending?region=${encodeURIComponent(region)}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending stories');
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error fetching trending stories:', error);
    
    // Return empty but valid structure on error
    return {
      region: region,
      stories: []
    };
  }
}