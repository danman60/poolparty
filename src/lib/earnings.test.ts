import { describe, it, expect, vi } from 'vitest'
import { estimateDailyEarnings } from './earnings'

describe('earnings utils', () => {
  it('returns null with no timestamps or non-positive fees', () => {
    expect(estimateDailyEarnings(0, [])).toBeNull()
    expect(estimateDailyEarnings(-10, [Date.now() - 1000])).toBeNull()
    expect(estimateDailyEarnings(100, [])).toBeNull()
  })

  it('estimates per day from earliest timestamp', () => {
    const now = Date.now()
    vi.setSystemTime(now)
    const twoDaysAgo = now - 2 * 86_400_000
    const oneDayAgo = now - 1 * 86_400_000
    const perDay = estimateDailyEarnings(300, [oneDayAgo, twoDaysAgo])
    // ~150/day when spread over 2 days
    expect(perDay).not.toBeNull()
    expect(Math.abs((perDay as number) - 150)).toBeLessThan(0.0001)
  })
})

