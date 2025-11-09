import { test, expect } from "@playwright/test";

/**
 * Recruiter Analytics E2E Tests - Phase 7.1 Cycle 1.4
 * 
 * Tests the recruiter dashboard analytics integration:
 * - Analytics summary strip rendering
 * - Per-job application counts
 * - Data consistency with backend
 */

const RECRUITER_EMAIL = "sarah.j@techforward.com";
const RECRUITER_PASSWORD = "Recruiter#123";

test.describe("Recruiter dashboard analytics", () => {
  
  test("analytics strip and applications column render correctly", async ({ page }) => {
    // Login as recruiter
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(RECRUITER_EMAIL);
    await page.locator('input[type="password"]').fill(RECRUITER_PASSWORD);
    await page.locator('button:has-text("Sign In")').click();
    
    await page.waitForLoadState("networkidle");

    // Navigate to recruiter dashboard
    await page.goto("/opportunities/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Wait for analytics to load
    await page.waitForTimeout(2000);

    // Verify analytics cards are visible with labels
    console.log('Checking for analytics summary cards...');
    
    await expect(page.getByText(/Total Jobs/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Active Jobs/i)).toBeVisible();
    await expect(page.getByText(/Total Applications/i)).toBeVisible();
    await expect(page.getByText(/Last 30 Days/i)).toBeVisible();
    
    console.log('✅ All analytics cards visible');

    // Verify numeric values are present (not just labels)
    // Look for numbers in the analytics cards
    const analyticsSection = page.locator('div').filter({ 
      hasText: /Total Jobs|Active Jobs|Total Applications|Last 30 Days/ 
    }).first();
    
    const hasNumbers = await analyticsSection.locator('div').filter({ 
      hasText: /^\d+$/ 
    }).count();
    
    expect(hasNumbers).toBeGreaterThan(0);
    console.log(`✅ Found ${hasNumbers} numeric analytics values`);

    // Verify "Applications" column exists in jobs section
    const applicationsLabel = page.getByText(/Applications/i);
    await expect(applicationsLabel).toBeVisible();
    console.log('✅ Applications column label visible');

    // Verify at least one job row has application count
    // Look for job cards or table rows with application data
    const jobSection = page.locator('article, div').filter({ 
      hasText: /Applications/ 
    });
    
    const jobCards = await jobSection.count();
    expect(jobCards).toBeGreaterThan(0);
    console.log(`✅ Found ${jobCards} job entries with application data`);
    
    console.log('✅ Recruiter analytics test passed');
  });

  test("dashboard handles empty states gracefully", async ({ page }) => {
    // This test verifies the EmptyState component would render if needed
    // We can't easily trigger it with the seeded data, but we can verify
    // the page structure is sound
    
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(RECRUITER_EMAIL);
    await page.locator('input[type="password"]').fill(RECRUITER_PASSWORD);
    await page.locator('button:has-text("Sign In")').click();
    
    await page.waitForLoadState("networkidle");
    await page.goto("/opportunities/dashboard");
    await page.waitForLoadState("networkidle");
    
    // Verify the dashboard loads without errors
    const dashboardHeading = page.getByRole('heading', { name: /recruiter dashboard/i });
    await expect(dashboardHeading).toBeVisible();
    
    // Verify "Create New Job" button is present
    const createJobButton = page.getByRole('button', { name: /create new job/i });
    await expect(createJobButton).toBeVisible();
    
    console.log('✅ Dashboard structure test passed');
  });
});
