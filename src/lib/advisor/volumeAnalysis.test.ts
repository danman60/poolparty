import { describe, it, expect } from 'vitest'
import { volumeTrend, feeMomentum } from './volumeAnalysis'

function mk(n: number[], key: 'volumeUSD' | 'feesUSD') {
  return n.map((v, i) => ({ date: `2025-01-${String(i + 1).padStart(2, '0')}`, [key]: v })) as any
}

describe('volumeAnalysis', () => {
  it('identifies rising volume with >10% change', () => {
    const prior = Array(7).fill(100)
    const recent = Array(7).fill(130)
    const days = mk([...prior, ...recent], 'volumeUSD')
    const res = volumeTrend(days)
    expect(res.trend).toBe('rising')
    expect(res.pctChange7d).toBeGreaterThan(10)
  })

  it('identifies falling fees with < -10% change', () => {
    const prior = Array(7).fill(200)
    const recent = Array(7).fill(150)
    const days = mk([...prior, ...recent], 'feesUSD')
    const res = feeMomentum(days)
    expect(res.trend).toBe('falling')
    expect(res.pctChange7d).toBeLessThan(-10)
  })
})

