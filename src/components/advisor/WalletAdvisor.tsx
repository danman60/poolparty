"use client";

import AdvisorBadge from "./AdvisorBadge";
import MetricTooltip from "./MetricTooltip";
import { calculateHealthScore } from "@/lib/lifeguard/healthScore";

type Position = {
  id: string;
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  feeTier: string;
  liquidity: string;
  depositedToken0: string;
  depositedToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
  collectedFeesToken0?: string;
  collectedFeesToken1?: string;
  tickLower: { tickIdx: string } | null;
  tickUpper: { tickIdx: string } | null;
};

export default function WalletAdvisor({ positions, prices }: { positions: Position[]; prices?: Record<string, number> }) {
  if (!positions || positions.length === 0) return null;

  const health = positions.map((p) => ({ id: p.id, h: calculateHealthScore(p) }));
  const overallAvg = Math.round(
    (health.reduce((sum, x) => sum + (x.h?.overall ?? 0), 0) / positions.length) || 0
  );
  const statusCounts = { excellent: 0, good: 0, warning: 0, danger: 0, critical: 0 } as Record<string, number>;
  for (const x of health) statusCounts[x.h.status.color] = (statusCounts[x.h.status.color] || 0) + 1;

  // Estimate total uncollected fees in USD (uses prices when available)
  let totalFeesUsd = 0;
  if (prices) {
    for (const p of positions) {
      const d0 = Number(p.token0.decimals || 18);
      const d1 = Number(p.token1.decimals || 18);
      const px0 = prices[p.token0.id.toLowerCase()] || 0;
      const px1 = prices[p.token1.id.toLowerCase()] || 0;
      const f0 = Number((BigInt(p.uncollectedFeesToken0 || '0'))) / Math.pow(10, d0);
      const f1 = Number((BigInt(p.uncollectedFeesToken1 || '0'))) / Math.pow(10, d1);
      totalFeesUsd += f0 * px0 + f1 * px1;
    }
  }

  const tips: string[] = [];
  if (statusCounts.danger + statusCounts.critical > 0) tips.push("Some positions are risky — consider widening range or reducing liquidity.");
  if (totalFeesUsd > 10) tips.push("You have fees to collect — use Batch Collect to harvest across positions.");
  if (overallAvg >= 75 && positions.length >= 1) tips.push("Overall healthy portfolio — consider increasing liquidity on your best performers.");
  if (tips.length === 0) tips.push("Keep an eye on trends; small adjustments can improve yield.");

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-70">Lifeguard Advisor</div>
        <AdvisorBadge
          status={overallAvg >= 90 ? 'excellent' : overallAvg >= 75 ? 'good' : overallAvg >= 60 ? 'warning' : overallAvg >= 40 ? 'danger' : 'critical'}
          score={overallAvg}
        />
      </div>
      <div className="grid gap-2 md:grid-cols-4 text-sm">
        <div className="rounded-md border border-black/10 dark:border-white/10 p-2">
          <div className="text-xs opacity-60">Avg Health</div>
          <div className="font-medium">{overallAvg}</div>
        </div>
        <div className="rounded-md border border-black/10 dark:border-white/10 p-2">
          <div className="text-xs opacity-60">Status Mix</div>
          <div className="font-medium text-xs flex gap-2 flex-wrap">
            <span title="Excellent" className="badge-excellent px-2 py-0.5 rounded-md">{statusCounts.excellent}</span>
            <span title="Good" className="badge-good px-2 py-0.5 rounded-md">{statusCounts.good}</span>
            <span title="Fair" className="badge-warning px-2 py-0.5 rounded-md">{statusCounts.warning}</span>
            <span title="Risky" className="badge-danger px-2 py-0.5 rounded-md">{statusCounts.danger}</span>
            <span title="Critical" className="badge-critical px-2 py-0.5 rounded-md">{statusCounts.critical}</span>
          </div>
        </div>
        <div className="rounded-md border border-black/10 dark:border-white/10 p-2">
          <div className="text-xs opacity-60">Uncollected Fees</div>
          <div className="font-medium">{prices ? fmtUsd(totalFeesUsd) : '-'}</div>
        </div>
        <div className="rounded-md border border-black/10 dark:border-white/10 p-2">
          <div className="text-xs opacity-60 flex items-center gap-2">
            Tips
            <MetricTooltip label="How are tips generated?">
              Tips use average health, status distribution, and estimated USD fees to suggest next actions.
            </MetricTooltip>
          </div>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            {tips.slice(0, 3).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function fmtUsd(v: number) {
  if (!Number.isFinite(v) || v <= 0) return "-";
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

