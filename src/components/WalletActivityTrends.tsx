"use client";

import { useEffect, useMemo, useState } from "react";

type Item = { ts?: number; type?: string };

export default function WalletActivityTrends() {
  const [items, setItems] = useState<Item[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pp_activity');
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const days = useMemo(() => lastNDays(7), []);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of days) map.set(d, 0);
    for (const it of items) {
      const d = it?.ts ? new Date(it.ts).toISOString().slice(0, 10) : '';
      if (map.has(d)) map.set(d, (map.get(d) || 0) + 1);
    }
    return days.map(d => ({ date: d, count: map.get(d) || 0 }));
  }, [items, days]);

  const max = counts.reduce((m, r) => Math.max(m, r.count), 0) || 1;

  if (items.length === 0) return null;

  return (
    <div className="card-pool p-4">
      <div className="text-xs opacity-60 mb-2">Activity (7 days)</div>
      <div className="grid gap-1">
        {counts.map((r) => (
          <div key={r.date} className="flex items-center gap-2 text-xs">
            <div className="w-14 opacity-60">{r.date.slice(5)}</div>
            <div className="h-2 bg-[var(--surface)] rounded w-full">
              <div className="h-2 bg-[var(--pool-blue)] rounded" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
            <div className="w-6 text-right">{r.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function lastNDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

