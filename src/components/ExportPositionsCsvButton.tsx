"use client";

type Position = {
  id: string;
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  liquidity: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
  collectedFeesToken0: string;
  collectedFeesToken1: string;
};

export default function ExportPositionsCsvButton({ positions, prices, label, disabled }: { positions: Position[]; prices?: Record<string, number>; label?: string; disabled?: boolean }) {
  function onExport() {
    if (disabled || !positions || positions.length === 0) return;
    try {
      const { toCsv, downloadCsv } = require("@/lib/csv");
      const headers = [
        "position_id","token0","token1","liq_raw","fee0_raw","fee1_raw","fee0","fee1","fee0_usd","fee1_usd","fees_total_usd"
      ];
      const rows = (positions || []).map(p => {
        const d0 = Number(p.token0.decimals || 18);
        const d1 = Number(p.token1.decimals || 18);
        const f0Raw = BigInt(p.uncollectedFeesToken0 || '0') + BigInt(p.collectedFeesToken0 || '0');
        const f1Raw = BigInt(p.uncollectedFeesToken1 || '0') + BigInt(p.collectedFeesToken1 || '0');
        const f0 = Number(f0Raw) / Math.pow(10, d0);
        const f1 = Number(f1Raw) / Math.pow(10, d1);
        const px0 = prices?.[p.token0.id.toLowerCase()] || 0;
        const px1 = prices?.[p.token1.id.toLowerCase()] || 0;
        const usd0 = f0 * px0;
        const usd1 = f1 * px1;
        return [
          p.id,
          p.token0.symbol,
          p.token1.symbol,
          p.liquidity,
          String(f0Raw),
          String(f1Raw),
          f0.toFixed(8),
          f1.toFixed(8),
          usd0.toFixed(2),
          usd1.toFixed(2),
          (usd0 + usd1).toFixed(2),
        ];
      });
      const csv = toCsv(headers, rows);
      downloadCsv(`positions_${new Date().toISOString().slice(0,10)}.csv`, csv);
    } catch {}
  }
  return (
    <button
      onClick={onExport}
      disabled={!!disabled}
      title={disabled ? 'No positions to export' : 'Export positions to CSV'}
      aria-label={disabled ? 'No positions to export' : 'Export positions to CSV'}
      className={`text-xs underline ${disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
    >
      {label || 'Export Positions CSV'}
    </button>
  );
}
