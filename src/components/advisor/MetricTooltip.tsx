"use client";

import { useState } from "react";

export default function MetricTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-1">
      <span className="text-xs opacity-70">{label}</span>
      <button
        type="button"
        aria-label={`Help: ${label}`}
        className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 text-[10px] leading-3 flex items-center justify-center opacity-70 hover:opacity-100"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <div role="tooltip" className="absolute z-10 top-full mt-1 left-0 min-w-[200px] max-w-[260px] rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black p-2 text-xs shadow">
          {children}
        </div>
      )}
    </span>
  );
}

