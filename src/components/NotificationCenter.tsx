"use client";

import React, { useEffect, useState } from "react";
import { startPoolMonitor } from "@/lib/notifications/monitor";
import { formatAlert } from "@/lib/notifications/templates";
import { useToast } from "./ToastProvider";

export default function NotificationCenter({ poolId }: { poolId: string }) {
  const { addToast, prefs } = useToast();
  const [poolVol, setPoolVol] = useState<boolean>(true);
  useEffect(() => {
    try {
      if (!poolId || typeof window === 'undefined') return;
      const raw = localStorage.getItem(`pp_alert_prefs_pool_${poolId}`);
      if (raw) {
        const obj = JSON.parse(raw);
        if (typeof obj?.volatility === 'boolean') setPoolVol(obj.volatility);
      }
      const onStorage = (e: StorageEvent) => {
        if (e.key === `pp_alert_prefs_pool_${poolId}`) {
          try { const obj = JSON.parse(e.newValue || '{}'); setPoolVol(!!obj.volatility); } catch {}
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch {}
  }, [poolId]);
  useEffect(() => {
    if (!poolId) return;
    const stop = startPoolMonitor(poolId, (kind, data) => {
      try {
        // Respect per-pool mute
        try {
          const mu = localStorage.getItem(`pp_alert_mute_until_${poolId}`);
          if (mu && Number(mu) > Date.now()) return; // muted
        } catch {}
        // Respect global mute
        try {
          const muAll = localStorage.getItem('pp_alert_mute_all_until');
          if (muAll && Number(muAll) > Date.now()) return;
        } catch {}
        const { message, type, href } = formatAlert(kind as any, data);
        addToast(message, type, href, undefined, poolId);
      } catch {}
    }, { pollMs: 45_000, volatility: prefs.volatility && poolVol });
    return () => stop();
  }, [poolId, addToast, prefs.volatility, poolVol]);
  return null;
}
