"use client";

type Position = {
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
  collectedFeesToken0?: string;
  collectedFeesToken1?: string;
};

type TokenAgg = { address: string; symbol: string; decimals: number; amount: bigint };

function aggregateFees(positions: Position[]): TokenAgg[] {
  const map = new Map<string, TokenAgg>();
  for (const p of positions) {
    const t0 = p.token0; const t1 = p.token1;
    const dec0 = Number(t0.decimals || 18); const dec1 = Number(t1.decimals || 18);
    const addr0 = (t0.id || '').toLowerCase(); const addr1 = (t1.id || '').toLowerCase();
    const fee0 = (BigInt(p.collectedFeesToken0 || '0') + BigInt(p.uncollectedFeesToken0 || '0'));
    const fee1 = (BigInt(p.collectedFeesToken1 || '0') + BigInt(p.uncollectedFeesToken1 || '0'));
    if (!map.has(addr0)) map.set(addr0, { address: t0.id, symbol: t0.symbol, decimals: dec0, amount: 0n });
    if (!map.has(addr1)) map.set(addr1, { address: t1.id, symbol: t1.symbol, decimals: dec1, amount: 0n });
    map.get(addr0)!.amount += fee0;
    map.get(addr1)!.amount += fee1;
  }
  return Array.from(map.values()).sort((a, b) => Number(b.amount) - Number(a.amount));
}

export default function ExportFeesCsvButton({ positions, prices, label, disabled }: { positions: Position[]; prices?: Record<string, number>; label?: string; disabled?: boolean }) {
  function onExport() {
    if (disabled || !positions || positions.length === 0) return;
    try {
      const { toCsv, downloadCsv } = require("@/lib/csv");
      const totals = aggregateFees(positions);
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
    <button
      onClick={onExport}
      disabled={!!disabled}
      title={disabled ? 'No positions to export' : 'Export fees to CSV'}
      aria-label={disabled ? 'No positions to export' : 'Export fees to CSV'}
      className={`text-xs underline ${disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
    >
      {label || 'Export Fees CSV'}
    </button>
  );
}
