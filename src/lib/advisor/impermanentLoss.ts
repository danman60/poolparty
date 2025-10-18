export interface PoolSummary {
  tvl: number; // total value locked, same units as volume24h
  volume24h: number; // last 24h volume
  feeTier: number; // raw fee tier in decimal (e.g., 0.003 for 0.3%)
}

// Core impermanent loss formula for 50/50 pools.
export function calculateIL(priceChangeRatio: number): number {
  const r = priceChangeRatio;
  if (!isFinite(r) || r <= 0) return 0;
  // returns a negative fraction for loss; take absolute where needed
  return (2 * Math.sqrt(r)) / (1 + r) - 1;
}

// Expected impermanent loss approximation for small moves with annualized volatility over time (days).
export function expectedIL(volatility: number, timeDays: number): number {
  const tYears = timeDays / 365;
  return 0.5 * Math.pow(volatility, 2) * tYears; // fraction (e.g., 0.026 => 2.6%)
}

// TVL multiple of volume required to offset IL at a given fee tier.
export function volumeToOffsetIL(priceChangeRatio: number, feeTier: number): number {
  const il = Math.abs(calculateIL(priceChangeRatio));
  if (!isFinite(feeTier) || feeTier <= 0) return Infinity;
  return il / feeTier; // multiple of TVL
}

export function assessILRisk(
  pool: PoolSummary,
  historicalVolatility: number
): {
  level: 'low' | 'medium' | 'high' | 'extreme';
  expectedMove30d: number; // percent
  volumeNeeded: number; // TVL multiple over the period
  isViable: boolean;
} {
  const expectedMove = 1 + (historicalVolatility * Math.sqrt(30 / 365));
  const il = calculateIL(expectedMove);
  const volumeNeeded = volumeToOffsetIL(expectedMove, pool.feeTier);
  const currentVolumeRatio = pool.volume24h / pool.tvl;
  const viableVolume = volumeNeeded / 30; // daily volume multiple needed

  return {
    level: Math.abs(il) < 0.01 ? 'low' : Math.abs(il) < 0.03 ? 'medium' : Math.abs(il) < 0.06 ? 'high' : 'extreme',
    expectedMove30d: (expectedMove - 1) * 100,
    volumeNeeded,
    isViable: currentVolumeRatio > viableVolume,
  };
}

