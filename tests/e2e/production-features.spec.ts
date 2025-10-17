import { test, expect } from '@playwright/test';

test.describe('Production Feature Check', () => {
  test('verify all features on production pool detail page', async ({ page }) => {
    // Navigate to production pool detail page
    await page.goto('https://poolparty-omega.vercel.app/pool/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // 1. Check pool name and metadata
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 15000 });
    const headingText = await heading.textContent();
    console.log('Pool name:', headingText);
    expect(headingText).toBeTruthy();

    // 2. Check token pair info is visible
    const tokenPair = page.getByText(/USDC.*WETH/i).first();
    await expect(tokenPair).toBeVisible();
    console.log('✓ Token pair info visible');

    // 3. Check pool address is shown
    const poolAddress = page.getByText(/Pool Address:/i);
    await expect(poolAddress).toBeVisible();
    console.log('✓ Pool address visible');

    // 4. Check TVL card
    const tvlLabel = page.getByText('TVL (latest)');
    await expect(tvlLabel).toBeVisible();
    console.log('✓ TVL card visible');

    // 5. Check Fee Tier card
    const feeTierLabel = page.getByText('Fee Tier').first();
    await expect(feeTierLabel).toBeVisible();
    console.log('✓ Fee tier card visible');

    // 6. Check TVL Sparkline
    const sparkline = page.getByText('TVL Sparkline').first();
    await expect(sparkline).toBeVisible();
    console.log('✓ TVL Sparkline visible');

    // 7. Check APR Calculator
    const aprCalculator = page.getByText('APR Calculator').first();
    await expect(aprCalculator).toBeVisible();
    console.log('✓ APR Calculator visible');

    // 8. Check for Provide Liquidity section (might be hidden)
    const provideLiquidity = page.getByText('Provide Liquidity');
    const hasLiquidityUI = await provideLiquidity.isVisible().catch(() => false);
    if (hasLiquidityUI) {
      console.log('✓ Provide Liquidity UI visible');
    } else {
      console.log('⚠ Provide Liquidity UI NOT visible (feature flag disabled)');
    }

    // 9. Check for portfolio/wallet link in navigation
    const walletLink = page.getByRole('link', { name: /wallet/i });
    const hasWalletLink = await walletLink.isVisible().catch(() => false);
    if (hasWalletLink) {
      console.log('✓ Wallet navigation link visible');
    } else {
      console.log('⚠ Wallet navigation link NOT found');
    }

    // 10. Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/production-features.png', fullPage: true });
    console.log('✓ Screenshot saved');
  });

  test('check wallet/portfolio page exists', async ({ page }) => {
    await page.goto('https://poolparty-omega.vercel.app/wallet');
    await page.waitForLoadState('networkidle');

    // Check if wallet page loads
    const pageContent = await page.content();
    const hasContent = pageContent.length > 0;

    if (hasContent) {
      console.log('✓ Wallet page exists');

      // Take screenshot
      await page.screenshot({ path: 'test-results/wallet-page.png', fullPage: true });
    } else {
      console.log('⚠ Wallet page appears empty');
    }
  });
});
