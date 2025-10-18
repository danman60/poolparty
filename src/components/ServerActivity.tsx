"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

type Row = { wallet: string; token_id: string; action: string; tx_hash: string | null; chain: number | null; created_at: string };

export default function ServerActivity({ limit = 10 }: { limit?: number }) {
  const { address, isConnected } = useAccount();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isConnected || !address) { setRows([]); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/wallet/activity?address=${address}&limit=${limit}`, { cache: 'no-store' });
        const json = await res.json();
        if (!cancelled) setRows(json?.data || []);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 15000);
    return () => { cancelled = true; clearInterval(id); };
  }, [address, isConnected, limit]);

  async function loadMore() {
    if (!isConnected || !address || rows.length === 0) return;
    setLoadingMore(true);
    try {
      const before = encodeURIComponent(rows[rows.length - 1].created_at);
      const res = await fetch(`/api/wallet/activity?address=${address}&limit=${limit}&before=${before}`, { cache: 'no-store' });
      const json = await res.json();
      if (Array.isArray(json?.data) && json.data.length > 0) {
        setRows(prev => [...prev, ...json.data]);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  function exportCsv() {
    try {
      const { toCsv, downloadCsv } = require("@/lib/csv");
      const headers = ["wallet","token_id","action","tx_hash","chain","created_at"];
      const rows = rowsRef().map(r => [r.wallet, r.token_id, r.action, r.tx_hash || '', r.chain || '', r.created_at]);
      const csv = toCsv(headers, rows);
      downloadCsv(`activity_${new Date().toISOString().slice(0,10)}.csv`, csv);
    } catch {}
  }

  function rowsRef() { return rows; }

  if (!isConnected || rows.length === 0) return null;

  return (
    <div className="card-pool p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs opacity-60">Recent On-Chain Activity</div>
        <div className="flex items-center gap-3">
          <button onClick={exportCsv} className="text-[11px] underline opacity-70 hover:opacity-100">Export CSV</button>
          {loading && <div className="text-[10px] opacity-40">Refreshing...</div>}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="opacity-80">
              {label(r.action)} {r.token_id ? `· #${r.token_id.slice(0, 6)}...` : ''}
            </span>
            <span className="opacity-60">
              {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <button onClick={loadMore} className="text-[11px] underline opacity-70 hover:opacity-100" disabled={loadingMore}>
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      </div>
    </div>
  );
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
