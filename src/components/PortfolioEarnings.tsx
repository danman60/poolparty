"use client";

type Position = {
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
};

type TokenAgg = { address: string; symbol: string; decimals: number; amount: bigint };

export default function PortfolioEarnings({ positions, prices }: { positions: Position[]; prices?: Record<string, number> }) {
  const totals = aggregateFeesAll(positions);
  const totalUsd = prices ? totals.reduce((sum, t) => sum + toUsd(t, prices), 0) : 0;
  const top = totals.slice(0, 3).map(t => `${fmtAmount(t.amount, t.decimals)} ${t.symbol}`);
  const extra = totals.length > 3 ? ` +${totals.length - 3} more` : "";
  function onExportCsv() {
    try {
      const { toCsv, downloadCsv } = require("@/lib/csv");
      const headers = ["token_address","symbol","amount_raw","decimals","amount","usd"];
      const rows = totals.map(t => {
        const amt = Number(t.amount) / Math.pow(10, t.decimals || 18);
        const usd = prices ? (prices[t.address.toLowerCase()] || 0) * amt : 0;
        return [t.address, t.symbol, String(t.amount), t.decimals, amt.toFixed(8), usd.toFixed(2)];
      });
      const csv = toCsv(headers, rows);
      downloadCsv(`fees_${new Date().toISOString().slice(0,10)}.csv`, csv);
    } catch {}
  }

  return (
    <div className="card-pool p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xs opacity-60">Earnings To Date (Fees)</div>
          <div className="text-lg font-semibold">{fmtUsd(totalUsd)}</div>
        </div>
        <div className="mt-3">
          <button onClick={onExportCsv} className="text-xs underline opacity-70 hover:opacity-100">Export Fees CSV</button>
        </div>
      </div>
      <div className="mt-3 text-sm">
        <div className="opacity-60 text-xs">Collected + Uncollected (by token)</div>
        <div className="mt-1">{totals.length === 0 ? <span className="opacity-60">None</span> : <span>{top.join(", ")}{extra}</span>}</div>
      </div>
    </div>
  );
}

function aggregateFeesAll(positions: Position[]): TokenAgg[] {
  const map = new Map<string, TokenAgg>();
  for (const p of positions) {
    const t0 = p.token0; const t1 = p.token1;
    const dec0 = Number(t0.decimals || 18); const dec1 = Number(t1.decimals || 18);
    const addr0 = (t0.id || '').toLowerCase(); const addr1 = (t1.id || '').toLowerCase();
    const amt0 = safeBig(p.collectedFeesToken0) + safeBig(p.uncollectedFeesToken0);
    const amt1 = safeBig(p.collectedFeesToken1) + safeBig(p.uncollectedFeesToken1);
    if (!map.has(addr0)) map.set(addr0, { address: t0.id, symbol: t0.symbol, decimals: dec0, amount: 0n });
    if (!map.has(addr1)) map.set(addr1, { address: t1.id, symbol: t1.symbol, decimals: dec1, amount: 0n });
    map.get(addr0)!.amount += amt0;
    map.get(addr1)!.amount += amt1;
  }
  return Array.from(map.values()).sort((a, b) => Number(b.amount) - Number(a.amount));
}

function safeBig(v?: string | number | null): bigint { try { return BigInt(v || 0); } catch { return 0n; } }

function fmtAmount(amount: bigint, decimals: number): string {
  if (amount === 0n) return "0";
  const n = Number(amount) / Math.pow(10, decimals || 18);
  if (!Number.isFinite(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "k";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.00001) return n.toFixed(5);
  return "~0";
}

function toUsd(t: TokenAgg, prices: Record<string, number>): number {
  const price = prices[t.address.toLowerCase()] || 0;
  if (!price) return 0;
  const n = Number(t.amount) / Math.pow(10, t.decimals || 18);
  return n * price;
}

function fmtUsd(v: number) {
  if (!Number.isFinite(v) || v <= 0) return "-";
  return v.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}
