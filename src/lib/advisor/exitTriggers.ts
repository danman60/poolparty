export type PricePoint = { time: number; price: number };

export function detectStablecoinDepeg(points: PricePoint[], thresholds: number[] = [0.5, 1, 2]) {
  // thresholds in percent deviation from 1.0
  const last = points[points.length - 1];
  if (!last) return { level: 0 } as const;
  const dev = Math.abs((last.price - 1) / 1) * 100;
  let level = 0 as 0 | 1 | 2 | 3;
  if (dev > thresholds[2]) level = 3; else if (dev > thresholds[1]) level = 2; else if (dev > thresholds[0]) level = 1; else level = 0;
  return { level } as const;
}

export function detectVolatilitySpike(returnsPct: number[], window = 24, sigma = 3) {
  if (returnsPct.length < window + 1) return { spike: false };
  const recent = returnsPct.slice(-window);
  const mu = recent.reduce((a, b) => a + b, 0) / recent.length;
  const varr = recent.reduce((a, b) => a + (b - mu) * (b - mu), 0) / recent.length;
  const std = Math.sqrt(varr);
  const last = returnsPct[returnsPct.length - 1];
  const spike = std > 0 && Math.abs(last - mu) > sigma * std;
  return { spike };
}

export function outOfRangeDuration(position: { lower: number; upper: number }, prices: PricePoint[], maxHours = 24) {
  if (!prices.length) return { hours: 0, breached: false };
  const end = prices[prices.length - 1]?.time || 0;
  const startCut = end - maxHours * 3600 * 1000;
  let breachedStart: number | null = null;
  for (const p of prices) {
    if (p.time < startCut) continue;
    if (p.price < position.lower || p.price > position.upper) {
      breachedStart = p.time; break;
    }
  }
  if (breachedStart == null) return { hours: 0, breached: false };
  const hours = Math.max(0, (end - breachedStart) / (3600 * 1000));
  return { hours, breached: hours >= maxHours };
}

export function pnlVsHodlStopLoss(pnlSeries: number[], threshold = -0.1) {
  if (!pnlSeries.length) return { hit: false };
  const last = pnlSeries[pnlSeries.length - 1];
  return { hit: last <= threshold };
}

