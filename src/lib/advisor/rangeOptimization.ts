export type RangeResult = {
  lower: number; // price lower bound
  upper: number; // price upper bound
  widthPct: number; // pct width of band
  efficiencyScore: number; // 0-100 heuristic
  note: string;
};

function clamp01(n: number) { return Math.max(0, Math.min(1, n)); }

/**
 * Simple heuristic range sizing based on daily volatility and pair type.
 * - bluechip: ~8% baseline width adjusted by volatility
 * - stable: ~0.2% baseline width adjusted by volatility
 * - longtail: ~80% baseline width adjusted by volatility
 */
export function optimalRange(
  type: 'bluechip' | 'stable' | 'longtail',
  params: { price: number; dailyVolPct: number }
): RangeResult {
  const price = params.price > 0 ? params.price : 1;
  const vol = Math.max(0, params.dailyVolPct || 0);
  const volFactor = 1 + clamp01(vol / 20); // up to 2x if 20% daily vol

  const base = type === 'stable' ? 0.2 : type === 'bluechip' ? 8 : 80; // percent width
  let widthPct = base * volFactor;
  if (type === 'stable') widthPct = Math.max(0.1, Math.min(1.0, widthPct));
  if (type === 'bluechip') widthPct = Math.max(2, Math.min(20, widthPct));
  if (type === 'longtail') widthPct = Math.max(20, Math.min(120, widthPct));

  const half = widthPct / 200; // e.g., width 10% => half = 5% => 0.05
  const lower = price * (1 - half);
  const upper = price * (1 + half);

  // Efficiency: tighter bands generally more efficient until volatility overwhelms
  let efficiencyScore = 100 - Math.min(90, widthPct / (type === 'stable' ? 0.01 : type === 'bluechip' ? 0.2 : 1.0));
  efficiencyScore = Math.max(10, Math.min(100, Math.round(efficiencyScore)));

  const note = `${type} range ~${widthPct.toFixed(2)}% around price`;
  return { lower, upper, widthPct, efficiencyScore, note };
}

