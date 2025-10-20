"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "./ToastProvider";

export default function NotificationBell() {
  const { items, unread, markAllRead } = useToast();
  const [open, setOpen] = useState(false);
  const [muteAllUntil, setMuteAllUntil] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // load global mute on mount
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const mu = localStorage.getItem('pp_alert_mute_all_until');
      if (mu) {
        const ts = Number(mu);
        if (Number.isFinite(ts)) setMuteAllUntil(ts);
      }
    } catch {}
  }, []);

  // Handle click outside and escape key
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const globallyMuted = muteAllUntil != null && muteAllUntil > Date.now();
  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 ${globallyMuted ? 'opacity-60' : ''}`}
        aria-label={globallyMuted ? "Notifications (muted)" : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => { setOpen(v => !v); if (!open) markAllRead(); }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
        {globallyMuted && (
          <span className="absolute -bottom-1 -left-1 text-[10px]" title="Muted">🔕</span>
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1 min-w-4 text-center" aria-label={`${unread} unread notifications`}>{unread}</span>
        )}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className="dropdown absolute right-0 mt-2 w-80 max-h-96 overflow-auto"
          role="dialog"
          aria-label="Notifications panel"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs opacity-60">Recent alerts</div>
            <label className="inline-flex items-center gap-1 text-[11px] opacity-80">
              <input type="checkbox" checked={items && (items as any).prefs ? (items as any).prefs.volatility : undefined} onChange={() => { /* no-op fallback */ }} className="hidden" />
            </label>
          </div>
          <div className="mb-2 text-[11px] opacity-80 flex items-center justify-between">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={useToast().prefs.volatility} onChange={(e) => useToast().setPref('volatility', e.target.checked)} aria-label="Toggle volatility alerts" />
              Volatility alerts
            </label>
            <div className="inline-flex items-center gap-2">
              {muteAllUntil && muteAllUntil > Date.now() ? (
                <>
                  <span>Muted until {new Date(muteAllUntil).toLocaleTimeString()}</span>
                  <button className="underline" onClick={() => { try { localStorage.removeItem('pp_alert_mute_all_until'); setMuteAllUntil(null); } catch {} }}>Unmute all</button>
                </>
              ) : (
                <>
                  <button className="underline" onClick={() => { const ts = Date.now() + 60*60*1000; try { localStorage.setItem('pp_alert_mute_all_until', String(ts)); setMuteAllUntil(ts); } catch {} }}>Mute 1h</button>
                  <button className="underline" onClick={() => { const ts = Date.now() + 8*60*60*1000; try { localStorage.setItem('pp_alert_mute_all_until', String(ts)); setMuteAllUntil(ts); } catch {} }}>Mute 8h</button>
                  <button className="underline" onClick={() => { const ts = Date.now() + 24*60*60*1000; try { localStorage.setItem('pp_alert_mute_all_until', String(ts)); setMuteAllUntil(ts); } catch {} }}>Mute 24h</button>
                </>
              )}
            </div>
          </div>
          {items.length === 0 && <div className="text-xs opacity-60">No alerts yet</div>}
          {items.slice().reverse().map((t) => (
            <div key={t.id} className="text-sm py-1 border-b border-black/5 dark:border-white/5 last:border-none">
              <div className="flex items-center justify-between gap-2">
                <div>{t.message}</div>
                {t.poolId && (
                  <a className="text-[11px] underline opacity-80 hover:opacity-100" href={`/pool/${t.poolId}`}>Open</a>
                )}
              </div>
              <div className="text-[10px] opacity-60">{new Date(t.ts).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
