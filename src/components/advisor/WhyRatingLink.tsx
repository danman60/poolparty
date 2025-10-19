"use client";

import { useState, useEffect, useRef } from "react";
import MetricTooltip from "./MetricTooltip";

export default function WhyRatingLink({ tvlUsd, volumeUsd24h, feeTier, rating, score }: { tvlUsd?: number | null; volumeUsd24h?: number | null; feeTier?: number | null; rating: string; score: number }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
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
  const tvl = tvlUsd ?? 0;
  const vol = volumeUsd24h ?? 0;
  const feeRate = (feeTier ?? 0) / 1_000_000;
  const ratio = tvl > 0 ? vol / tvl : 0;
  const apr = (tvl > 0 && vol > 0 && feeRate > 0) ? (vol * feeRate * 365) / tvl : 0;

  return (
    <span className="relative inline-flex items-center gap-2">
      <button
        ref={buttonRef}
        type="button"
        className="text-[11px] underline opacity-70 hover:opacity-100"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Why this rating?"
      >
        {open ? "Close" : "Why?"}
      </button>
      <MetricTooltip label="How it's derived">
        Preview rating blends Volume:TVL with a small IL(10%) penalty and fee tier bonus.
      </MetricTooltip>
      {open && (
        <div
          ref={panelRef}
          className="absolute z-20 top-full mt-1 left-0 min-w-[260px] max-w-[300px] rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-black p-3 text-xs shadow-lg"
          role="dialog"
          aria-label="Rating explanation"
        >
          <div className="opacity-60 mb-1">Preview Rating</div>
          <div className="mb-2"><span className="font-semibold">{rating}</span> (score {score}/100)</div>
          <div className="space-y-1">
            <div><span className="opacity-60">V:TVL ratio:</span> {ratio <= 0 ? '-' : ratio.toFixed(3)}</div>
            <div><span className="opacity-60">Fee tier:</span> {feeTier == null ? '-' : (feeTier/10000).toFixed(2) + '%'}</div>
            <div><span className="opacity-60">APR (est):</span> {apr <= 0 ? '-' : (apr*100).toFixed(2) + '%'}</div>
            <div className="opacity-60 mt-2">Heuristic: high V:TVL increases rating; IL@10% subtracts a small penalty; higher fee tiers add a small bonus.</div>
          </div>
        </div>
      )}
    </span>
  );
}

