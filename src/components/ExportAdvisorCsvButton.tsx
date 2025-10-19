"use client";

import { calculateHealthScore } from "@/lib/lifeguard/healthScore";

type Position = {
  id: string;
  poolId?: string;
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
  collectedFeesToken0?: string;
  collectedFeesToken1?: string;
};

export default function ExportAdvisorCsvButton({ positions, prices, label, disabled }: { positions: Position[]; prices?: Record<string, number>; label?: string; disabled?: boolean }) {
  function onExport() {
    if (disabled || !positions || positions.length === 0) return;
    try {
      const { toCsv, downloadCsv } = require("@/lib/csv");
      const headers = [
        "position_id","pool_id","token0","token1","health_score","status","fees_usd","recent_alert_24h"
      ];
      // Load recent alert set (last 24h) from persisted notifications
      let recentAlertSet = new Set<string>();
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('pp_alerts');
          const now = Date.now();
          const cutoff = now - 24 * 3600 * 1000;
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              for (const t of arr) {
                if (t?.poolId && Number(t.ts) >= cutoff) {
                  recentAlertSet.add(String(t.poolId).toLowerCase());
                }
              }
            }
          }
        }
      } catch {}
      const rows = (positions || []).map(p => {
        const health = calculateHealthScore(p as any);
        const status = health.status?.color || '';
        let feesUsd = 0;
        try {
          if (prices) {
            const d0 = Number(p.token0.decimals || 18);
            const d1 = Number(p.token1.decimals || 18);
            const px0 = prices[p.token0.id.toLowerCase()] || 0;
            const px1 = prices[p.token1.id.toLowerCase()] || 0;
            const f0 = Number((BigInt(p.collectedFeesToken0 || '0') + BigInt(p.uncollectedFeesToken0 || '0'))) / Math.pow(10, d0);
            const f1 = Number((BigInt(p.collectedFeesToken1 || '0') + BigInt(p.uncollectedFeesToken1 || '0'))) / Math.pow(10, d1);
            feesUsd = f0 * px0 + f1 * px1;
          }
        } catch {}
        const recent = p.poolId ? recentAlertSet.has(String(p.poolId).toLowerCase()) : false;
        return [
          p.id,
          p.poolId || '-',
          p.token0.symbol,
          p.token1.symbol,
          health.overall,
          status,
          (feesUsd || 0).toFixed(2),
          recent ? '1' : '0',
        ];
      });
      const csv = toCsv(headers, rows);
      downloadCsv(`advisor_${new Date().toISOString().slice(0,10)}.csv`, csv);
    } catch {}
  }
  return (
    <button
      onClick={onExport}
      disabled={!!disabled}
      title={disabled ? 'No positions to export' : 'Export advisor metrics to CSV'}
      aria-label={disabled ? 'No positions to export' : 'Export advisor metrics to CSV'}
      className={`text-xs underline ${disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
    >
      {label || 'Export Advisor CSV'}
    </button>
  );
}
