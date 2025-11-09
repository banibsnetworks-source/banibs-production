import { test, expect } from "@playwright/test";

/**
 * Candidate Flow E2E Tests - Phase 7.1 Cycle 1.4
 * 
 * Tests the complete candidate journey:
 * - Profile management and persistence
 * - Job application flow with gating logic
 * - Application tracking in My Applications
 */

const CANDIDATE_EMAIL = "james.t@email.com";
const CANDIDATE_PASSWORD = "Candidate#123";

test.describe("Candidate flow: profile → apply → track", () => {
  
  test("profile changes persist after save", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(CANDIDATE_EMAIL);
    await page.locator('input[type="password"]').fill(CANDIDATE_PASSWORD);
    await page.locator('button:has-text("Sign In")').click();
    
    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Go to profile
    await page.goto("/candidate/profile");
    await page.waitForLoadState("networkidle");

    // Find headline input - be flexible with label text
    const headlineInput = page.locator('input[type="text"]').filter({ 
      has: page.locator('..').filter({ hasText: /headline/i }) 
    }).or(page.getByPlaceholder(/headline/i)).first();
    
    const newHeadline = `BANIBS Test Headline ${Date.now()}`;

    await headlineInput.fill(newHeadline);
    
    // Find and click save button
    const saveButton = page.getByRole("button", { name: /save profile|update profile/i });
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Reload and verify persistence
    await page.reload({ waitUntil: 'networkidle' });
    
    // Verify the headline persisted
    await expect(headlineInput).toHaveValue(newHeadline);
    
    console.log('✅ Profile save test passed');
  });

  test("candidate can apply and see application in My Applications", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(CANDIDATE_EMAIL);
    await page.locator('input[type="password"]').fill(CANDIDATE_PASSWORD);
    await page.locator('button:has-text("Sign In")').click();
    
    await page.waitForLoadState("networkidle");

    // Go to opportunities
    await page.goto("/opportunities");
    await page.waitForLoadState("networkidle");

    // Find and click first job link - be flexible with selector
    const firstJobLink = page.locator('a').filter({ 
      hasText: /view details|view job|learn more/i 
    }).first();
    
    // If no "view details" link, try clicking job card directly
    if (await firstJobLink.count() === 0) {
      const jobCard = page.locator('div, article').filter({ 
        hasText: /engineer|developer|analyst/i 
      }).first();
      await jobCard.click();
    } else {
      await firstJobLink.click();
    }

    await page.waitForLoadState("networkidle");

    // Find and click Apply button
    const applyButton = page.getByRole("button", { name: /apply now|apply/i }).first();
    await applyButton.click();

    // Handle potential profile gating
    await page.waitForTimeout(1000);
    
    if (page.url().includes("/candidate/profile")) {
      console.log('ℹ️  Profile page detected, saving profile first');
      
      const saveButton = page.getByRole("button", { name: /save profile|update profile/i });
      await saveButton.click();
      
      await page.waitForTimeout(1500);
      
      // Navigate back to opportunities and try again
      await page.goto("/opportunities");
      await page.waitForLoadState("networkidle");
      
      const retryJobLink = page.locator('a').filter({ 
        hasText: /view details|view job/i 
      }).first();
      await retryJobLink.click();
      
      await page.waitForLoadState("networkidle");
      await page.getByRole("button", { name: /apply now|apply/i }).first().click();
    }

    // Application dialog should appear
    await page.waitForTimeout(1000);
    
    // Find cover letter field
    const coverLetterField = page.getByLabel(/cover letter/i).or(
      page.locator('textarea').filter({ 
        has: page.locator('..').filter({ hasText: /cover letter/i }) 
      })
    ).first();
    
    await expect(coverLetterField).toBeVisible({ timeout: 10000 });

    await coverLetterField.fill(
      `BANIBS automated test application created at ${new Date().toISOString()}`
    );

    // Submit application
    const submitButton = page.getByRole("button", { name: /submit application/i });
    await submitButton.click();

    await page.waitForTimeout(2000);

    // Navigate to My Applications
    await page.goto("/candidate/applications");
    await page.waitForLoadState("networkidle");

    // Verify at least one application is visible
    const applicationsList = page.locator('div, article').filter({ 
      hasText: /applied|application/i 
    });
    
    await expect(applicationsList.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Application flow test passed');
  });
});
