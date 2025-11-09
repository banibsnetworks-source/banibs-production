import { test, expect } from "@playwright/test";

/**
 * Recruiter Analytics E2E Tests - Phase 7.1 Cycle 1.4
 * 
 * Tests using URL + selector waits instead of networkidle
 */

const RECRUITER_EMAIL = "sarah.j@techforward.com";
const RECRUITER_PASSWORD = "Recruiter#123";

async function loginAsRecruiter(page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(RECRUITER_EMAIL);
  await page.getByLabel(/password/i).fill(RECRUITER_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.waitForURL(/recruiter|dashboard|hub|opportunities/, {
    timeout: 15000,
  });
}

test.describe("Recruiter dashboard analytics", () => {
  test("analytics strip and applications column render", async ({ page }) => {
    await loginAsRecruiter(page);

    // Go to recruiter dashboard explicitly
    await page.goto("/opportunities/dashboard");
    await page.waitForURL("**/opportunities/dashboard", { timeout: 10000 });

    // Wait for analytics cards by their labels
    await expect(page.getByText(/Total Jobs/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Active Jobs/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Total Applications/i)).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText(/Last 30 Days/i)).toBeVisible({
      timeout: 15000,
    });

    // Applications column header
    await expect(page.getByText(/Applications/i).first()).toBeVisible({
      timeout: 15000,
    });

    // At least one row in jobs table with a numeric applications value
    const appsCell = page
      .locator("td")
      .filter({ hasText: /\d/ })
      .first();
    await appsCell.waitFor({ timeout: 15000 });
    await expect(appsCell).toBeVisible();
  });
});
