"use client";

import { useEffect, useState } from "react";

export type WatchItem = { id: string; name?: string };

function read(): WatchItem[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('pp_watchlist') : null;
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x) => x && typeof x.id === 'string') : [];
  } catch { return []; }
}

function write(items: WatchItem[]) {
  try { if (typeof window !== 'undefined') localStorage.setItem('pp_watchlist', JSON.stringify(items)); } catch {}
  try { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('pp:watchlist:changed')); } catch {}
}

export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>([]);

  useEffect(() => {
    setItems(read());
    const onChange = () => setItems(read());
    if (typeof window !== 'undefined') window.addEventListener('pp:watchlist:changed', onChange as any);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('pp:watchlist:changed', onChange as any); };
  }, []);

  function add(item: WatchItem) {
    const curr = read();
    if (curr.some((x) => x.id.toLowerCase() === item.id.toLowerCase())) return;
    const next = [...curr, item];
    write(next);
    setItems(next);
  }

  function remove(id: string) {
    const next = read().filter((x) => x.id.toLowerCase() !== id.toLowerCase());
    write(next);
    setItems(next);
  }

  function toggle(item: WatchItem) {
    const curr = read();
    if (curr.some((x) => x.id.toLowerCase() === item.id.toLowerCase())) remove(item.id); else add(item);
  }

  function isWatched(id: string) {
    return read().some((x) => x.id.toLowerCase() === id.toLowerCase());
  }

  return { items, add, remove, toggle, isWatched };
}

