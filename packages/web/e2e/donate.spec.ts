import { test, expect } from '@playwright/test';

test.describe('Donate page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/donate');
  });

  test('renders donation tiers', async ({ page }) => {
    // The "DONATION TIERS" eyebrow text should be visible
    await expect(page.locator('text=DONATION TIERS')).toBeVisible();

    // Tier cards should be present (they use luxury-card class)
    const tierCards = page.locator('.luxury-card');
    expect(await tierCards.count()).toBeGreaterThanOrEqual(1);
  });

  test('payment options section is visible', async ({ page }) => {
    // The "WAYS TO GIVE" section
    const waysToGive = page.locator('#ways-to-give');
    await expect(waysToGive).toBeAttached();

    await expect(page.locator('text=Preferred Ways to Give')).toBeAttached();
  });

  test('tax info section shows', async ({ page }) => {
    // Tax info section references 501(c)(3) status
    await expect(page.locator('text=501(c)(3)')).toBeAttached();
  });

  test('CTA buttons are visible', async ({ page }) => {
    // Donate tier buttons with "Donate $" text
    const donateButtons = page.locator('button:has-text("Donate $")');
    expect(await donateButtons.count()).toBeGreaterThanOrEqual(1);
  });

  test('Givebutter donation link exists', async ({ page }) => {
    const givebutterLink = page.locator('a[href*="givebutter"]');
    await expect(givebutterLink).toBeAttached();
    await expect(givebutterLink).toContainText('Donate via Givebutter');
  });
});
