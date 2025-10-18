"use client";
import MetricTooltip from "@/components/advisor/MetricTooltip";

type Position = {
  token0: { id: string; decimals: string };
  token1: { id: string; decimals: string };
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
};

export default function WalletVisibleStats({ positions, prices }: { positions: Position[]; prices?: Record<string, number> }) {
  const count = (positions || []).length;
  const feesUsd = sumFeesUsd(positions, prices);
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-1">
      <MetricTooltip label="Visible set">
        Exports and batch actions operate on the visible set. Toggle the filter to change which positions are included.
      </MetricTooltip>
      <Badge label="Visible" value={String(count)} />
      <Badge label="Fees (USD)" value={feesUsd <= 0 ? '-' : fmtUsd(feesUsd)} />
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-black/10 dark:border-white/10 px-3 py-1 text-xs whitespace-nowrap">
      <span className="opacity-60 mr-1">{label}</span>
      <span className="font-medium">{value}</span>
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

function fmtUsd(v: number) {
  if (!Number.isFinite(v) || v <= 0) return "-";
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}
