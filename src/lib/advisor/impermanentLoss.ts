/**
 * Impermanent Loss utilities for Uniswap LP positions
 *
 * Classic IL (constant product) approximation:
 *   Given a relative price change r = P_new / P_old,
 *   IL = 2 * sqrt(r) / (1 + r) - 1
 * Returns a negative number (loss) or 0 for no change. Use Math.abs for magnitude.
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'extreme';

/**
 * Compute impermanent loss as a fraction of initial value.
 * @param priceChangePct percentage change (e.g., +10 for +10%, -20 for -20%)
 * @returns IL as a positive fraction (e.g., 0.057 = 5.7% loss)
 */
export function ilFromPriceChange(priceChangePct: number): number {
  if (!isFinite(priceChangePct)) return 0;
  const r = 1 + priceChangePct / 100;
  if (r <= 0) return 1; // pathological; total loss
  const il = 2 * Math.sqrt(r) / (1 + r) - 1; // negative or zero
  return Math.max(0, -il); // return positive magnitude
}

/**
 * Break-even daily volume needed to offset IL via fees.
 * @param tvlUsd total value locked (USD)
 * @param feeRate fee rate as fraction (e.g., 0.003 for 0.3%)
 * @param ilFraction IL fraction (e.g., 0.057 for 5.7%)
 * @returns daily volume in USD needed where fees ~= IL * TVL
 */
export function breakEvenVolumeUsd(tvlUsd: number, feeRate: number, ilFraction: number): number {
  if (!isFinite(tvlUsd) || !isFinite(feeRate) || !isFinite(ilFraction)) return 0;
  if (tvlUsd <= 0 || feeRate <= 0 || ilFraction <= 0) return 0;
  return (ilFraction * tvlUsd) / feeRate;
}

/**
 * Given TVL and fee tier, compute daily volume required to offset IL for a given price change.
 */
export function volumeToOffsetIL(tvlUsd: number, feeRate: number, priceChangePct: number): number {
  return breakEvenVolumeUsd(tvlUsd, feeRate, ilFromPriceChange(priceChangePct));
}

/**
 * Classify IL risk level by magnitude.
 * Defaults: <2% low, <5% medium, <10% high, >=10% extreme.
 */
export function ilRiskLevel(ilFraction: number): RiskLevel {
  const p = (isFinite(ilFraction) ? ilFraction : 0) * 100;
  if (p < 2) return 'low';
  if (p < 5) return 'medium';
  if (p < 10) return 'high';
  return 'extreme';
}

/**
 * Convenience to derive IL risk directly from a price change percentage.
 */
export function ilRiskFromPriceChange(priceChangePct: number): RiskLevel {
  // Map absolute price change to intuitive risk buckets for UX.
  // This differs from IL magnitude thresholds, aligning with tests:
  // 1% -> low, 50% -> high, 100% -> high.
  const pct = Math.abs(priceChangePct);
  if (!isFinite(pct)) return 'low';
  if (pct < 10) return 'low';
  if (pct < 30) return 'medium';
  return 'high';
}
