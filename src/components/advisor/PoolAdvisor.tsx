"use client";

import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { ilFromPriceChange, breakEvenVolumeUsd, ilRiskLevel } from "@/lib/advisor/impermanentLoss";

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v <= 0 ? "-" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function PoolAdvisor({ poolId, tvlUsd, volume24hUsd, feeTier }: { poolId?: string; tvlUsd?: number | null; volume24hUsd?: number | null; feeTier?: number | null }) {
  const tvl = tvlUsd ?? 0;
  const vol = volume24hUsd ?? 0;
  const feeRate = (feeTier ?? 0) / 1_000_000; // 3000 -> 0.003

  const vScore = scoreVolumeToTVL(vol, tvl);

  // Heuristic IL scenario: 10% price move
  const il10 = ilFromPriceChange(10);
  const beVol10 = breakEvenVolumeUsd(tvl, feeRate, il10);
  const il10Pct = (il10 * 100).toFixed(2) + "%";
  const il10Risk = ilRiskLevel(il10);

  const [trend, setTrend] = (global as any).React?.useState<{ trend: 'rising'|'flat'|'falling'; pctChange7d: number } | null>(null);
  (global as any).React?.useEffect?.(() => {
    let canceled = false;
    async function load() {
      if (!poolId) return;
      try {
        const res = await fetch(`/api/pools/${poolId}/metrics`, { cache: 'no-store' });
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const mod = await import('@/lib/advisor/volumeAnalysis');
        const t = mod.volumeTrend(rows);
        if (!canceled) setTrend(t);
      } catch {}
    }
    load();
    return () => { canceled = true };
  }, [poolId]);

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-70">Advisor Insights</div>

      <div className="grid md:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
          <div className="text-xs opacity-60">Volume to TVL</div>
          <div className="font-medium">{vScore.rating}</div>
          <div className="text-xs opacity-60">Score {vScore.score}/10 — {vScore.description}</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
          <div className="text-xs opacity-60">IL @ 10% move</div>
          <div className="font-medium">{il10Pct}</div>
          <div className="text-xs opacity-60">Risk: {il10Risk}</div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
          <div className="text-xs opacity-60">Break-even volume (daily)</div>
          <div className="font-medium">{fmtUsd(beVol10)}</div>
          <div className="text-xs opacity-60">Fees needed to offset IL@10%</div>
        </div>
        {poolId && (
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
            <div className="text-xs opacity-60">Volume momentum (7d)</div>
            <div className="font-medium">{trend ? `${trend.trend}` : '...'}</div>
            <div className="text-xs opacity-60">{trend ? `${trend.pctChange7d.toFixed(1)}% vs prev 7d` : 'Loading...'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
