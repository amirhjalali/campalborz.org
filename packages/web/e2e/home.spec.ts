import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Camp Alborz/i);
  });

  test('navigation bar is visible', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Main navigation"]');
    await expect(nav).toBeVisible();
  });

  test('hero section displays', async ({ page }) => {
    // The hero is the first section with the full-bleed background
    const hero = page.locator('main > section').first();
    await expect(hero).toBeVisible();

    // Hero heading should contain "Camp" and "Alborz"
    const heading = page.locator('h1');
    await expect(heading).toContainText('Camp');
    await expect(heading).toContainText('Alborz');
  });

  test('footer renders with correct links', async ({ page }) => {
    const footer = page.locator('footer[role="contentinfo"]');
    await expect(footer).toBeVisible();

    // Verify footer navigation links exist
    const footerNav = footer.locator('nav[aria-label="Footer navigation"]');
    await expect(footerNav).toBeVisible();

    const expectedLinks = ['About', 'Events', 'Art', 'Culture', 'Apply', 'Donate', 'Members'];
    for (const linkText of expectedLinks) {
      await expect(footerNav.locator(`a:has-text("${linkText}")`)).toBeVisible();
    }
  });

  test('dark mode toggle works', async ({ page }) => {
    // Find the dark mode toggle button
    const toggle = page.locator('button[aria-label*="Switch to"]');
    await expect(toggle).toBeVisible();

    // Get initial aria-label
    const initialLabel = await toggle.getAttribute('aria-label');

    // Click toggle
    await toggle.click();

    // Label should change after toggling
    const newLabel = await toggle.getAttribute('aria-label');
    expect(newLabel).not.toBe(initialLabel);
  });

  test('skip-to-content link exists', async ({ page }) => {
    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    // The main content target should exist
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeAttached();
  });

  test('hero CTA buttons are visible', async ({ page }) => {
    // The hero section should have call-to-action links/buttons
    const hero = page.locator('main > section').first();
    const ctaLinks = hero.locator('a');
    expect(await ctaLinks.count()).toBeGreaterThan(0);
  });

  test('page has no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known benign errors (e.g., favicon 404, HMR)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('HMR') && !e.includes('webpack')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
