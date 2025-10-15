# PoolParty Testing Guide

## Overview

PoolParty uses a multi-layered testing strategy combining unit tests, integration tests, and end-to-end tests.

**Testing Stack:**
- **Vitest** - Unit and integration tests
- **Playwright** - E2E browser tests
- **React Testing Library** - Component testing

---

## Test Structure

```
PoolParty/
├── src/
│   ├── components/
│   │   └── PoolsTable.test.tsx    # Component unit test
│   └── lib/
│       └── ingest/
│           └── uniswap.test.ts    # Module unit test
├── tests/
│   └── e2e/
│       ├── smoke.spec.ts          # Critical path tests
│       ├── dashboard.spec.ts      # Homepage tests
│       ├── pool.spec.ts           # Pool detail tests
│       └── status.spec.ts         # Health page tests
├── playwright.config.ts           # E2E test config
└── vitest.config.ts              # Unit test config
```

---

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### E2E Tests Only
```bash
npm run test:e2e
```

### E2E in UI Mode (Debugging)
```bash
npm run test:e2e:ui
```

### Watch Mode (Development)
```bash
npm run test:watch
```

---

## Unit Testing

### Component Tests

**Pattern:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PoolsTable from './PoolsTable'

describe('PoolsTable', () => {
  it('renders pool data correctly', () => {
    render(<PoolsTable />)
    expect(screen.getByText('Pool')).toBeInTheDocument()
  })

  it('sorts by TVL when header clicked', () => {
    render(<PoolsTable />)
    const header = screen.getByText('TVL')
    fireEvent.click(header)
    // Assert sorted order
  })
})
```

**Tested Components:**
- ✅ `PoolsTable.test.tsx` - Main pool listing

**TODO Components:**
- ⚠️ WalletButton
- ⚠️ APRCalculator
- ⚠️ MintPosition
- ⚠️ CollectFeesButton

---

### Module Tests

**Pattern:**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { ingestUniswapData } from './uniswap'

describe('Uniswap Ingestion', () => {
  it('fetches top pools from subgraph', async () => {
    const result = await ingestUniswapData({ limit: 10 })
    expect(result.pools).toHaveLength(10)
  })

  it('handles API errors gracefully', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
    const result = await ingestUniswapData({ limit: 10 })
    expect(result.error).toBeDefined()
  })
})
```

**Tested Modules:**
- ✅ `ingest/uniswap.test.ts` - Data ingestion logic

**TODO Modules:**
- ⚠️ APR calculation utilities
- ⚠️ Token formatting helpers
- ⚠️ Tick math functions

---

### Mocking Strategies

**Mock fetch:**
```typescript
import { vi } from 'vitest'

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ pools: [] })
  })
)
```

**Mock Supabase:**
```typescript
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        data: [],
        error: null
      }))
    }))
  }
}))
```

**Mock wagmi:**
```typescript
vi.mock('wagmi', () => ({
  useAccount: () => ({
    address: '0x1234567890abcdef',
    isConnected: true
  }),
  useConnect: () => ({ connect: vi.fn() }),
  useDisconnect: () => ({ disconnect: vi.fn() })
}))
```

---

## E2E Testing (Playwright)

### Smoke Tests (`tests/e2e/smoke.spec.ts`)

Critical path verification.

**Tests:**
1. Homepage loads successfully
2. Can view pool details
3. Wallet button exists
4. Status page accessible

**Example:**
```typescript
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('PoolParty')
})

test('can navigate to pool detail', async ({ page }) => {
  await page.goto('/')
  await page.click('table tbody tr:first-child')
  await expect(page.url()).toContain('/pool/')
})
```

---

### Dashboard Tests (`tests/e2e/dashboard.spec.ts`)

Homepage functionality.

**Tests:**
1. Pools table renders
2. Sorting works (TVL, Volume, APR)
3. Pool links work
4. Freshness indicator shows
5. Pagination works (if implemented)

**Example:**
```typescript
test('sorting by TVL works', async ({ page }) => {
  await page.goto('/')
  await page.click('th:has-text("TVL")')

  const firstRow = page.locator('table tbody tr:first-child')
  const tvl = await firstRow.locator('td:nth-child(3)').textContent()

  await page.click('th:has-text("TVL")')
  const firstRowAfter = page.locator('table tbody tr:first-child')
  const tvlAfter = await firstRowAfter.locator('td:nth-child(3)').textContent()

  expect(tvl).not.toBe(tvlAfter)
})
```

---

### Pool Detail Tests (`tests/e2e/pool.spec.ts`)

Pool page functionality.

**Tests:**
1. Pool data displays correctly
2. Charts render
3. APR calculator works
4. Mint position form exists
5. Tick controls functional

**Example:**
```typescript
test('pool metrics display', async ({ page }) => {
  await page.goto('/pool/0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8')

  await expect(page.locator('text=TVL')).toBeVisible()
  await expect(page.locator('text=Volume')).toBeVisible()
  await expect(page.locator('text=APR')).toBeVisible()
})

test('charts render', async ({ page }) => {
  await page.goto('/pool/0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8')

  // Wait for chart SVG elements
  await expect(page.locator('svg.recharts-surface')).toBeVisible()
})
```

---

### Status Page Tests (`tests/e2e/status.spec.ts`)

Health monitoring page.

**Tests:**
1. All health checks display
2. Environment config shows
3. Data freshness indicator works
4. RPC status visible

**Example:**
```typescript
test('health checks visible', async ({ page }) => {
  await page.goto('/status')

  await expect(page.locator('text=RPC Status')).toBeVisible()
  await expect(page.locator('text=Subgraph Status')).toBeVisible()
  await expect(page.locator('text=Database Status')).toBeVisible()
})
```

---

### Playwright Configuration

**File:** `playwright.config.ts`

**Key Settings:**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } }
  ]
})
```

**Environment Variables:**
- `PLAYWRIGHT_BASE_URL` - Test target URL
- `CI` - Enables CI-specific settings

---

## Test Data Strategy

### Mock Pool Data

**Pattern:**
```typescript
const mockPool = {
  id: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
  token0: {
    symbol: 'USDC',
    name: 'USD Coin'
  },
  token1: {
    symbol: 'WETH',
    name: 'Wrapped Ether'
  },
  feeTier: '3000',
  totalValueLockedUSD: '100000000',
  volumeUSD: '50000000',
  feesUSD: '25000'
}
```

### Test Database

**Local Testing:**
- Uses same Supabase instance
- Separate test schema (if needed)
- Seed data via migrations

**CI Testing:**
- Mocked Supabase responses
- No real database connections
- Fixtures for common queries

---

## Wallet Testing

### MetaMask Testing (Manual)

**Checklist:**
- [ ] Connect wallet popup appears
- [ ] Address displays correctly
- [ ] Network switching works
- [ ] Disconnect works
- [ ] Reconnect persists session

### Transaction Testing (Testnet)

**Sepolia Testing:**
1. Connect to Sepolia testnet
2. Approve test tokens
3. Create LP position
4. Collect fees
5. Close position

**Manual Test Script:**
```bash
# 1. Switch to Sepolia
# 2. Get test ETH from faucet
# 3. Get test USDC from faucet
# 4. Navigate to /pool/[sepolia-pool-id]
# 5. Click "Mint Position"
# 6. Approve tokens
# 7. Submit mint transaction
# 8. Wait for confirmation
# 9. Navigate to /wallet
# 10. Click "Collect Fees"
# 11. Confirm transaction
```

---

## Visual Regression Testing

### Snapshot Testing (Planned)

**Pattern:**
```typescript
import { test, expect } from '@playwright/test'

test('homepage matches snapshot', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveScreenshot('homepage.png')
})
```

**TODO:**
- Set up baseline snapshots
- Configure diff threshold
- Add to CI pipeline

---

## Performance Testing

### Lighthouse (Planned)

**Metrics:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

**Command:**
```bash
lighthouse https://poolparty.vercel.app --output=json --output-path=./lighthouse-report.json
```

### Load Testing (Planned)

**Tool:** Artillery or k6

**Test Scenarios:**
- 100 concurrent users viewing dashboard
- 50 users navigating to pool details
- API endpoint response times

---

## Test Coverage

### Current Coverage

| Type | Coverage | Target |
|------|----------|--------|
| Unit Tests | ~20% | 80% |
| Component Tests | ~5% | 60% |
| E2E Tests | ~40% | 80% |
| Integration | ~10% | 50% |

### Priority Areas

**High Priority (Core Functionality):**
- ✅ Pool data display
- ✅ API endpoints
- ⚠️ Wallet connection
- ⚠️ Transaction submission
- ⚠️ Fee collection

**Medium Priority (Features):**
- ⚠️ APR calculator
- ⚠️ Charts rendering
- ⚠️ Sorting/filtering
- ⚠️ Position management

**Low Priority (Nice-to-have):**
- ⚠️ Edge cases
- ⚠️ Error states
- ⚠️ Loading states

---

## CI/CD Integration

### GitHub Actions (Planned)

**Workflow:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Testing Best Practices

### DO:
- ✅ Test user flows, not implementation
- ✅ Use semantic queries (`getByRole`, `getByText`)
- ✅ Mock external dependencies
- ✅ Keep tests isolated (no shared state)
- ✅ Use meaningful test names
- ✅ Test error states
- ✅ Test loading states

### DON'T:
- ❌ Test internal component state
- ❌ Rely on class names or IDs
- ❌ Use brittle selectors
- ❌ Share state between tests
- ❌ Test implementation details
- ❌ Skip CI in commits

---

## Test Debugging

### Playwright Debug Mode

```bash
PWDEBUG=1 npm run test:e2e
```

Opens browser in debug mode with step-through controls.

### Playwright Trace Viewer

```bash
npx playwright show-trace trace.zip
```

Views recorded trace for failed tests.

### Vitest UI Mode

```bash
npm run test:unit -- --ui
```

Interactive test runner with hot reload.

---

## Manual Testing Checklist

### Pre-Release Checklist

**Functionality:**
- [ ] Homepage loads and displays pools
- [ ] Pool detail page shows correct data
- [ ] Wallet connects successfully
- [ ] Charts render without errors
- [ ] Status page shows health metrics
- [ ] Toast notifications work
- [ ] Error states display correctly
- [ ] Loading states show during data fetch

**Cross-Browser:**
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Responsive:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Performance:**
- [ ] Page load < 3 seconds
- [ ] Interaction response < 100ms
- [ ] No console errors

---

## Future Testing Enhancements

### v0.2 - Transaction Testing
- Integration tests for wallet operations
- Testnet transaction flows
- Gas estimation validation
- Approval flow testing

### v0.3 - Multi-Chain Testing
- Cross-chain data consistency
- Network switching tests
- Chain-specific contract tests

### v0.4 - Advanced Testing
- Visual regression tests
- Performance benchmarking
- Load testing
- Accessibility audits

---

## Test Maintenance

### When to Update Tests

**After Feature Changes:**
- Update affected unit tests
- Update E2E tests for new flows
- Add new test cases for edge cases

**After Bug Fixes:**
- Add regression test for bug
- Verify fix doesn't break existing tests

**Quarterly:**
- Review test coverage
- Remove obsolete tests
- Update test data
- Refactor flaky tests

---

## Test Documentation

### Writing Test Documentation

**Pattern:**
```typescript
/**
 * Pool Detail Page Tests
 *
 * Verifies:
 * - Pool data displays correctly
 * - Charts render with proper data
 * - User can interact with APR calculator
 * - Mint position form is functional
 *
 * Assumptions:
 * - Pool exists in database
 * - Subgraph is synced
 *
 * @see FEATURES.md for feature requirements
 */
describe('Pool Detail Page', () => {
  // ...
})
```

---

## Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)

### Tools
- [Playwright Inspector](https://playwright.dev/docs/inspector)
- [Vitest UI](https://vitest.dev/guide/ui.html)
- [Testing Library Playground](https://testing-playground.com/)

---

## Getting Help

### Test Failures

1. **Check logs** - Read error messages carefully
2. **Run locally** - Reproduce failure outside CI
3. **Use debug mode** - Step through test execution
4. **Check screenshots** - Review failure screenshots
5. **Verify data** - Ensure test data is correct

### Flaky Tests

**Common Causes:**
- Race conditions (missing `await`)
- Network timeouts
- Stale data
- Browser timing issues

**Solutions:**
- Add proper waits (`waitForSelector`)
- Increase timeouts
- Use retry logic
- Isolate test data

---

## Summary

PoolParty's testing strategy prioritizes:
1. **E2E coverage** of critical user flows
2. **Unit testing** of complex logic
3. **Component testing** of interactive elements
4. **Manual testing** of wallet operations

**Current Status:** ~30% overall coverage
**Target:** 80% coverage by v1.0
