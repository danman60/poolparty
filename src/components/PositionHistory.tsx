"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { toCsv, downloadCsv } from "@/lib/csv";

type ActivityItem = { ts?: number; created_at?: string; type?: string; action?: string; tokenId?: string; token_id?: string };

export default function PositionHistory({ tokenId, limit = 10 }: { tokenId: string; limit?: number }) {
  const { address, isConnected } = useAccount();
  const [rows, setRows] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isConnected || !address || !tokenId) { setRows([]); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/wallet/activity?address=${address}&tokenId=${tokenId}&limit=${limit}`, { cache: 'no-store' });
        const json = await res.json();
        const serverRows: ActivityItem[] = Array.isArray(json?.data) ? json.data : [];
        // Merge local activity for this tokenId
        let local: ActivityItem[] = [];
        try {
          const raw = localStorage.getItem('pp_activity');
          if (raw) {
            local = (JSON.parse(raw) as ActivityItem[]).filter(it => (it.tokenId || it.token_id) === tokenId);
          }
        } catch {}
        const merged = [...local.map(it => ({ ...it, created_at: new Date(it.ts || Date.now()).toISOString(), action: it.type })), ...serverRows];
        if (!cancelled) setRows(merged.slice(0, limit));
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, [address, isConnected, tokenId, limit]);

  if (!isConnected || rows.length === 0) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="text-xs opacity-60">Position Activity</div>
        <button
          onClick={() => exportCsv(rows, tokenId)}
          className="text-[11px] underline opacity-70 hover:opacity-100"
          title="Export this position's activity as CSV"
        >
          Export CSV
        </button>
      </div>
      <div className="space-y-1 text-xs">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="opacity-80">{label(r.action || r.type)}</span>
            <span className="opacity-60">{fmtTime(r.created_at)}</span>
          </div>
        ))}
        {loading && <div className="text-[10px] opacity-40">Refreshing...</div>}
      </div>
    </div>
  );
}

function exportCsv(items: ActivityItem[], tokenId: string) {
  try {
    const headers = ["token_id","action","tx_hash","chain","created_at"];
    const rows = (items || []).map((it) => [
      tokenId,
      (it.action || it.type || ''),
      (it as any)?.hash || '',
      (it as any)?.chainId || '',
      it.created_at || (it.ts ? new Date(it.ts).toISOString() : ''),
    ]);
    const csv = toCsv(headers, rows as any);
    downloadCsv(`position_${tokenId}_activity_${new Date().toISOString().slice(0,10)}.csv`, csv);
  } catch {}
}

function label(a?: string | null) {
  switch ((a || '').toLowerCase()) {
    case 'collect': return 'Collected fees';
    case 'increase': return 'Added liquidity';
    case 'decrease': return 'Withdrew liquidity';
    case 'burn': return 'Burned NFT';
    case 'close': return 'Closed position';
    default: return a || '-';
  }
}

function fmtTime(s?: string) {
  if (!s) return '';
  try { return new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
}
