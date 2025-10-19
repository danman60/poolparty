export type ScreeningInputs = {
  volumeToTvlScore: number; // 0-10
  momentumTrend: 'rising' | 'flat' | 'falling';
  feeTierBonus: number; // from analyzeFeeTier, ~0..5
  ilAt10Pct: number; // IL fraction at 10% price move (e.g., 0.0123)
  poolAgeDays?: number; // optional
  concentrationRisk?: number; // 0..1 where 1=high risk
};

export function screenPool(i: ScreeningInputs): { score: number; breakdown: Record<string, number>; recommendation: string } {
  const breakdown: Record<string, number> = {};
  let score = 0;

  // Volume:TVL
  const vtvl = Math.max(0, Math.min(10, i.volumeToTvlScore));
  breakdown.vtvl = vtvl * 8; // up to 80
  score += breakdown.vtvl;

  // Momentum
  const mom = i.momentumTrend === 'rising' ? 10 : i.momentumTrend === 'falling' ? -10 : 0;
  breakdown.momentum = mom;
  score += mom;

  // Fee tier bonus
  breakdown.fee = i.feeTierBonus;
  score += i.feeTierBonus;

  // IL@10% penalty
  const ilPenalty = i.ilAt10Pct >= 0.1 ? -30 : i.ilAt10Pct >= 0.05 ? -15 : i.ilAt10Pct >= 0.02 ? -5 : 0;
  breakdown.il = ilPenalty;
  score += ilPenalty;

  // Pool age bonus
  if (i.poolAgeDays != null) {
    const ageBonus = i.poolAgeDays > 180 ? 5 : i.poolAgeDays > 90 ? 3 : i.poolAgeDays > 30 ? 1 : 0;
    breakdown.age = ageBonus;
    score += ageBonus;
  }

  // Concentration risk penalty
  if (i.concentrationRisk != null) {
    const cr = Math.max(0, Math.min(1, i.concentrationRisk));
    const penalty = -Math.round(cr * 10);
    breakdown.concentration = penalty;
    score += penalty;
  }

  const final = Math.max(0, Math.min(100, Math.round(score)));
  const recommendation = final >= 85 ? 'Enter' : final >= 70 ? 'Consider' : final >= 55 ? 'Caution' : final >= 40 ? 'Avoid' : 'Avoid';
  return { score: final, breakdown, recommendation };
}

