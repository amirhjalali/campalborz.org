import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all main nav links exist', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Main navigation"]');

    const expectedLinks = [
      { text: 'About', href: '/about' },
      { text: 'Art', href: '/art' },
      { text: 'Events', href: '/events' },
      { text: 'Culture', href: '/culture' },
      { text: 'Donate', href: '/donate' },
    ];

    for (const link of expectedLinks) {
      const navLink = nav.locator(`a[href="${link.href}"]`);
      await expect(navLink).toBeAttached();
    }
  });

  test('logo links to homepage', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Main navigation"]');
    const logo = nav.locator('a[href="/"]');
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('Camp Alborz');
  });

  test('desktop nav shows Donate button', async ({ page }) => {
    // Donate button in the right-side buttons area (separate from nav items)
    const nav = page.locator('nav[aria-label="Main navigation"]');
    const donateButton = nav.locator('a[href="/donate"]:has-text("Donate")');
    await expect(donateButton.first()).toBeAttached();
  });

  test('Art dropdown has sub-items', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Main navigation"]');
    const artLink = nav.locator('a[href="/art"]');

    // Hover to open dropdown
    await artLink.hover();

    // Dropdown should show HOMA and DAMAVAND links
    const homaLink = nav.locator('a[href="/art/homa"]');
    const damavandLink = nav.locator('a[href="/art/damavand"]');

    await expect(homaLink).toBeVisible();
    await expect(damavandLink).toBeVisible();
  });

  test.describe('Mobile menu', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('opens and closes', async ({ page }) => {
      // Mobile menu toggle button
      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      await expect(menuButton).toBeVisible();

      // Open menu
      await menuButton.click();

      // Mobile menu should be visible
      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Close button should now be present
      const closeButton = page.locator('button[aria-label="Close navigation menu"]');
      await expect(closeButton).toBeVisible();

      // Close menu
      await closeButton.click();

      // Mobile menu should be hidden
      await expect(mobileMenu).not.toBeVisible();
    });

    test('contains all navigation links', async ({ page }) => {
      // Open mobile menu
      const menuButton = page.locator('button[aria-label="Open navigation menu"]');
      await menuButton.click();

      const mobileMenu = page.locator('#mobile-menu');
      await expect(mobileMenu).toBeVisible();

      // Check that main nav items are present
      const expectedLinks = ['About', 'Events', 'Art', 'Culture', 'Members'];
      for (const linkText of expectedLinks) {
        await expect(mobileMenu.locator(`a:has-text("${linkText}")`).first()).toBeVisible();
      }
    });
  });
});
