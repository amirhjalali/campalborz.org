import { test, expect } from '@playwright/test';

test.describe('Public pages', () => {
  test('/about page loads with content', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/art page loads', async ({ page }) => {
    await page.goto('/art');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/art/homa page loads', async ({ page }) => {
    await page.goto('/art/homa');
    await expect(page.locator('main')).toBeVisible();
    // Should contain reference to HOMA
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/art/damavand page loads', async ({ page }) => {
    await page.goto('/art/damavand');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/events page loads', async ({ page }) => {
    await page.goto('/events');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/culture page loads', async ({ page }) => {
    await page.goto('/culture');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/donate page loads', async ({ page }) => {
    await page.goto('/donate');
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('/search page loads with search input', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('main')).toBeVisible();

    // Search input should be present
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
  });

  test('/apply page loads with form', async ({ page }) => {
    await page.goto('/apply');
    await expect(page.locator('main')).toBeVisible();

    // Application form should have input fields
    const formInputs = page.locator('input, textarea, select');
    expect(await formInputs.count()).toBeGreaterThan(0);
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-page');

    // The 404 page displays "404" text
    await expect(page.locator('text=404')).toBeVisible();

    // Should show helpful messaging
    await expect(page.locator('text=Go to Homepage')).toBeVisible();
  });
});
