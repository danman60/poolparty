"use client";

import React from "react";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { analyzeFeeTier } from "@/lib/advisor/feeTier";
import { pairMetaFromSymbols } from "@/lib/advisor/pairMeta";
import { ilFromPriceChange } from "@/lib/advisor/impermanentLoss";

type Row = {
  id: string;
  fee_tier?: number | null;
  tvl_usd?: number | null;
  volume_usd_24h?: number | null;
  token0?: { symbol?: string | null } | null;
  token1?: { symbol?: string | null } | null;
};

function previewRating(p: Row): number {
  const tvl = p.tvl_usd ?? 0;
  const vol = p.volume_usd_24h ?? 0;
  const feeRate = (p.fee_tier ?? 0) / 1_000_000;
  const ratio = tvl > 0 ? vol / tvl : 0;
  let vScore = 1;
  if (ratio > 1.0) vScore = 10; else if (ratio > 0.5) vScore = 9; else if (ratio > 0.3) vScore = 7; else if (ratio > 0.15) vScore = 5; else if (ratio > 0.05) vScore = 3; else vScore = 1;
  let score = vScore * 10;
  if (feeRate >= 0.01) score += 5; else if (feeRate >= 0.003) score += 2;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default function CopyPoolsAdvisorSummaryButton({ rows, label = "Copy Advisor Summary" }: { rows: Row[]; label?: string }) {
  async function onCopy() {
    try {
      const list = (rows || []).map((r) => ({ r, score: previewRating(r) })).sort((a, b) => b.score - a.score);
      const top = list.slice(0, 5);
      const total = rows?.length || 0;
      const lines: string[] = [];
      // Distribution by preview status
      const counts = { excellent: 0, good: 0, warning: 0, danger: 0, critical: 0 } as Record<string, number>;
      function toStatus(score: number) {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 55) return 'warning';
        if (score >= 40) return 'danger';
        return 'critical';
      }
      for (const it of list) counts[toStatus(it.score)]++;
      lines.push(`Pools: ${total}`);
      lines.push(`Distribution: Excellent ${counts.excellent}, Good ${counts.good}, Fair ${counts.warning}, Risky ${counts.danger}, Critical ${counts.critical}`);
      for (let i = 0; i < top.length; i++) {
        const r = top[i].r;
        const vtvl = scoreVolumeToTVL(r.volume_usd_24h ?? 0, r.tvl_usd ?? 0).score;
        const meta = pairMetaFromSymbols(r.token0?.symbol || undefined, r.token1?.symbol || undefined);
        const tier = analyzeFeeTier(r.fee_tier ?? 0, meta);
        const il = ilFromPriceChange(10);
        const ilPenalty = il >= 0.1 ? '-30' : il >= 0.05 ? '-15' : il >= 0.02 ? '-5' : '0';
        lines.push(`${i + 1}. ${namePair(r)} — ${top[i].score}/100 (V:TVL ${vtvl}/10, Fee: ${tier.note}, IL@10% ${ilPenalty})`);
      }
      const text = `PoolParty Advisor Summary\n` + lines.join('\n');
      await navigator.clipboard.writeText(text);
    } catch {}
  }
  return (
    <button
      onClick={onCopy}
      disabled={!rows || rows.length === 0}
      className={`text-xs underline ${(!rows || rows.length===0) ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
      aria-label="Copy advisor summary for pools"
      title="Copy advisor summary for pools"
    >
      {label}
    </button>
  );
}

function namePair(r: Row): string {
  const a = r.token0?.symbol || '';
  const b = r.token1?.symbol || '';
  if (a && b) return `${a}/${b}`;
  return r.id;
}
