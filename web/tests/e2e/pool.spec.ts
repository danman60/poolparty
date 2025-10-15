import { test, expect } from '@playwright/test';

test('pool detail renders with mocked API', async ({ page }) => {
  await page.route('**/api/pools/0xpool', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        pool: {
          id: '0xpool',
          chain: 'ethereum',
          token0_id: '0x0',
          token1_id: '0x1',
          fee_tier: 3000,
          tvl_usd: 1000000,
          volume_usd_24h: 250000,
          updated_at: new Date().toISOString(),
        },
        snapshots: Array.from({ length: 10 }).map((_, i) => ({
          pool_id: '0xpool',
          ts: new Date(Date.now() - (10 - i) * 3600_000).toISOString(),
          tvl_usd: 900000 + i * 5000,
          volume_usd_24h: null,
          fee_apr_annual: null,
        })),
      }),
    });
  });

  await page.goto('/pool/0xpool');
  await expect(page.getByRole('heading', { name: /Pool Detail/i })).toBeVisible();
  await expect(page.getByText(/TVL Sparkline/i)).toBeVisible();
});

