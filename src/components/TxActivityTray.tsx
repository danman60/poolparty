"use client";

import { useEffect, useState } from "react";
import { txUrl } from "@/lib/explorer";

type Activity = {
  ts: number;
  type: string;
  tokenId?: string;
  hash?: `0x${string}`;
  chain?: number;
};

function read(): Activity[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('pp_activity') : null;
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((a) => a && typeof a.ts === 'number') : [];
  } catch { return []; }
}

function write(items: Activity[]) {
  try { if (typeof window !== 'undefined') localStorage.setItem('pp_activity', JSON.stringify(items.slice(-20))); } catch {}
}

export default function TxActivityTray() {
  const [items, setItems] = useState<Activity[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setItems(read());
    function onActivity(e: any) {
      try {
        const detail = e?.detail || {};
        const next: Activity = { ts: Date.now(), type: String(detail.type || 'activity'), tokenId: detail.tokenId, hash: detail.hash, chain: detail.chain };
        const curr = [...read(), next].slice(-20);
        write(curr);
        setItems(curr);
      } catch {}
    }
    if (typeof window !== 'undefined') window.addEventListener('pp:activity', onActivity as any);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('pp:activity', onActivity as any); };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50">
      <div className="rounded-lg border border-black/10 dark:border-white/10 bg-[var(--surface)]/90 backdrop-blur p-3 shadow max-w-[320px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs opacity-70">Recent Activity</div>
          <div className="flex items-center gap-2">
            <button className="text-[11px] underline opacity-70 hover:opacity-100" onClick={() => setOpen(!open)} aria-label="Toggle activity tray">{open ? 'Hide' : 'Show'}</button>
            <button className="text-[11px] underline opacity-70 hover:opacity-100" onClick={() => { write([]); setItems([]); }} aria-label="Clear activity">Clear</button>
          </div>
        </div>
        {open && (
          <ul className="space-y-1 text-xs max-h-[200px] overflow-auto">
            {[...items].reverse().slice(0, 8).map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="opacity-70">{fmtType(a.type)}{a.tokenId ? ` #${short(a.tokenId)}` : ''}</span>
                {a.hash && (
                  <a
                    className="underline opacity-70 hover:opacity-100"
                    href={txUrl(a.chain ?? 1, a.hash)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View transaction"
                  >
                    View
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function short(id: string) {
  return `${id.slice(0, 4)}…${id.slice(-4)}`;
}

function fmtType(t: string) {
  switch (t) {
    case 'collect': return 'Collect';
    case 'increase': return 'Add';
    case 'decrease': return 'Withdraw';
    case 'burn': return 'Close';
    case 'close': return 'Close';
    default: return t;
  }
}

