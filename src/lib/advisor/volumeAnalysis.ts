export type DayMetric = { date: string; tvlUSD?: number; volumeUSD?: number; feesUSD?: number };

export type Trend = 'rising' | 'flat' | 'falling';

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Compare last 7 days vs prior 7 days average volume.
 */
export function volumeTrend(days: DayMetric[]): { trend: Trend; pctChange7d: number } {
  const vols = (days || []).map((d) => Number(d.volumeUSD || 0));
  if (vols.length < 4) return { trend: 'flat', pctChange7d: 0 };
  const last7 = vols.slice(-7);
  const prev7 = vols.slice(-14, -7);
  const a = avg(last7);
  const b = avg(prev7);
  if (b <= 0) return { trend: a > 0 ? 'rising' : 'flat', pctChange7d: a > 0 ? 100 : 0 };
  const pct = ((a - b) / b) * 100;
  const trend: Trend = pct > 10 ? 'rising' : pct < -10 ? 'falling' : 'flat';
  return { trend, pctChange7d: pct };
}

/**
 * Simple momentum on fees: last 7d vs prior 7d.
 */
export function feeMomentum(days: DayMetric[]): { trend: Trend; pctChange7d: number } {
  const fees = (days || []).map((d) => Number(d.feesUSD || 0));
  if (fees.length < 4) return { trend: 'flat', pctChange7d: 0 };
  const last7 = fees.slice(-7);
  const prev7 = fees.slice(-14, -7);
  const a = avg(last7);
  const b = avg(prev7);
  if (b <= 0) return { trend: a > 0 ? 'rising' : 'flat', pctChange7d: a > 0 ? 100 : 0 };
  const pct = ((a - b) / b) * 100;
  const trend: Trend = pct > 10 ? 'rising' : pct < -10 ? 'falling' : 'flat';
  return { trend, pctChange7d: pct };
}

