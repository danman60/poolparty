"use client";

import { useState } from "react";
import MetricTooltip from "./MetricTooltip";

export default function WhyRatingLink({ tvlUsd, volumeUsd24h, feeTier, rating, score }: { tvlUsd?: number | null; volumeUsd24h?: number | null; feeTier?: number | null; rating: string; score: number }) {
  const [open, setOpen] = useState(false);
  const tvl = tvlUsd ?? 0;
  const vol = volumeUsd24h ?? 0;
  const feeRate = (feeTier ?? 0) / 1_000_000;
  const ratio = tvl > 0 ? vol / tvl : 0;
  const apr = (tvl > 0 && vol > 0 && feeRate > 0) ? (vol * feeRate * 365) / tvl : 0;

  return (
    <span className="relative inline-flex items-center gap-2">
      <button
        type="button"
        className="text-[11px] underline opacity-70 hover:opacity-100"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Why this rating?"
      >
        Why?
      </button>
      <MetricTooltip label="How it's derived">
        Preview rating blends Volume:TVL with a small IL(10%) penalty and fee tier bonus.
      </MetricTooltip>
      {open && (
        <div className="absolute z-10 top-full mt-1 left-0 min-w-[260px] max-w-[300px] rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black p-3 text-xs shadow">
          <div className="opacity-60 mb-1">Preview Rating</div>
          <div className="mb-2"><span className="font-semibold">{rating}</span> (score {score}/100)</div>
          <div className="space-y-1">
            <div><span className="opacity-60">V:TVL ratio:</span> {ratio <= 0 ? '-' : ratio.toFixed(3)}</div>
            <div><span className="opacity-60">Fee tier:</span> {feeTier == null ? '-' : (feeTier/10000).toFixed(2) + '%'}</div>
            <div><span className="opacity-60">APR (est):</span> {apr <= 0 ? '-' : (apr*100).toFixed(2) + '%'}</div>
            <div className="opacity-60 mt-2">Heuristic: high V:TVL increases rating; IL@10% subtracts a small penalty; higher fee tiers add a small bonus.</div>
          </div>
        </div>
      )}
    </span>
  );
}

