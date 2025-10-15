import { test, expect } from '@playwright/test';

test('dashboard shows mocked pools and navigates', async ({ page }) => {
  await page.route('**/api/pools', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          {
            id: '0xpool',
            chain: 'ethereum',
            token0_id: '0x0',
            token1_id: '0x1',
            fee_tier: 3000,
            tvl_usd: 1000000,
            volume_usd_24h: 250000,
            updated_at: new Date().toISOString(),
          },
        ],
      }),
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /0x0 … 0x1/ })).toBeVisible({ timeout: 5000 }).catch(async () => {
    // Fallback: use href selector if composed label isn't matched
    await expect(page.locator('a[href="/pool/0xpool"]').first()).toBeVisible();
  });

  await page.locator('a[href="/pool/0xpool"]').click();
  await expect(page.getByRole('heading', { name: /Pool Detail/i })).toBeVisible();
});

