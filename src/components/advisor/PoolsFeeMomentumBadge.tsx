"use client";

import { useEffect, useState } from "react";

type Trend = 'rising' | 'flat' | 'falling';

export default function PoolsFeeMomentumBadge({ poolId }: { poolId: string }) {
  const [trend, setTrend] = useState<{ trend: Trend; pct: number } | null>(null);

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const res = await fetch(`/api/pools/${poolId}/metrics`, { cache: 'no-store' });
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const mod = await import('@/lib/advisor/volumeAnalysis');
        const t = mod.feeMomentum(rows);
        if (!canceled) setTrend({ trend: t.trend, pct: t.pctChange7d });
      } catch {
        if (!canceled) setTrend(null);
      }
    }
    load();
    return () => { canceled = true };
  }, [poolId]);

  if (!trend) return null;
  const arrow = trend.trend === 'rising' ? '↑' : trend.trend === 'falling' ? '↓' : '→';
  const color = trend.trend === 'rising' ? 'text-[var(--lifeguard-good)]' : trend.trend === 'falling' ? 'text-[var(--lifeguard-danger)]' : 'opacity-70';

  return (
    <div className={`text-[11px] ${color}`}>Fees {arrow} {trend.pct.toFixed(1)}%</div>
  );
}

