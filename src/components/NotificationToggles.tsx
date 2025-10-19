"use client";

import React from "react";

export default function NotificationToggles({ poolId }: { poolId: string }) {
  const [vol, setVol] = React.useState(true);
  const [muteUntil, setMuteUntil] = React.useState<number | null>(null);

  React.useEffect(() => {
    try {
      if (!poolId || typeof window === 'undefined') return;
      const raw = localStorage.getItem(`pp_alert_prefs_pool_${poolId}`);
      if (raw) {
        const obj = JSON.parse(raw);
        if (typeof obj?.volatility === 'boolean') setVol(obj.volatility);
      }
      const mu = localStorage.getItem(`pp_alert_mute_until_${poolId}`);
      if (mu) {
        const ts = Number(mu);
        if (Number.isFinite(ts)) setMuteUntil(ts);
      }
    } catch {}
  }, [poolId]);

  function onToggleVol(next: boolean) {
    setVol(next);
    try {
      const obj = { volatility: next };
      localStorage.setItem(`pp_alert_prefs_pool_${poolId}`, JSON.stringify(obj));
      // fire storage event for same-tab listeners
      window.dispatchEvent(new StorageEvent('storage', { key: `pp_alert_prefs_pool_${poolId}`, newValue: JSON.stringify(obj) } as any));
    } catch {}
  }

  return (
    <div className="text-xs opacity-80 inline-flex items-center gap-3">
      <label className="inline-flex items-center gap-2">
        <input type="checkbox" checked={vol} onChange={(e) => onToggleVol(e.target.checked)} aria-label="Volatility alerts for this pool" />
        Volatility alerts (this pool)
      </label>
      <span className="inline-flex items-center gap-2">
        {muteUntil && muteUntil > Date.now() ? (
          <>
            <span className="opacity-70">Muted until {new Date(muteUntil).toLocaleTimeString()}</span>
            <button className="underline" onClick={() => { try { localStorage.removeItem(`pp_alert_mute_until_${poolId}`); setMuteUntil(null); } catch {} }}>Unmute</button>
          </>
        ) : (
          <>
            <button className="underline" onClick={() => { try { const ts = Date.now() + 60*60*1000; localStorage.setItem(`pp_alert_mute_until_${poolId}`, String(ts)); setMuteUntil(ts); } catch {} }}>Mute 1h</button>
            <button className="underline" onClick={() => { try { const ts = Date.now() + 8*60*60*1000; localStorage.setItem(`pp_alert_mute_until_${poolId}`, String(ts)); setMuteUntil(ts); } catch {} }}>8h</button>
            <button className="underline" onClick={() => { try { const ts = Date.now() + 24*60*60*1000; localStorage.setItem(`pp_alert_mute_until_${poolId}`, String(ts)); setMuteUntil(ts); } catch {} }}>24h</button>
          </>
        )}
      </span>
    </div>
  );
}
