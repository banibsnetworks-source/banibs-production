import { test, expect } from "@playwright/test";

/**
 * Candidate Flow E2E Tests - Phase 7.1 Cycle 1.4
 * 
 * Tests using URL + selector waits instead of networkidle
 * to handle continuous background activity (RSS, analytics, CDN)
 */

const CANDIDATE_EMAIL = "james.t@email.com";
const CANDIDATE_PASSWORD = "Candidate#123";

async function loginAsCandidate(page) {
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(CANDIDATE_EMAIL);
  await page.locator('input[type="password"]').fill(CANDIDATE_PASSWORD);
  await page.locator('button:has-text("Sign In")').click();

  // Wait for redirect after login
  await page.waitForURL(/dashboard|hub|candidate\/profile|opportunities/, {
    timeout: 15000,
  });
}

test.describe("Candidate flow: profile → apply → track", () => {
  test("profile changes persist after save", async ({ page }) => {
    await loginAsCandidate(page);

    // Go directly to profile
    await page.goto("/candidate/profile");
    await page.waitForURL("**/candidate/profile", { timeout: 10000 });

    // Find headline input by placeholder or adjacent label text
    const headlineInput = page.getByPlaceholder(/headline|professional/i).or(
      page.locator('input[type="text"]').filter({
        has: page.locator('..').filter({ hasText: /headline|professional/i })
      })
    ).first();
    await headlineInput.waitFor({ timeout: 10000 });

    const newHeadline = `BANIBS Test Headline ${Date.now()}`;

    await headlineInput.fill(newHeadline);
    await page.getByRole("button", { name: /save profile/i }).click();

    // Give API a moment; we don't care about networkidle, just persistence
    await page.waitForTimeout(800);

    await page.reload();
    await headlineInput.waitFor({ timeout: 10000 });
    await expect(headlineInput).toHaveValue(newHeadline);
  });

  test("candidate can apply and see application in My Applications", async ({
    page,
  }) => {
    await loginAsCandidate(page);

    // Navigate to opportunities
    await page.goto("/opportunities");
    await page.waitForURL("**/opportunities", { timeout: 10000 });

    // Wait for at least one job entry
    const firstJobLink = page
      .getByRole("link", { name: /view details/i })
      .first();
    await firstJobLink.waitFor({ timeout: 10000 });

    await firstJobLink.click();

    // Wait for job detail page by heading
    const jobHeading = page
      .getByRole("heading")
      .filter({ hasText: /developer|engineer|job/i })
      .first();
    await jobHeading.waitFor({ timeout: 10000 });

    // Apply button
    let applyButton = page.getByRole("button", { name: /apply/i }).first();
    await applyButton.waitFor({ timeout: 10000 });
    await applyButton.click();

    // If we got redirected to profile gating, handle it
    if (page.url().includes("/candidate/profile")) {
      const saveProfile = page.getByRole("button", { name: /save profile/i });
      await saveProfile.waitFor({ timeout: 10000 });
      await saveProfile.click();
      await page.waitForTimeout(800);

      // Navigate back to opportunities → job → apply again
      await page.goto("/opportunities");
      await page.waitForURL("**/opportunities", { timeout: 10000 });
      await firstJobLink.waitFor({ timeout: 10000 });
      await firstJobLink.click();

      applyButton = page.getByRole("button", { name: /apply/i }).first();
      await applyButton.waitFor({ timeout: 10000 });
      await applyButton.click();
    }

    // Application dialog
    const coverLetterField = page.getByLabel(/cover letter/i);
    await coverLetterField.waitFor({ timeout: 10000 });
    await coverLetterField.fill(
      "This is an automated BANIBS test application."
    );

    const submitButton = page.getByRole("button", {
      name: /submit application/i,
    });
    await submitButton.waitFor({ timeout: 10000 });
    await submitButton.click();

    // Give the backend a moment
    await page.waitForTimeout(1500);

    // Go to My Applications
    await page.goto("/candidate/applications");
    await page.waitForURL("**/candidate/applications", { timeout: 10000 });

    // Wait for list or empty state
    // We expect at least one application entry text like "Applied" or a status badge
    await expect(
      page.getByText(/submitted|in review|interview|applied/i).first()
    ).toBeVisible({ timeout: 15000 });
  });
});
