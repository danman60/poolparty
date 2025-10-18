"use client";

import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { ilFromPriceChange, breakEvenVolumeUsd, ilRiskLevel } from "@/lib/advisor/impermanentLoss";

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v <= 0 ? "-" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function PoolAdvisor({ tvlUsd, volume24hUsd, feeTier }: { tvlUsd?: number | null; volume24hUsd?: number | null; feeTier?: number | null }) {
  const tvl = tvlUsd ?? 0;
  const vol = volume24hUsd ?? 0;
  const feeRate = (feeTier ?? 0) / 1_000_000; // 3000 -> 0.003

  const vScore = scoreVolumeToTVL(vol, tvl);

  // Heuristic IL scenario: 10% price move
  const il10 = ilFromPriceChange(10);
  const beVol10 = breakEvenVolumeUsd(tvl, feeRate, il10);
  const il10Pct = (il10 * 100).toFixed(2) + "%";
  const il10Risk = ilRiskLevel(il10);

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
      </div>
    </div>
  );
}

