"use client";

import { useEffect, useState } from "react";

type ActivityItem = {
  ts: number;
  type: "collect" | "decrease" | "increase" | "close" | "burn";
  tokenId?: string;
  hash?: string;
  chainId?: number;
};

const STORAGE_KEY = "pp_activity";

function load(): ActivityItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as ActivityItem[];
  } catch {
    return [];
  }
}

function save(items: ActivityItem[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 20))); } catch {}
}

export default function RecentActivity() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    setItems(load());
    function onEvent(e: Event) {
      const detail = (e as CustomEvent).detail as ActivityItem | undefined;
      if (!detail) return;
      const next = [ { ...detail, ts: Date.now() }, ...load() ];
      save(next);
      setItems(next);
    }
    window.addEventListener("pp:activity", onEvent as any);
    return () => window.removeEventListener("pp:activity", onEvent as any);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="card-pool p-4">
      <div className="text-xs opacity-60 mb-2">Recent Activity</div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="opacity-80">
              {it.type === 'collect' && 'Collected fees'}
              {it.type === 'decrease' && 'Withdrew liquidity'}
              {it.type === 'increase' && 'Added liquidity'}
              {it.type === 'close' && 'Closed position'}
              {it.type === 'burn' && 'Burned NFT'}
              {it.tokenId ? ` · #${it.tokenId.slice(0, 6)}...` : ''}
            </span>
            <span className="opacity-60">
              {new Date(it.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

