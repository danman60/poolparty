import { describe, it, expect } from 'vitest'
import { optimalRange } from './rangeOptimization'

describe('rangeOptimization', () => {
  it('computes tight range for stable', () => {
    const r = optimalRange('stable', { price: 1, dailyVolPct: 0.1 })
    expect(r.widthPct).toBeLessThan(1.1)
    expect(r.lower).toBeLessThan(1)
    expect(r.upper).toBeGreaterThan(1)
  })
  it('computes moderate range for bluechip', () => {
    const r = optimalRange('bluechip', { price: 2000, dailyVolPct: 5 })
    expect(r.widthPct).toBeGreaterThan(5)
    expect(r.lower).toBeLessThan(2000)
  })
  it('computes wide range for longtail', () => {
    const r = optimalRange('longtail', { price: 3, dailyVolPct: 30 })
    expect(r.widthPct).toBeGreaterThan(60)
    expect(r.upper).toBeGreaterThan(3)
  })
})

