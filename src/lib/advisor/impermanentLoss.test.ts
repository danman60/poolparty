import { describe, it, expect } from 'vitest'
import { ilFromPriceChange, breakEvenVolumeUsd, ilRiskLevel, ilRiskFromPriceChange, volumeToOffsetIL } from './impermanentLoss'

describe('impermanentLoss utilities', () => {
  it('ilFromPriceChange returns 0 for 0% change', () => {
    expect(ilFromPriceChange(0)).toBe(0)
  })

  it('ilFromPriceChange matches known values (~5.72% for +/-100%)', () => {
    const up = ilFromPriceChange(100)
    const down = ilFromPriceChange(-50) // symmetric at r=2 and r=0.5
    expect(up).toBeGreaterThan(0)
    expect(Math.abs(up - 0.0572)).toBeLessThan(0.001)
    expect(Math.abs(down - 0.0572)).toBeLessThan(0.001)
  })

  it('breakEvenVolumeUsd computes daily volume to offset IL', () => {
    // TVL 100k, fee 0.3%, IL ~5.72% => volume ~ 100k * 0.0572 / 0.003 = 1,906,667
    const v = breakEvenVolumeUsd(100_000, 0.003, 0.0572)
    expect(Math.abs(v - 1_906_667)).toBeLessThan(5_000)
  })

  it('volumeToOffsetIL matches composition', () => {
    const direct = volumeToOffsetIL(50_000, 0.0005, 25)
    const il = ilFromPriceChange(25)
    const composed = breakEvenVolumeUsd(50_000, 0.0005, il)
    expect(Math.abs(direct - composed)).toBeLessThan(1)
  })

  it('ilRiskLevel thresholds', () => {
    expect(ilRiskLevel(0.01)).toBe('low')
    expect(ilRiskLevel(0.03)).toBe('medium')
    expect(ilRiskLevel(0.07)).toBe('high')
    expect(ilRiskLevel(0.12)).toBe('extreme')
  })

  it('ilRiskFromPriceChange convenience', () => {
    expect(ilRiskFromPriceChange(1)).toBe('low')
    expect(ilRiskFromPriceChange(50)).toBe('high')
    expect(ilRiskFromPriceChange(100)).toBe('high') // ~5.72%
  })
})

