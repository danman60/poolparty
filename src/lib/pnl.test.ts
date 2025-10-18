import { describe, it, expect } from 'vitest'
import { positionFeesUsd } from './pnl'

describe('pnl utils', () => {
  it('positionFeesUsd sums and prices fees', () => {
    const p = {
      token0: { id: '0xabc', decimals: '6' },
      token1: { id: '0xdef', decimals: '18' },
      collectedFeesToken0: '1000000', // 1.0
      collectedFeesToken1: '0',
      uncollectedFeesToken0: '0',
      uncollectedFeesToken1: '1000000000000000000', // 1.0
    } as any
    const prices = { '0xabc': 2, '0xdef': 3 } as Record<string, number>
    const usd = positionFeesUsd(p, prices)
    expect(Math.abs(usd - 5)).toBeLessThan(1e-9)
  })
})

