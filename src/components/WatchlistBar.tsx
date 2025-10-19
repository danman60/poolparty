"use client";

import { useEffect, useState } from "react";
import { useWatchlist } from "./WatchlistStore";
import AdvisorBadge from "./advisor/AdvisorBadge";
import PoolsMomentumBadge from "./advisor/PoolsMomentumBadge";
import PoolsFeeMomentumBadge from "./advisor/PoolsFeeMomentumBadge";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";

type Status = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';
function statusFromVtvlScore(score: number): Status {
  if (score >= 9) return 'excellent';
  if (score >= 7) return 'good';
  if (score >= 5) return 'warning';
  if (score >= 3) return 'danger';
  return 'critical';
}

export default function WatchlistBar() {
  const { items, remove } = useWatchlist();
  const [snapshots, setSnapshots] = useState<Record<string, { tvl: number; vol: number } | null>>({});
  const [alertIds, setAlertIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let canceled = false;
    async function load() {
      const next: Record<string, { tvl: number; vol: number } | null> = {};
      const ids = (items || []).map((i) => i.id);
      await Promise.all(ids.map(async (id) => {
        try {
          const res = await fetch(`/api/pools/${id}/metrics`, { cache: 'no-store' });
          const json = await res.json();
          const rows = Array.isArray(json?.data) ? json.data : [];
          const last = rows[rows.length - 1];
          if (last) next[id] = { tvl: Number(last.tvlUSD || 0), vol: Number(last.volumeUSD || 0) };
          else next[id] = null;
        } catch {
          next[id] = null;
        }
      }));
      if (!canceled) setSnapshots(next);
    }
    if (items && items.length) load(); else setSnapshots({});
    return () => { canceled = true };
  }, [items?.map((i) => i.id).join(',')]);

  useEffect(() => {
    try {
      const load = () => {
        try {
          if (typeof window === 'undefined') return;
          const raw = localStorage.getItem('pp_alerts');
          const now = Date.now();
          const cutoff = now - 24 * 3600 * 1000;
          const set = new Set<string>();
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) arr.forEach((t: any) => { if (t?.poolId && t.ts >= cutoff) set.add(String(t.poolId).toLowerCase()); });
          }
          setAlertIds(set);
        } catch {}
      };
      load();
      const onStorage = (e: StorageEvent) => { if (e.key === 'pp_alerts') load(); };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch {}
  }, []);

  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-2 overflow-x-auto">
      <div className="flex items-center gap-2 text-xs opacity-70 mb-1">Watchlist</div>
      <div className="flex items-center gap-2">
        {items.map((it) => (
          <a
            key={it.id}
            href={`/pool/${it.id}`}
            className="inline-flex items-center gap-2 px-2 py-1 rounded border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            title={it.name || it.id}
          >
            <span className="font-mono">{short(it.id)}</span>
            {alertIds.has((it.id || '').toLowerCase()) && (
              <span className="text-[10px] text-red-600" title="Recent alert" aria-label="Recent alert">⚠️</span>
            )}
            <PoolsMomentumBadge poolId={it.id} />
            <PoolsFeeMomentumBadge poolId={it.id} />
            {(() => {
              const snap = snapshots[it.id];
              if (snap && snap.tvl > 0) {
                const { score, rating } = scoreVolumeToTVL(snap.vol, snap.tvl);
                const st = statusFromVtvlScore(score);
                return <AdvisorBadge status={st as any} label={rating} />
              }
              return <AdvisorBadge status={'critical' as any} label={'-'} />
            })()}
            <button
              onClick={(e) => { e.preventDefault(); remove(it.id); }}
              className="text-xs opacity-50 hover:opacity-100"
              aria-label="Remove from watchlist"
              title="Remove"
            >
              ×
            </button>
          </a>
        ))}
      </div>
    </div>
  );
}

function short(id: string) {
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

