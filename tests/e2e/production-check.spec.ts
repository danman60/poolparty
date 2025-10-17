import { test, expect } from '@playwright/test';

const BASE_URL = 'https://poolparty-omega.vercel.app';

test.describe('Production Page Accessibility', () => {
  test('home page / dashboard loads', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  test('/wallet page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/wallet`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { name: /Wallet/i })).toBeVisible({ timeout: 10000 });
  });

  test('/status page loads', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/status`);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.getByRole('heading', { name: /Status/i })).toBeVisible({ timeout: 10000 });
  });

  test('pool detail page loads with real pool', async ({ page }) => {
    // First get a real pool ID from the dashboard
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const poolLink = page.locator('a[href^="/pool/"]').first();
    const href = await poolLink.getAttribute('href');

    if (href) {
      const response = await page.goto(`${BASE_URL}${href}`);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByRole('heading', { name: /Pool Detail/i })).toBeVisible({ timeout: 10000 });
    } else {
      test.skip();
    }
  });

  test('check all navigation links are accessible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check main navigation
    const navLinks = [
      { name: /Dashboard/i, href: '/' },
      { name: /Wallet/i, href: '/wallet' },
      { name: /Status/i, href: '/status' },
    ];

    for (const link of navLinks) {
      const navLink = page.getByRole('link', { name: link.name });
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(new RegExp(link.href));
        await page.goto(BASE_URL); // Go back to home
      }
    }
  });
});
