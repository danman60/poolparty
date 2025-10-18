"use client";
import { estimateDailyEarnings } from "@/lib/earnings";

type Position = {
  id: string;
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  depositedToken0: string;
  depositedToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
};

type TokenAgg = {
  address: string;
  symbol: string;
  decimals: number;
  amount: bigint;
};

function formatTokenAmount(amount: bigint, decimals: number): string {
  if (amount === 0n) return "0";
  const asNumber = Number(amount) / Math.pow(10, decimals || 18);
  if (!Number.isFinite(asNumber)) return "0";
  if (asNumber >= 1_000_000) return (asNumber / 1_000_000).toFixed(2) + "M";
  if (asNumber >= 1_000) return (asNumber / 1_000).toFixed(2) + "k";
  if (asNumber >= 1) return asNumber.toFixed(2);
  if (asNumber >= 0.00001) return asNumber.toFixed(5);
  return "~0";
}

function aggregateFees(positions: Position[]): TokenAgg[] {
  const map = new Map<string, TokenAgg>();
  for (const p of positions) {
    const t0Key = p.token0.id.toLowerCase();
    const t1Key = p.token1.id.toLowerCase();
    const dec0 = Number(p.token0.decimals || 18);
    const dec1 = Number(p.token1.decimals || 18);
    const fee0 = BigInt(p.uncollectedFeesToken0 || "0");
    const fee1 = BigInt(p.uncollectedFeesToken1 || "0");
    if (!map.has(t0Key)) map.set(t0Key, { address: p.token0.id, symbol: p.token0.symbol, decimals: dec0, amount: 0n });
    if (!map.has(t1Key)) map.set(t1Key, { address: p.token1.id, symbol: p.token1.symbol, decimals: dec1, amount: 0n });
    map.get(t0Key)!.amount += fee0;
    map.get(t1Key)!.amount += fee1;
  }
  // Sort by largest USD proxy (we don't have USD; sort by native amount after scaling)
  return Array.from(map.values()).sort((a, b) => {
    const aNum = Number(a.amount) / Math.pow(10, a.decimals || 18);
    const bNum = Number(b.amount) / Math.pow(10, b.decimals || 18);
    return bNum - aNum;
  });
}

export default function PortfolioSummary({ positions, prices }: { positions: Position[]; prices?: Record<string, number> }) {
  const count = positions.length;
  const withFees = positions.filter(p => {
    try {
      return BigInt(p.uncollectedFeesToken0 || "0") > 0n || BigInt(p.uncollectedFeesToken1 || "0") > 0n;
    } catch {
      return false;
    }
  }).length;

  const feeAgg = aggregateFees(positions);
  const totalFeesUsd = (prices ? feeAgg.reduce((sum, t) => {
    const p = prices[t.address.toLowerCase()];
    if (!p) return sum;
    const asNumber = Number(t.amount) / Math.pow(10, t.decimals || 18);
    return sum + (asNumber * p);
  }, 0) : 0);
  const top = feeAgg.slice(0, 3).map(t => `${formatTokenAmount(t.amount, t.decimals)} ${t.symbol}`);
  const extra = feeAgg.length > 3 ? ` +${feeAgg.length - 3} more` : "";

  // Approximate total portfolio value from deposited token amounts + uncollected fees
  const totalDepositsUsd = (prices ? positions.reduce((sum, p) => {
    const d0 = Number(p.token0.decimals || 18);
    const d1 = Number(p.token1.decimals || 18);
    const px0 = prices[p.token0.id.toLowerCase()] || 0;
    const px1 = prices[p.token1.id.toLowerCase()] || 0;
    const dep0 = Number(p.depositedToken0 || 0) / Math.pow(10, d0);
    const dep1 = Number(p.depositedToken1 || 0) / Math.pow(10, d1);
    return sum + dep0 * px0 + dep1 * px1;
  }, 0) : 0);

  // Heuristic estimated daily earnings using activity timestamps
  let estDailyUsd: number | null = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('pp_activity') : null;
    const ts = raw ? (JSON.parse(raw) as Array<{ ts?: number; type?: string }>)
      .filter(it => it && (it.type === 'increase' || it.type === 'collect'))
      .map(it => it.ts || 0)
      .filter(Boolean) : [];
    estDailyUsd = estimateDailyEarnings(totalFeesUsd, ts as number[]);
  } catch {}

  return (
    <div className="card-pool p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs opacity-60">Portfolio Summary</div>
          <div className="text-lg font-semibold">
            {count} {count === 1 ? "Position" : "Positions"}
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="text-xs opacity-60">Positions With Fees</div>
          <div className="font-medium">{withFees}</div>
          {prices && (
            <div className="text-xs opacity-60 mt-2">Portfolio Value</div>
          )}
          {prices && (
            <div className="font-medium">{fmtUsd(totalDepositsUsd + totalFeesUsd)}</div>
          )}
        </div>
      </div>
      <div className="mt-3 text-sm">
        {prices && (
          <div className="mb-2">
            <div className="opacity-60 text-xs">Uncollected Fees (USD)</div>
            <div className="font-semibold">{fmtUsd(totalFeesUsd)}</div>
          </div>
        )}
        {prices && (
          <div className="mb-2">
            <div className="opacity-60 text-xs">Estimated Earnings / Day</div>
            <div className="font-semibold">{estDailyUsd == null ? '-' : fmtUsd(estDailyUsd)}</div>
          </div>
        )}
        <div className="opacity-60 text-xs">Uncollected Fees (by token)</div>
        <div className="mt-1">
          {feeAgg.length === 0 ? (
            <span className="opacity-60">None</span>
          ) : (
            <span>{top.join(", ")}{extra}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function fmtUsd(v: number) {
  if (!Number.isFinite(v) || v <= 0) return "-";
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}
