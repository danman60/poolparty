"use client";

import { useState, useEffect, useRef } from "react";

export default function MetricTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [clickOpen, setClickOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside
  useEffect(() => {
    if (!clickOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setClickOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setClickOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [clickOpen]);

  const isVisible = open || clickOpen;

  return (
    <span className="relative inline-flex items-center gap-1">
      <span className="text-xs opacity-70">{label}</span>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Help: ${label}`}
        aria-expanded={isVisible}
        className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20 bg-white/50 dark:bg-black/50 text-[10px] leading-3 flex items-center justify-center opacity-70 hover:opacity-100 hover:border-black/40 dark:hover:border-white/40 transition-all"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.stopPropagation();
          setClickOpen(!clickOpen);
        }}
      >
        ?
      </button>
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="absolute z-30 top-full mt-1 left-0 min-w-[200px] max-w-[280px] rounded-lg border border-black/20 dark:border-white/20 bg-white dark:bg-black p-3 text-xs shadow-lg leading-relaxed"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {children}
        </div>
      )}
    </span>
  );
}

