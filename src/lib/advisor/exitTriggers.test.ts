import { describe, it, expect } from 'vitest'
import { detectStablecoinDepeg, detectVolatilitySpike, outOfRangeDuration, pnlVsHodlStopLoss } from './exitTriggers'

describe('exitTriggers', () => {
  it('detects stablecoin depeg levels', () => {
    expect(detectStablecoinDepeg([{ time: 1, price: 1.004 }]).level).toBe(0)
    expect(detectStablecoinDepeg([{ time: 1, price: 0.994 }]).level).toBe(1) // ~0.6%
    expect(detectStablecoinDepeg([{ time: 1, price: 1.015 }]).level).toBe(2) // ~1.5%
    expect(detectStablecoinDepeg([{ time: 1, price: 0.970 }]).level).toBe(3) // ~3.0%
  })
  it('detects volatility spikes using sigma rule', () => {
    const returns = Array(30).fill(0.2)
    returns[returns.length - 1] = 3.0
    expect(detectVolatilitySpike(returns, 24, 3).spike).toBe(true)
  })
  it('computes out-of-range duration', () => {
    const pos = { lower: 95, upper: 105 }
    const t0 = 0
    const t1 = 30 * 60 * 1000 // 30 minutes
    const t2 = 45 * 60 * 1000 // 45 minutes
    const series = [
      { time: t0, price: 100 },
      { time: t1, price: 110 },
      { time: t2, price: 109 },
    ]
    const res = outOfRangeDuration(pos, series, 1)
    expect(res.hours).toBeGreaterThan(0)
  })
  it('pnl stop-loss triggers below threshold', () => {
    const res = pnlVsHodlStopLoss([-0.05, -0.08, -0.12], -0.1)
    expect(res.hit).toBe(true)
  })
})
