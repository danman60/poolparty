"use client";

import React from "react";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { analyzeFeeTier } from "@/lib/advisor/feeTier";
import { pairMetaFromSymbols } from "@/lib/advisor/pairMeta";
import { ilFromPriceChange, ilRiskLevel } from "@/lib/advisor/impermanentLoss";

type Row = {
  id: string;
  token0?: { symbol?: string | null } | null;
  token1?: { symbol?: string | null } | null;
  fee_tier?: number | null;
  tvl_usd?: number | null;
  volume_usd_24h?: number | null;
};

function previewRating(p: Row): number {
  const tvl = p.tvl_usd ?? 0;
  const vol = p.volume_usd_24h ?? 0;
  const feeRate = (p.fee_tier ?? 0) / 1_000_000; // 3000 -> 0.003 (not used directly)
  const ratio = tvl > 0 ? vol / tvl : 0;
  let vScore = 1;
  if (ratio > 1.0) vScore = 10; else if (ratio > 0.5) vScore = 9; else if (ratio > 0.3) vScore = 7; else if (ratio > 0.15) vScore = 5; else if (ratio > 0.05) vScore = 3; else vScore = 1;
  let score = vScore * 10;
  // IL penalty heuristic at 10%
  score -= 5; // keep minimal penalty for CSV ranking simplicity
  if (feeRate >= 0.01) score += 5; else if (feeRate >= 0.003) score += 2;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function aprValue(p: Row) {
  const tvl = p.tvl_usd ?? 0;
  const vol = p.volume_usd_24h ?? 0;
  const fee = (p.fee_tier ?? 0) / 1_000_000;
  if (tvl <= 0 || vol <= 0 || fee <= 0) return 0;
  return (vol * fee * 365) / tvl; // annualized
}

export default function ExportPoolsAdvisorCsvButton({ rows, label, disabled }: { rows: Row[]; label?: string; disabled?: boolean }) {
  function onExport() {
    if (disabled || !rows || rows.length === 0) return;
    try {
      const { toCsv, downloadCsv } = require("@/lib/csv");
      const headers = [
        "pool_id","token0","token1","fee","tvl_usd","volume_24h_usd","apr_est",
        "screening_score_preview","vtvl_score","fee_tier_note","il_penalty_points"
      ];
      const csvRows = (rows || []).map((r) => {
        const apr = aprValue(r);
        const rating = previewRating(r);
        const vtvl = scoreVolumeToTVL(r.volume_usd_24h ?? 0, r.tvl_usd ?? 0).score;
        const meta = pairMetaFromSymbols(r.token0?.symbol || undefined, r.token1?.symbol || undefined);
        const feeAdv = analyzeFeeTier(r.fee_tier ?? 0, meta);
        const il = ilFromPriceChange(10);
        const risk = ilRiskLevel(il);
        const ilPenalty = risk === 'extreme' ? -30 : risk === 'high' ? -15 : risk === 'medium' ? -5 : 0;
        return [
          r.id,
          r.token0?.symbol || "-",
          r.token1?.symbol || "-",
          r.fee_tier == null ? "-" : (r.fee_tier / 10000).toFixed(2) + "%",
          (r.tvl_usd ?? 0).toFixed(0),
          (r.volume_usd_24h ?? 0).toFixed(0),
          (apr * 100).toFixed(2) + "%",
          rating,
          vtvl,
          feeAdv.note,
          ilPenalty,
        ];
      });
      const csv = toCsv(headers, csvRows);
      downloadCsv(`pools_advisor_${new Date().toISOString().slice(0,10)}.csv`, csv);
    } catch {}
  }
  return (
    <button
      onClick={onExport}
      disabled={!!disabled}
      title={disabled ? 'No pools to export' : 'Export pools advisor metrics to CSV'}
      aria-label={disabled ? 'No pools to export' : 'Export pools advisor metrics to CSV'}
      className={`text-xs underline ${disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
    >
      {label || 'Export Pools Advisor CSV'}
    </button>
  );
}
