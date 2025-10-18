export type PriceMap = Record<string, number>;

export function positionFeesUsd(position: {
  token0: { id: string; decimals: string };
  token1: { id: string; decimals: string };
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
}, prices: PriceMap): number {
  const d0 = Number(position.token0.decimals || 18);
  const d1 = Number(position.token1.decimals || 18);
  const f0 = Number(BigInt(position.collectedFeesToken0 || '0') + BigInt(position.uncollectedFeesToken0 || '0')) / Math.pow(10, d0);
  const f1 = Number(BigInt(position.collectedFeesToken1 || '0') + BigInt(position.uncollectedFeesToken1 || '0')) / Math.pow(10, d1);
  const px0 = prices[position.token0.id.toLowerCase()] || 0;
  const px1 = prices[position.token1.id.toLowerCase()] || 0;
  const usd = f0 * px0 + f1 * px1;
  return Number.isFinite(usd) ? usd : 0;
}

