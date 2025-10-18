"use client";

import { useEffect, useMemo, useState } from "react";
import AdvisorBadge from "./AdvisorBadge";
import MetricTooltip from "./MetricTooltip";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { ilFromPriceChange, ilRiskLevel } from "@/lib/advisor/impermanentLoss";
import type { Trend } from "@/lib/advisor/volumeAnalysis";

type Status = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';

function toStatus(score: number): Status {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'warning';
  if (score >= 40) return 'danger';
  return 'critical';
}

export default function PoolRating({ poolId, tvlUsd, volume24hUsd, feeTier }: { poolId: string; tvlUsd?: number | null; volume24hUsd?: number | null; feeTier?: number | null }) {
  const tvl = tvlUsd ?? 0;
  const vol = volume24hUsd ?? 0;
  const feeRate = (feeTier ?? 0) / 1_000_000; // 3000 -> 0.003

  const vScore = scoreVolumeToTVL(vol, tvl); // 0-10

  const [momentum, setMomentum] = useState<{ trend: Trend; pctChange7d: number } | null>(null);
  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const res = await fetch(`/api/pools/${poolId}/metrics`, { cache: 'no-store' });
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const { volumeTrend } = await import("@/lib/advisor/volumeAnalysis");
        const t = volumeTrend(rows);
        if (!canceled) setMomentum(t);
      } catch {
        if (!canceled) setMomentum(null);
      }
    }
    load();
    return () => { canceled = true };
  }, [poolId]);

  const overall = useMemo(() => {
    let s = vScore.score * 10; // 0-100 base
    // Momentum adjustment
    const m = momentum?.trend;
    if (m === 'rising') s += 10;
    else if (m === 'falling') s -= 10;

    // IL penalty at 10% move
    const il = ilFromPriceChange(10); // ~1.23%
    const risk = ilRiskLevel(il);
    if (risk === 'medium') s -= 5;
    else if (risk === 'high') s -= 15;
    else if (risk === 'extreme') s -= 30;

    // Fee tier bonus for 0.3% and 1% (heuristic)
    if (feeRate >= 0.01) s += 5; else if (feeRate >= 0.003) s += 2;

    return Math.max(0, Math.min(100, Math.round(s)));
  }, [vScore.score, momentum?.trend, feeRate]);

  const status = toStatus(overall);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AdvisorBadge status={status} score={overall} />
        <MetricTooltip label="How is this rated?">
          Overall rating combines Volume:TVL (0–10), 7d volume momentum, a small fee-tier bonus, and an IL@10% penalty. This is a heuristic signal, not financial advice.
        </MetricTooltip>
      </div>
      <div className="text-xs opacity-60">
        V:TVL score {vScore.score}/10{momentum ? ` • ${momentum.trend} ${momentum.pctChange7d.toFixed(1)}%` : ''}
      </div>
    </div>
  );
}

