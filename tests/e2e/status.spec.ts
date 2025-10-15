import { test, expect } from '@playwright/test';

test('status page displays environment warning banner', async ({ page }) => {
  await page.route('**/api/health/env', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, env: { hasSupabase: false, hasRpc: false, hasIngestSecret: false } }),
    });
  });

  await page.goto('/status');
  await expect(page.getByText(/Configuration issue detected|Dev config/i)).toBeVisible();
});

