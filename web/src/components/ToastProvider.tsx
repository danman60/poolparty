"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = { id: string; message: string; type?: "info" | "success" | "error"; href?: string; copyText?: string };
type Ctx = { addToast: (msg: string, type?: Toast["type"], href?: string, copyText?: string) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info", href?: string, copyText?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type, href, copyText }]);
    // auto dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed top-3 right-3 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
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
