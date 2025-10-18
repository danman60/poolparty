import { test, expect } from '@playwright/test'

test('pool page shows Advisor insights and rating', async ({ page }) => {
  const poolId = '0xpooladvisor'

  await page.route('**/api/pools/*/metrics**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: Array.from({ length: 14 }).map((_, i) => ({
        date: `2025-01-${String(i + 1).padStart(2, '0')}`,
        tvlUSD: 1000000 + i * 1000,
        volumeUSD: i < 7 ? 100000 : 150000, // rising momentum last 7d
        feesUSD: i < 7 ? 300 : 450,
      })) }),
    })
  })

  await page.goto(`/pool/${poolId}`)

  // Advisor Insights card
  await expect(page.getByText(/Advisor Insights/i)).toBeVisible()
  await expect(page.getByText(/Volume to TVL/i)).toBeVisible()
  await expect(page.getByText(/IL @ 10% move/i)).toBeVisible()
  await expect(page.getByText(/Break-even volume/i)).toBeVisible()

  // Pool Rating section present
  await expect(page.getByText(/Pool Rating/i)).toBeVisible()
})

