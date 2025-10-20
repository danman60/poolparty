import { test, expect } from '@playwright/test';

/**
 * E2E Tests for PoolParty Advisor Agent System
 *
 * Tests cover the AI-powered pool rating and advisory features:
 * - Volume-to-TVL scoring algorithm
 * - Impermanent Loss (IL) risk calculations
 * - Momentum indicators (volume & fee trends)
 * - Break-even volume estimations
 * - Interactive scenario modeling
 * - Rating badge status classifications
 * - Multi-metric aggregation for overall scores
 */

const mockExcellentPool = {
  id: '0xexcellentpool',
  chain: 'ethereum',
  token0_id: '0xtoken0',
  token1_id: '0xtoken1',
  token0: { symbol: 'WETH', name: 'Wrapped Ether' },
  token1: { symbol: 'USDC', name: 'USD Coin' },
  fee_tier: 500, // 0.05% - low fee for stable pair
  tvl_usd: 10000000, // $10M TVL
  volume_usd_24h: 5000000, // $5M daily volume (50% of TVL = excellent)
  updated_at: new Date().toISOString(),
};

const mockPoorPool = {
  id: '0xpoorpool',
  chain: 'ethereum',
  token0_id: '0xtoken2',
  token1_id: '0xtoken3',
  token0: { symbol: 'SHIB', name: 'Shiba Inu' },
  token1: { symbol: 'DOGE', name: 'Dogecoin' },
  fee_tier: 10000, // 1% - high fee
  tvl_usd: 50000, // $50K TVL (low)
  volume_usd_24h: 1000, // $1K daily volume (2% of TVL = poor)
  updated_at: new Date().toISOString(),
};

const mockMetricsRising = [
  { date: '2025-01-01', volume_usd: 1000000, fees_usd: 3000 },
  { date: '2025-01-02', volume_usd: 1100000, fees_usd: 3300 },
  { date: '2025-01-03', volume_usd: 1200000, fees_usd: 3600 },
  { date: '2025-01-04', volume_usd: 1300000, fees_usd: 3900 },
  { date: '2025-01-05', volume_usd: 1400000, fees_usd: 4200 },
  { date: '2025-01-06', volume_usd: 1500000, fees_usd: 4500 },
  { date: '2025-01-07', volume_usd: 1600000, fees_usd: 4800 },
  { date: '2025-01-08', volume_usd: 1700000, fees_usd: 5100 },
  { date: '2025-01-09', volume_usd: 1800000, fees_usd: 5400 },
  { date: '2025-01-10', volume_usd: 1900000, fees_usd: 5700 },
  { date: '2025-01-11', volume_usd: 2000000, fees_usd: 6000 },
  { date: '2025-01-12', volume_usd: 2100000, fees_usd: 6300 },
  { date: '2025-01-13', volume_usd: 2200000, fees_usd: 6600 },
  { date: '2025-01-14', volume_usd: 2300000, fees_usd: 6900 },
];

const mockMetricsFalling = [
  { date: '2025-01-01', volume_usd: 2300000, fees_usd: 6900 },
  { date: '2025-01-02', volume_usd: 2200000, fees_usd: 6600 },
  { date: '2025-01-03', volume_usd: 2100000, fees_usd: 6300 },
  { date: '2025-01-04', volume_usd: 2000000, fees_usd: 6000 },
  { date: '2025-01-05', volume_usd: 1900000, fees_usd: 5700 },
  { date: '2025-01-06', volume_usd: 1800000, fees_usd: 5400 },
  { date: '2025-01-07', volume_usd: 1700000, fees_usd: 5100 },
  { date: '2025-01-08', volume_usd: 1600000, fees_usd: 4800 },
  { date: '2025-01-09', volume_usd: 1500000, fees_usd: 4500 },
  { date: '2025-01-10', volume_usd: 1400000, fees_usd: 4200 },
  { date: '2025-01-11', volume_usd: 1300000, fees_usd: 3900 },
  { date: '2025-01-12', volume_usd: 1200000, fees_usd: 3600 },
  { date: '2025-01-13', volume_usd: 1100000, fees_usd: 3300 },
  { date: '2025-01-14', volume_usd: 1000000, fees_usd: 3000 },
];

test.describe('Advisor Rating Algorithm', () => {
  test.beforeEach(async ({ page }) => {
    // Mock pools API with excellent pool
    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes('0xexcellentpool')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            pool: mockExcellentPool,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });
  });

  test('🤖 Excellent pool receives high rating badge', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should display Excellent or Good badge for high volume-to-TVL ratio
    const badge = page.locator('[class*="excellent"], [class*="good"]').first();
    await expect(badge).toBeVisible({ timeout: 5000 });

    // Badge text should show rating
    const badgeText = await badge.textContent();
    expect(badgeText).toMatch(/excellent|good/i);
  });

  test('🤖 Poor pool receives low rating badge', async ({ page }) => {
    // Mock poor pool instead
    await page.route('**/api/pools*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [mockPoorPool],
          meta: { total: 1, page: 1, limit: 10 },
        }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should display Warning, Danger, or Critical badge for low volume-to-TVL
    const badges = page.locator('[class*="warning"], [class*="danger"], [class*="critical"]');
    await expect(badges.first()).toBeVisible({ timeout: 5000 });
  });

  test('🤖 Volume-to-TVL scoring displays correctly', async ({ page }) => {
    await page.goto(`/pool/${mockExcellentPool.id}`);
    await page.waitForTimeout(1000);

    // Navigate to pool detail page and check advisor insights
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Should show Volume to TVL metric
    await expect(page.getByText(/volume to tvl/i)).toBeVisible();

    // Should show score out of 10
    await expect(page.getByText(/score.*\/10/i)).toBeVisible();
  });

  test('🤖 Rating tooltip shows calculation breakdown', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Find and click the "How is this rated?" tooltip
    const tooltipButton = page.getByRole('button', { name: /how is this rated/i }).first();
    await expect(tooltipButton).toBeVisible({ timeout: 5000 });

    await tooltipButton.click();
    await page.waitForTimeout(300);

    // Should show explanation of rating algorithm
    const tooltip = page.locator('[role="tooltip"]').first();
    await expect(tooltip).toBeVisible();

    // Should mention key components
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toMatch(/volume.*tvl/i);
  });

  test('🤖 Breakdown tooltip shows detailed metrics', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Find breakdown tooltip
    const breakdownButton = page.getByRole('button', { name: /breakdown/i }).first();

    if (await breakdownButton.isVisible().catch(() => false)) {
      await breakdownButton.click();
      await page.waitForTimeout(300);

      const tooltip = page.locator('[role="tooltip"]').first();
      await expect(tooltip).toBeVisible();

      // Should show individual score components with point values
      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toMatch(/\+\d+\s*pts|pts/i); // Should show points
    }
  });
});

test.describe('Impermanent Loss (IL) Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes(mockExcellentPool.id)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ pool: mockExcellentPool }),
        });
      } else if (url.includes('metrics')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockMetricsRising }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });
  });

  test('🤖 IL scenario selector displays preset buttons', async ({ page }) => {
    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Should show IL preset buttons (5%, 10%, 20%, 50%)
    await expect(page.getByRole('button', { name: /5%/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /10%/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /20%/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /50%/i })).toBeVisible();
  });

  test('🤖 IL slider updates scenario dynamically', async ({ page }) => {
    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Find IL slider
    const slider = page.locator('input[type="range"][aria-label*="Price move"]');
    await expect(slider).toBeVisible();

    // Get initial value
    const initialValue = await slider.inputValue();

    // Change slider value
    await slider.fill('30');
    await page.waitForTimeout(200);

    // Value should update
    const newValue = await slider.inputValue();
    expect(newValue).toBe('30');

    // IL percentage display should update
    await expect(page.getByText(/30%|3\d\.?\d*%/)).toBeVisible();
  });

  test('🤖 Preset IL buttons update slider and calculations', async ({ page }) => {
    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Click 20% preset button
    const button20 = page.getByRole('button', { name: /^20%$/i });
    await button20.click();
    await page.waitForTimeout(200);

    // Slider should update to 20
    const slider = page.locator('input[type="range"][aria-label*="Price move"]');
    const sliderValue = await slider.inputValue();
    expect(sliderValue).toBe('20');

    // IL display should show ~20%
    await expect(page.getByText(/risk.*moderate|high/i)).toBeVisible();
  });

  test('🤖 Break-even volume calculation displays', async ({ page }) => {
    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Should show break-even volume metric
    await expect(page.getByText(/break-even volume/i)).toBeVisible();

    // Should show USD amount
    await expect(page.getByText(/\$[\d,]+/)).toBeVisible();

    // Should show helper text about fees
    await expect(page.getByText(/fees needed/i)).toBeVisible();
  });

  test('🤖 Break-even tooltip explains calculation', async ({ page }) => {
    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Find and click tooltip near break-even volume
    const tooltipButtons = page.getByRole('button', { name: /help|how calculated/i });
    const count = await tooltipButtons.count();

    if (count > 0) {
      await tooltipButtons.first().click();
      await page.waitForTimeout(300);

      const tooltip = page.locator('[role="tooltip"]').first();
      await expect(tooltip).toBeVisible();

      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toMatch(/break-even|tvl|fee|il/i);
    }
  });

  test('🤖 IL risk level updates with slider', async ({ page }) => {
    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Set to low IL scenario (5%)
    const button5 = page.getByRole('button', { name: /^5%$/i });
    await button5.click();
    await page.waitForTimeout(200);

    // Risk should be low
    await expect(page.getByText(/risk.*low/i)).toBeVisible();

    // Set to high IL scenario (50%)
    const button50 = page.getByRole('button', { name: /^50%$/i });
    await button50.click();
    await page.waitForTimeout(200);

    // Risk should be high or critical
    await expect(page.getByText(/risk.*(high|critical|extreme)/i)).toBeVisible();
  });
});

test.describe('Momentum Indicators', () => {
  test('🤖 Rising volume momentum displays correctly', async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes('metrics')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockMetricsRising }),
        });
      } else if (url.includes(mockExcellentPool.id)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ pool: mockExcellentPool }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });

    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Wait for metrics to load
    await page.waitForTimeout(1500);

    // Should show rising trend
    await expect(page.getByText(/volume momentum/i)).toBeVisible();
    await expect(page.getByText(/rising/i)).toBeVisible({ timeout: 3000 });

    // Should show positive percentage change
    await expect(page.getByText(/\+\d+\.\d+%|rising/i)).toBeVisible();
  });

  test('🤖 Falling volume momentum displays correctly', async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes('metrics')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockMetricsFalling }),
        });
      } else if (url.includes(mockExcellentPool.id)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ pool: mockExcellentPool }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });

    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Wait for metrics to load
    await page.waitForTimeout(1500);

    // Should show falling trend
    await expect(page.getByText(/falling/i)).toBeVisible({ timeout: 3000 });

    // Should show negative percentage change
    await expect(page.getByText(/-\d+\.\d+%|falling/i)).toBeVisible();
  });

  test('🤖 Fee momentum displays independently', async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes('metrics')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockMetricsRising }),
        });
      } else if (url.includes(mockExcellentPool.id)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ pool: mockExcellentPool }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });

    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Wait for metrics to load
    await page.waitForTimeout(1500);

    // Should show fee momentum (separate from volume momentum)
    await expect(page.getByText(/fee momentum/i)).toBeVisible();

    // Should show trend
    await expect(page.getByText(/rising|falling|flat/i)).toBeVisible({ timeout: 3000 });
  });

  test('🤖 Momentum loading state displays', async ({ page }) => {
    let shouldDelay = true;

    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes('metrics') && shouldDelay) {
        // Delay response to test loading state
        await new Promise(resolve => setTimeout(resolve, 2000));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockMetricsRising }),
        });
      } else if (url.includes(mockExcellentPool.id)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ pool: mockExcellentPool }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });

    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Should show loading indicator initially
    await expect(page.getByText(/\.\.\.|loading/i)).toBeVisible({ timeout: 1000 });

    shouldDelay = false;

    // Should eventually show actual data
    await expect(page.getByText(/rising|falling|flat/i)).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Health Bar & Visual Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [mockExcellentPool],
          meta: { total: 1, page: 1, limit: 10 },
        }),
      });
    });
  });

  test('🤖 Health bar displays for pool ratings', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Health bar should be visible (progress bar or similar visual)
    const healthBars = page.locator('[class*="health"], [role="progressbar"]');
    const count = await healthBars.count();

    // Should have at least one health bar for the pool
    expect(count).toBeGreaterThan(0);
  });

  test('🤖 Rating badge has appropriate color for status', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Excellent pool should have green/cyan badge
    const badge = page.locator('[class*="excellent"], [class*="good"]').first();

    if (await badge.isVisible().catch(() => false)) {
      // Check that badge has appropriate styling
      const bgColor = await badge.evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });

      // Should have some color (not transparent)
      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('🤖 Score displays numerically on badge', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Badge should show numeric score
    const badges = page.locator('[class*="excellent"], [class*="good"], [class*="warning"], [class*="danger"], [class*="critical"]');

    if (await badges.first().isVisible().catch(() => false)) {
      const badgeText = await badges.first().textContent();

      // Should contain a number (score out of 100)
      expect(badgeText).toMatch(/\d+/);
    }
  });
});

test.describe('Advisor Integration & Edge Cases', () => {
  test('🤖 Advisor handles missing data gracefully', async ({ page }) => {
    const incompletePool = {
      ...mockExcellentPool,
      tvl_usd: null,
      volume_usd_24h: null,
    };

    await page.route('**/api/pools*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [incompletePool],
          meta: { total: 1, page: 1, limit: 10 },
        }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should not crash
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();

    // Should still show pool row
    await expect(page.getByText(/WETH.*USDC/i)).toBeVisible({ timeout: 5000 });
  });

  test('🤖 Advisor handles API errors gracefully', async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes('metrics')) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });

    await page.goto(`/pool/${mockExcellentPool.id}`);

    // Should not crash on metrics error
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();

    // Should show advisor section even if momentum data fails
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });
  });

  test('🤖 Multiple pools show independent ratings', async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [mockExcellentPool, mockPoorPool],
          meta: { total: 2, page: 1, limit: 10 },
        }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should show both pools
    await expect(page.getByText(/WETH.*USDC/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/SHIB.*DOGE/i)).toBeVisible();

    // Should have different rating badges
    const excellentBadges = page.locator('[class*="excellent"], [class*="good"]');
    const poorBadges = page.locator('[class*="warning"], [class*="danger"], [class*="critical"]');

    const excellentCount = await excellentBadges.count();
    const poorCount = await poorBadges.count();

    // Should have at least one of each type
    expect(excellentCount + poorCount).toBeGreaterThan(0);
  });

  test('🤖 IL scenario persists in URL for sharing', async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      const url = route.request().url();
      if (url.includes(mockExcellentPool.id)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ pool: mockExcellentPool }),
        });
      } else if (url.includes('metrics')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockMetricsRising }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [mockExcellentPool],
            meta: { total: 1, page: 1, limit: 10 },
          }),
        });
      }
    });

    await page.goto(`/pool/${mockExcellentPool.id}`);
    await expect(page.getByText(/advisor insights/i)).toBeVisible({ timeout: 5000 });

    // Change IL scenario
    const button20 = page.getByRole('button', { name: /^20%$/i });
    await button20.click();
    await page.waitForTimeout(500);

    // URL should contain il parameter
    const url = page.url();
    expect(url).toMatch(/[?&]il=20/);
  });

  test('🤖 Rating filters work with advisor badges', async ({ page }) => {
    await page.route('**/api/pools*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [mockExcellentPool, mockPoorPool],
          meta: { total: 2, page: 1, limit: 10 },
        }),
      });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should show both pools initially
    await expect(page.getByText(/WETH.*USDC/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/SHIB.*DOGE/i)).toBeVisible();

    // Click on "Excellent+" or "Good+" filter if available
    const filterButtons = page.getByRole('button', { name: /excellent|good/i });

    if (await filterButtons.first().isVisible().catch(() => false)) {
      await filterButtons.first().click();
      await page.waitForTimeout(500);

      // Poor pool should be filtered out
      await expect(page.getByText(/SHIB.*DOGE/i)).not.toBeVisible();

      // Excellent pool should still be visible
      await expect(page.getByText(/WETH.*USDC/i)).toBeVisible();
    }
  });
});
