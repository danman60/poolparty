"use client";

import { useEffect, useMemo, useState } from "react";
import AdvisorBadge from "./AdvisorBadge";
import MetricTooltip from "./MetricTooltip";
import HealthBar from "./HealthBar";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { ilFromPriceChange, ilRiskLevel } from "@/lib/advisor/impermanentLoss";
import { analyzeFeeTier } from "@/lib/advisor/feeTier";
import { screenPool } from "@/lib/advisor/poolScreening";
import { pairMetaFromSymbols } from "@/lib/advisor/pairMeta";
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
  const [symbols, setSymbols] = useState<{ a?: string; b?: string } | null>(null);
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

  useEffect(() => {
    let canceled = false;
    async function loadSymbols() {
      try {
        const res = await fetch(`/api/pools/${poolId}`, { cache: 'force-cache' });
        const json = await res.json();
        const symA = json?.pool?.token0?.symbol as string | undefined;
        const symB = json?.pool?.token1?.symbol as string | undefined;
        if (!canceled) setSymbols({ a: symA, b: symB });
      } catch {}
    }
    loadSymbols();
    return () => { canceled = true };
  }, [poolId]);

  const details = useMemo(() => {
    const il = ilFromPriceChange(10);
    const meta = pairMetaFromSymbols(symbols?.a, symbols?.b);
    const tier = analyzeFeeTier((feeTier ?? 0), meta);
    const screening = screenPool({
      volumeToTvlScore: vScore.score,
      momentumTrend: momentum?.trend ?? 'flat',
      feeTierBonus: tier.bonus,
      ilAt10Pct: il,
    });
    return { score: screening.score, breakdown: screening.breakdown, tierNote: tier.note } as const;
  }, [vScore.score, momentum?.trend, feeTier, symbols?.a, symbols?.b]);

  const overall = details.score;

  const status = toStatus(overall);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <AdvisorBadge status={status} score={overall} />
        <MetricTooltip label="How is this rated?">
          Overall rating combines Volume:TVL (0–10), 7d volume momentum, a small fee-tier bonus, and an IL@10% penalty. This is a heuristic signal, not financial advice.
        </MetricTooltip>
        <MetricTooltip label="Breakdown">
          <div className="space-y-1">
            <div className="opacity-80">• Volume:TVL: {vScore.score}/10 → +{(details as any)?.breakdown?.vtvl ?? 0} pts</div>
            <div className="opacity-80">• Momentum: {momentum?.trend ?? 'flat'} → {(((details as any)?.breakdown?.momentum ?? 0) >= 0 ? '+' : '') + (((details as any)?.breakdown?.momentum ?? 0))} pts</div>
            <div className="opacity-80">• Fee tier → +{(details as any)?.breakdown?.fee ?? 0} pts</div>
            <div className="opacity-80">• IL @ 10% move → {(details as any)?.breakdown?.il ?? 0} pts</div>
          </div>
        </MetricTooltip>
        <div className="w-24">
          <HealthBar score={overall} status={status} />
        </div>
      </div>
      <div className="text-xs opacity-60">
        V:TVL score {vScore.score}/10{momentum ? ` • ${momentum.trend} ${momentum.pctChange7d.toFixed(1)}%` : ''}
      </div>
    </div>
  );
}
