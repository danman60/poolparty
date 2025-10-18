"use client";
import MetricTooltip from "@/components/advisor/MetricTooltip";

import { estimateDailyEarnings } from "@/lib/earnings";

type Position = {
  token0: { id: string; decimals: string };
  token1: { id: string; decimals: string };
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
};

export default function WalletAtGlance({ positions, prices }: { positions: Position[]; prices?: Record<string, number> }) {
  const totalFeesUsd = sumFeesUsd(positions, prices);
  const ts = readActivityTimestamps();
  const estDaily = estimateDailyEarnings(totalFeesUsd, ts || []);

  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
      <div className="col-span-2 md:col-span-3 -mt-1 -mb-1">
        <MetricTooltip label="How estimated?">
          Portfolio Value uses deposited tokens plus uncollected fees with current token prices. Estimated earnings/day divides total fees USD by days since earliest local activity (increase/collect).
        </MetricTooltip>
      </div>
      <div>
        <div className="text-xs opacity-60">Visible Positions</div>
        <div className="font-semibold">{(positions || []).length}</div>
      </div>
      <div>
        <div className="text-xs opacity-60">Total Fees (USD)</div>
        <div className="font-semibold">{fmtUsd(totalFeesUsd)}</div>
      </div>
      <div>
        <div className="text-xs opacity-60">Est. Earnings / Day</div>
        <div className="font-semibold">{estDaily == null ? '-' : fmtUsd(estDaily)}</div>
      </div>
    </div>
  );
}

function sumFeesUsd(positions: Position[], prices?: Record<string, number>) {
  if (!prices) return 0;
  let sum = 0;
  for (const p of positions || []) {
    const d0 = Number(p.token0.decimals || 18);
    const d1 = Number(p.token1.decimals || 18);
    const px0 = prices[p.token0.id.toLowerCase()] || 0;
    const px1 = prices[p.token1.id.toLowerCase()] || 0;
    const f0 = Number((BigInt(p.collectedFeesToken0 || '0') + BigInt(p.uncollectedFeesToken0 || '0'))) / Math.pow(10, d0);
    const f1 = Number((BigInt(p.collectedFeesToken1 || '0') + BigInt(p.uncollectedFeesToken1 || '0'))) / Math.pow(10, d1);
    sum += f0 * px0 + f1 * px1;
  }
  return sum;
}

function readActivityTimestamps(): number[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('pp_activity') : null;
    if (!raw) return [];
    const items = JSON.parse(raw) as Array<{ ts?: number; type?: string }>;
    return items
      .filter(it => it && (it.type === 'increase' || it.type === 'collect'))
      .map(it => it.ts || 0)
      .filter(Boolean);
  } catch { return []; }
}

function fmtUsd(v: number) {
  if (!Number.isFinite(v) || v <= 0) return "-";
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}
