import { test, expect } from '@playwright/test';

test.describe('Pool Detail Page', () => {
  test('can navigate to pool detail page', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3003');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot of dashboard
    await page.screenshot({ path: 'test-results/dashboard.png' });

    // Look for any pool link
    const poolLink = page.locator('a[href^="/pool/"]').first();
    await expect(poolLink).toBeVisible({ timeout: 10000 });

    // Click the pool link
    await poolLink.click();

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Take screenshot of pool detail page
    await page.screenshot({ path: 'test-results/pool-detail.png' });

    // Check if page loaded (should see pool name or "Pool Detail")
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });

    const headingText = await heading.textContent();
    console.log('Pool detail heading:', headingText);

    // Should see some content, not blank
    expect(headingText).toBeTruthy();
  });

  test('can navigate back from pool detail', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');

    // Click first pool
    const poolLink = page.locator('a[href^="/pool/"]').first();
    await poolLink.click();
    await page.waitForLoadState('networkidle');

    // Try to go back
    await page.goBack();
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/back-navigation.png' });

    // Should be back on dashboard
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  test('production pool detail loads', async ({ page }) => {
    // Test the specific production URL
    await page.goto('https://poolparty-omega.vercel.app/pool/0x277667eb3e34f134adf870be9550e9f323d0dc24');

    // Wait for load
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'test-results/production-pool.png' });

    // Should see a heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 15000 });

    const headingText = await heading.textContent();
    console.log('Production pool heading:', headingText);

    // Should not be blank
    expect(headingText).toBeTruthy();
    expect(headingText?.length).toBeGreaterThan(0);
  });
});
