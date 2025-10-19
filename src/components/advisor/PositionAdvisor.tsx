"use client";

import { calculateHealthScore } from "@/lib/lifeguard/healthScore";

type Position = {
  id: string;
  token0: { id: string; symbol: string; decimals: string };
  token1: { id: string; symbol: string; decimals: string };
  feeTier: string;
  liquidity: string;
  depositedToken0: string;
  depositedToken1: string;
  uncollectedFeesToken0: string;
  uncollectedFeesToken1: string;
  collectedFeesToken0?: string;
  collectedFeesToken1?: string;
  tickLower: { tickIdx: string } | null;
  tickUpper: { tickIdx: string } | null;
};

export default function PositionAdvisor({ position, prices }: { position: Position; prices?: Record<string, number> }) {
  const health = calculateHealthScore(position);

  // Determine basic signals
  const hasFees = safeBig(position.uncollectedFeesToken0) > 0n || safeBig(position.uncollectedFeesToken1) > 0n;
  const liquidity = Number(position.liquidity || 0);
  const narrowRange = isNarrowRange(position);

  // Estimate USD fees when prices are available (optional)
  const feesUsd = prices ? estimateFeesUsd(position, prices) : null;

  const tips: string[] = [];
  if (hasFees) tips.push("Collect fees to realize gains");
  if (health.status.color === "danger" || health.status.color === "critical") {
    tips.push(narrowRange ? "Widen your tick range to reduce out-of-range risk" : "Reduce liquidity or adjust range to lower risk");
  }
  if (health.status.color === "good" || health.status.color === "excellent") {
    tips.push("Consider increasing liquidity on this position");
  }
  if (!hasFees && (health.status.color === "warning" || health.status.color === "danger")) {
    tips.push("Monitor fee generation; adjust range if fees remain low");
  }
  if (liquidity === 0) tips.push("No active liquidity — remove or reallocate");

  const subtitle = feesUsd == null ? undefined : feesUsd <= 0 ? "No fees yet" : `Uncollected fees: ${fmtUsd(feesUsd)}`;

  function actionScroll(action: 'collect'|'increase'|'decrease'|'remove') {
    try {
      const id = action === 'collect' ? `action-collect-${position.id}`
        : action === 'increase' ? `action-increase-${position.id}`
        : action === 'decrease' ? `action-decrease-${position.id}`
        : `action-remove-${position.id}`;
      const el = document.getElementById(id) || document.getElementById(`actions-${position.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add temporary highlight pulse
        try {
          el.classList.add('highlight-target');
          setTimeout(() => el.classList.remove('highlight-target'), 1200);
        } catch {}
        // Try to focus primary button inside
        const btn = el.querySelector('button') as HTMLButtonElement | null;
        if (btn) setTimeout(() => btn.focus?.(), 250);
      }
    } catch {}
  }

  return (
    <div className="rounded-md border border-black/10 dark:border-white/10 p-3">
      <div className="text-xs opacity-60">Lifeguard Tips</div>
      {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
      <ul className="list-disc ml-4 mt-2 text-sm space-y-1">
        {tips.slice(0, 3).map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-2">
        {hasFees && (
          <button
            className="text-xs underline opacity-80 hover:opacity-100"
            onClick={() => actionScroll('collect')}
            aria-label="Scroll to Collect Fees"
          >
            Collect fees
          </button>
        )}
        <button
          className="text-xs underline opacity-80 hover:opacity-100"
          onClick={() => actionScroll('increase')}
          aria-label="Scroll to Add Liquidity"
        >
          Add liquidity
        </button>
        <button
          className="text-xs underline opacity-80 hover:opacity-100"
          onClick={() => actionScroll('decrease')}
          aria-label="Scroll to Withdraw Liquidity"
        >
          Withdraw
        </button>
        <button
          className="text-xs underline opacity-80 hover:opacity-100"
          onClick={() => actionScroll('remove')}
          aria-label="Scroll to Close Position"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function isNarrowRange(p: Position): boolean {
  if (!p.tickLower || !p.tickUpper) return false;
  const lower = Number(p.tickLower.tickIdx);
  const upper = Number(p.tickUpper.tickIdx);
  return Math.abs(upper - lower) < 500; // heuristic aligned with health scoring
}

function estimateFeesUsd(p: Position, prices: Record<string, number>): number {
  const d0 = Number(p.token0.decimals || 18);
  const d1 = Number(p.token1.decimals || 18);
  const px0 = prices[p.token0.id.toLowerCase()] || 0;
  const px1 = prices[p.token1.id.toLowerCase()] || 0;
  const f0 = Number(safeBig(p.uncollectedFeesToken0)) / Math.pow(10, d0);
  const f1 = Number(safeBig(p.uncollectedFeesToken1)) / Math.pow(10, d1);
  return f0 * px0 + f1 * px1;
}

function safeBig(v?: string): bigint {
  try { return BigInt(v || "0"); } catch { return 0n; }
}

function fmtUsd(v: number) {
  if (!Number.isFinite(v) || v <= 0) return "-";
  return v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}
