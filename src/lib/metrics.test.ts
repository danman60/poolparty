import { describe, it, expect } from 'vitest'
import { annualizedApr, aprSeries } from './metrics'

describe('metrics utils', () => {
  it('annualizedApr guards invalid input', () => {
    expect(annualizedApr(0, 0)).toBe(0)
    expect(annualizedApr(10, 0)).toBe(0)
    expect(annualizedApr(NaN as any, 100)).toBe(0)
  })
  it('aprSeries maps rows to apr', () => {
    const rows = [
      { date: '2025-01-01', tvlUSD: 1000, feesUSD: 1 },
      { date: '2025-01-02', tvlUSD: 500, feesUSD: 2 },
    ]
    const series = aprSeries(rows)
    expect(series.length).toBe(2)
    expect(series[0].aprAnnual).toBeCloseTo((1*365)/1000)
    expect(series[1].aprAnnual).toBeCloseTo((2*365)/500)
  })
})

