import { test, expect } from '@playwright/test';

const PRODUCTION_URL = 'https://poolparty-omega.vercel.app';

test.describe('Production UI Verification', () => {
  test('homepage loads and shows pools', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Wait for pools to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Should show pool data
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);

    console.log(`✓ Found ${rows} pools on homepage`);
  });

  test('pool detail page shows Join Pool UI when FEATURE_MINT is enabled', async ({ page }) => {
    // Go to homepage first
    await page.goto(PRODUCTION_URL);

    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click first pool
    const firstPoolLink = page.locator('table tbody tr a').first();
    await firstPoolLink.click();

    // Wait for pool detail page
    await page.waitForLoadState('networkidle');

    // Check if "Join This Pool" section exists
    const joinPoolHeading = page.getByText(/Join This Pool/i);
    const hasJoinPoolUI = await joinPoolHeading.count() > 0;

    if (hasJoinPoolUI) {
      console.log('✓ Join Pool UI is visible');

      // Verify it has the mint position form
      await expect(page.getByText(/Amount token0/i)).toBeVisible();
      await expect(page.getByText(/Amount token1/i)).toBeVisible();
      await expect(page.getByText(/Tick lower/i)).toBeVisible();
      await expect(page.getByText(/Tick upper/i)).toBeVisible();
    } else {
      console.log('⚠ Join Pool UI is NOT visible - check NEXT_PUBLIC_FEATURE_MINT in Vercel');
      console.log('  Set NEXT_PUBLIC_FEATURE_MINT=true in Vercel environment variables');
    }

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/pool-detail.png', fullPage: true });
  });

  test('wallet page loads without errors', async ({ page }) => {
    // Listen for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(`${PRODUCTION_URL}/wallet`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should show wallet page
    await expect(page.getByText(/Your LP Positions/i)).toBeVisible();

    // Check for GraphQL errors in UI
    const errorText = await page.textContent('body');
    const hasGraphQLError = errorText?.includes('Type `Position` has no field');

    if (hasGraphQLError) {
      console.log('✗ GraphQL errors detected in UI');
      console.log('Errors:', errorText);
      throw new Error('GraphQL schema errors found on wallet page');
    }

    // Check console for errors
    const relevantErrors = errors.filter(e =>
      !e.includes('Clerk') &&
      !e.includes('favicon') &&
      !e.includes('hydration')
    );

    if (relevantErrors.length > 0) {
      console.log('Console errors:', relevantErrors);
    }

    console.log('✓ Wallet page loads without GraphQL errors');

    // Take screenshot
    await page.screenshot({ path: 'test-results/wallet-page.png', fullPage: true });
  });

  test('connect wallet button exists', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Should have a connect wallet button in header
    const connectButton = page.getByRole('button', { name: /connect/i });
    await expect(connectButton).toBeVisible();

    console.log('✓ Connect wallet button is visible');
  });

  test('pool detail shows APR calculator', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click first pool
    await page.locator('table tbody tr a').first().click();
    await page.waitForLoadState('networkidle');

    // Should show APR Calculator section
    await expect(page.getByText(/APR Calculator/i)).toBeVisible();

    console.log('✓ APR Calculator is visible');
  });
});
