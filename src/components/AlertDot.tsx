"use client";

import React from "react";

export default function AlertDot({ poolId, className = "" }: { poolId: string; className?: string }) {
  const [hasAlert, setHasAlert] = React.useState(false);
  React.useEffect(() => {
    try {
      if (!poolId || typeof window === 'undefined') return;
      const load = () => {
        try {
          const raw = localStorage.getItem('pp_alerts');
          const now = Date.now();
          const cutoff = now - 24 * 3600 * 1000;
          let found = false;
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              const id = poolId.toLowerCase();
              for (const t of arr) {
                if (t?.poolId && String(t.poolId).toLowerCase() === id && Number(t.ts) >= cutoff) { found = true; break; }
              }
            }
          }
          setHasAlert(found);
        } catch {}
      };
      load();
      const onStorage = (e: StorageEvent) => { if (e.key === 'pp_alerts') load(); };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch {}
  }, [poolId]);
  if (!hasAlert) return null;
  return <span className={`text-[10px] text-red-600 ${className}`} title="Recent alert" aria-label="Recent alert">•</span>;
}

