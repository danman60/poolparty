import { describe, it, expect } from 'vitest'
import { screenPool } from './poolScreening'

describe('poolScreening', () => {
  it('scores a strong pool high', () => {
    const s = screenPool({ volumeToTvlScore: 9, momentumTrend: 'rising', feeTierBonus: 2, ilAt10Pct: 0.01, poolAgeDays: 200, concentrationRisk: 0.2 })
    expect(s.score).toBeGreaterThanOrEqual(80)
  })
  it('scores a weak pool low', () => {
    const s = screenPool({ volumeToTvlScore: 1, momentumTrend: 'falling', feeTierBonus: 0, ilAt10Pct: 0.12, poolAgeDays: 5, concentrationRisk: 0.9 })
    expect(s.score).toBeLessThan(40)
  })
})

