import { test, expect } from '@playwright/test'

test('dashboard shows Rating column and rating filter updates URL', async ({ page }) => {
  await page.route('**/api/pools**', async (route) => {
    const url = new URL(route.request().url())
    // serve basic data regardless of params
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: [
          { id: '0xpoolA', chain: 'ethereum', token0_id: '0x0', token1_id: '0x1', fee_tier: 3000, tvl_usd: 1_000_000, volume_usd_24h: 600_000, updated_at: new Date().toISOString() },
          { id: '0xpoolB', chain: 'ethereum', token0_id: '0x2', token1_id: '0x3', fee_tier: 500, tvl_usd: 2_000_000, volume_usd_24h: 50_000,  updated_at: new Date().toISOString() },
        ],
        meta: { total: 2, page: Number(url.searchParams.get('page') || '1'), limit: Number(url.searchParams.get('limit') || '10') }
      })
    })
  })

  await page.goto('/')

  // Header exists
  await expect(page.getByRole('columnheader', { name: /Rating/i })).toBeVisible()

  // Click Rating header to sort (desc by default)
  await page.getByRole('button', { name: /Rating/i }).click()

  // Highest-rated pool (0xpoolA) should appear first
  const firstRowLink = page.locator('tbody tr').first().locator('a').first()
  await expect(firstRowLink).toHaveAttribute('href', '/pool/0xpoolA')

  // Change rating filter and verify URL updates
  await page.getByLabel(/Min rating/i).selectOption('excellent')
  await expect.poll(() => page.url()).toContain('rating=excellent')
})
