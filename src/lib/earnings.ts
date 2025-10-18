export function estimateDailyEarnings(totalFeesUsd: number, timestamps: number[]): number | null {
  if (!Number.isFinite(totalFeesUsd) || totalFeesUsd <= 0) return null;
  const times = (timestamps || []).filter(t => Number.isFinite(t) && t > 0);
  if (times.length === 0) return null;
  const earliest = Math.min(...times);
  const days = Math.max(1, (Date.now() - earliest) / 86_400_000);
  const perDay = totalFeesUsd / days;
  return Number.isFinite(perDay) && perDay > 0 ? perDay : null;
}

