export type PoolMetricRow = { date: string; tvlUSD: number; feesUSD: number };

export function annualizedApr(feesUSD: number, tvlUSD: number): number {
  if (!Number.isFinite(feesUSD) || !Number.isFinite(tvlUSD) || tvlUSD <= 0) return 0;
  return (feesUSD * 365) / tvlUSD;
}

export function aprSeries(rows: PoolMetricRow[]): Array<{ date: string; aprAnnual: number }> {
  return (rows || []).map((r) => ({ date: r.date, aprAnnual: annualizedApr(r.feesUSD, r.tvlUSD) }));
}

