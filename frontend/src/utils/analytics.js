/**
 * Phase 6.2 - News Engagement Analytics Utilities
 * 
 * Track user clicks on news stories by region for trending analysis.
 * CRITICAL: This must never block user navigation to external news sources.
 */

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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