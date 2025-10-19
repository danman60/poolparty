import { describe, it, expect } from 'vitest'
import { analyzeFeeTier } from './feeTier'

describe('feeTier analysis', () => {
  it('recommends 1.00% for long-tail with +5 bonus', () => {
    const a = analyzeFeeTier(10000, {})
    expect(a.bonus).toBe(5)
  })
  it('recommends 0.30% for blue-chip with +2 bonus', () => {
    const a = analyzeFeeTier(3000, { blueChip: true })
    expect(a.bonus).toBe(2)
  })
  it('recommends 0.05% for stable with +1 bonus', () => {
    const a = analyzeFeeTier(500, { stable: true })
    expect(a.bonus).toBe(1)
  })
  it('unknown fee tier yields zero bonus', () => {
    const a = analyzeFeeTier(0, {})
    expect(a.bonus).toBe(0)
  })
})

