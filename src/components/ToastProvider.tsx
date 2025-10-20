"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

type Toast = { id: string; message: string; type?: "info" | "success" | "error"; href?: string; copyText?: string; ts: number; read?: boolean; poolId?: string };
type AlertPrefs = { volatility: boolean };
type Ctx = {
  addToast: (msg: string, type?: Toast["type"], href?: string, copyText?: string, poolId?: string) => void;
  items: Toast[];
  unread: number;
  markAllRead: () => void;
  prefs: AlertPrefs;
  setPref: <K extends keyof AlertPrefs>(key: K, value: AlertPrefs[K]) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [prefs, setPrefs] = useState<AlertPrefs>({ volatility: true });

  // Load persisted alerts and prefs
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem('pp_alerts');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setToasts(arr.filter(Boolean));
      }
      const p = localStorage.getItem('pp_alert_prefs');
      if (p) {
        const obj = JSON.parse(p);
        setPrefs((prev) => ({ ...prev, ...obj }));
      }
    } catch {}
  }, []);

  const addToast = useCallback((message: string, type: Toast["type"] = "info", href?: string, copyText?: string, poolId?: string) => {
    const id = Math.random().toString(36).slice(2);
    const ts = Date.now();
    setToasts((prev) => {
      const next = [...prev, { id, message, type, href, copyText, ts, read: false, poolId }];
      try {
        if (typeof window !== 'undefined') {
          const trimmed = next.slice(-50);
          localStorage.setItem('pp_alerts', JSON.stringify(trimmed));
        }
      } catch {}
      return next;
    });
    // auto dismiss visual after 4s (keep in list until read)
    setTimeout(() => {
      const el = document.getElementById(`toast-${id}`);
      if (el) el.remove();
    }, 4000);
  }, []);

  const unread = useMemo(() => toasts.filter(t => !t.read).length, [toasts]);
  const markAllRead = useCallback(() => {
    setToasts((prev) => {
      const next = prev.map(t => ({ ...t, read: true }));
      try { if (typeof window !== 'undefined') localStorage.setItem('pp_alerts', JSON.stringify(next.slice(-50))); } catch {}
      return next;
    });
  }, []);

  const setPref = useCallback(<K extends keyof AlertPrefs>(key: K, value: AlertPrefs[K]) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      try { if (typeof window !== 'undefined') localStorage.setItem('pp_alert_prefs', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const value = useMemo(() => ({ addToast, items: toasts, unread, markAllRead, prefs, setPref }), [addToast, toasts, unread, markAllRead, prefs, setPref]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed top-3 right-3 z-50 flex flex-col gap-2">
        {toasts.filter(t => Date.now() - t.ts < 4500).slice(-3).map((t) => (
          <div
            key={t.id}
            id={`toast-${t.id}`}
            role="status"
            className={`min-w-64 max-w-96 rounded-md px-3 py-2 text-sm shadow border backdrop-blur bg-white/90 dark:bg-black/70 ${
              t.type === "success"
                ? "border-green-500/40"
                : t.type === "error"
                ? "border-red-500/40"
                : "border-black/10 dark:border-white/10"
            }`}
          >
            <span>{t.message}</span>
            <span className="ml-2 inline-flex items-center gap-2">
              {t.href && (
                <a href={t.href} target="_blank" rel="noreferrer" className="underline">
                  View
                </a>
              )}
              {t.copyText && (
                <button
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(t.copyText!);
                    } catch {}
                  }}
                  className="text-xs opacity-80 hover:opacity-100 underline"
                  aria-label="Copy"
                >
                  Copy
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
