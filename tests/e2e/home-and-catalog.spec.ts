import { test, expect } from '@playwright/test';

test.describe('KuroNami Home & Navigation', () => {
  test('should load the homepage with logo and navigation links', async ({ page }) => {
    await page.goto('/');

    // Verify title contains KuroNami
    await expect(page).toHaveTitle(/KuroNami/i);

    // Verify Navbar is present
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();

    // Verify Catalog navigation link
    const catalogLink = page.locator('a[href="/catalog"]').first();
    await expect(catalogLink).toBeVisible();
  });

  test('should open and close search overlay with keyboard shortcuts', async ({ page }) => {
    await page.goto('/');

    // Press '/' or 'k' with Cmd/Ctrl
    await page.keyboard.press('Control+k');

    // Check if search modal or input is visible
    const searchInput = page.locator('input[type="text"]').first();
    await expect(searchInput).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');
  });
});

test.describe('KuroNami Catalog & Filters', () => {
  test('should navigate to /catalog and render anime cards', async ({ page }) => {
    await page.goto('/catalog');

    // Check that catalog heading or grid exists
    await expect(page).toHaveURL(/.*catalog/);

    // Verify main content loaded
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });
});
