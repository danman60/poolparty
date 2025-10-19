export type PairMeta = {
  stable?: boolean; // e.g., USDC/USDT
  blueChip?: boolean; // e.g., ETH/USDC
};

export type FeeTierAdvice = {
  bonus: number; // suggested score bonus on 0-100 scale
  note: string;
};

/**
 * Analyze Uniswap V3 fee tier in the context of the pair type.
 * Heuristic mapping consistent with existing UI bonuses:
 * - 10000 (1.00%): +5 (best for long-tail/exotic)
 * - 3000 (0.30%): +2 (works well for blue-chip pairs)
 * - 500 (0.05%): +1 if stable pair, else 0
 */
export function analyzeFeeTier(feeTier: number | null | undefined, meta: PairMeta = {}): FeeTierAdvice {
  const ft = Number(feeTier || 0);
  if (ft >= 10000) return { bonus: 5, note: 'High fee tier (1.00%) suits long-tail markets' };
  if (ft >= 3000) return { bonus: 2, note: 'Standard fee tier (0.30%) suits blue-chip pairs' };
  if (ft >= 500) return { bonus: meta.stable ? 1 : 0, note: meta.stable ? 'Low fee tier (0.05%) suits stable pairs' : 'Low fee tier (0.05%)' };
  return { bonus: 0, note: 'Unknown fee tier' };
}

