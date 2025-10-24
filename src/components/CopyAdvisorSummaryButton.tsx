"use client";

import { useToast } from "./ToastProvider";

type Counts = { excellent: number; good: number; warning: number; danger: number; critical: number };

export default function CopyAdvisorSummaryButton({ counts, visibleFeesUsd }: { counts: Counts; visibleFeesUsd?: number | null }) {
  const { addToast } = useToast();

  async function onCopy() {
    try {
      const total = counts.excellent + counts.good + counts.warning + counts.danger + counts.critical;
      const parts = [
        `Positions: ${total}`,
        `Excellent: ${counts.excellent}`,
        `Good: ${counts.good}`,
        `Fair: ${counts.warning}`,
        `Risky: ${counts.danger}`,
        `Critical: ${counts.critical}`,
      ];
      if (visibleFeesUsd != null) {
        parts.push(`Visible Fees: ${visibleFeesUsd <= 0 ? '-' : visibleFeesUsd.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}`);
      }
      parts.push(`Tip: Try Fair+ and Rising filters for momentum.`);
      const text = `PoolParty Advisor Summary\n` + parts.join('\n');
      await navigator.clipboard.writeText(text);
      addToast('Advisor summary copied to clipboard!', 'success');
    } catch (err) {
      addToast('Failed to copy summary', 'error');
    }
  }
  return (
    <button
      onClick={onCopy}
      className="text-xs underline opacity-70 hover:opacity-100"
      title="Copy advisor summary"
      aria-label="Copy advisor summary"
    >
      Copy Advisor Summary
    </button>
  );
}
