import { test, expect } from '@playwright/test';

test.describe('Smoke @smoke', () => {
  test('loads dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('wallet page shows connect', async ({ page }) => {
    await page.goto('/wallet');
    await expect(page.getByRole('button', { name: /Connect Wallet/i })).toBeVisible();
  });
});

