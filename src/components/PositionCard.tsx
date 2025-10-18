"use client";

import { useState } from "react";
import CollectFeesButton from "./CollectFeesButton";
import DecreaseLiquidityButton from "./DecreaseLiquidityButton";
import { calculateHealthScore } from "@/lib/lifeguard/healthScore";
import AdvisorBadge from "./advisor/AdvisorBadge";

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
  collectedFeesToken0: string;
  collectedFeesToken1: string;
  tickLower: { tickIdx: string } | null;
  tickUpper: { tickIdx: string } | null;
};

interface PositionCardProps {
  position: Position;
}

export default function PositionCard({ position }: PositionCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate Lifeguard health score using full algorithm
  const health = calculateHealthScore(position);
  const healthScore = health.overall;
  const healthStatus = health.status;

  return (
    <div className={`card-pool ripple ${expanded ? 'splash' : ''}`}>
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left touch-target"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${position.token0.symbol}/${position.token1.symbol} position details`}
      >
        <div className="p-4 space-y-2">
          {/* Top Row: Token Pair + Health Score */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold truncate">
                {position.token0.symbol} / {position.token1.symbol}
              </h3>
              <div className="text-xs opacity-60 mt-0.5">
                {Number(position.feeTier) / 10000}% fee
              </div>
            </div>
            {/* Lifeguard Health Badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <AdvisorBadge status={healthStatus.color as any} score={healthScore} />
              <AdvisorBadge status={healthStatus.color as any} score={healthScore} />
              <span className="text-lg opacity-60">{expanded ? '▾' : '▸'}</span>
              <span className="text-lg opacity-60">{expanded ? '▾' : '▸'}</span>
            </div>
          </div>

          {/* Quick Stats - Collapsed View */}
          {!expanded && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex-1">
                <div className="text-xs opacity-60">Value</div>
                <div className="font-medium">{fmtNum(position.liquidity)}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs opacity-60">Fees</div>
                <div className="font-medium text-[var(--pool-lime)]">
                  {getFeesDisplay(position)}
                </div>
              </div>
            </div>
          )}
        </div>
      </button>

      {/* Expanded Details - Shown when clicked */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[var(--border)] pt-4 mt-2 desktop-hidden">
          {/* Health Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-semibold opacity-80">Lifeguard Health Breakdown</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 rounded-md bg-[var(--surface)]">
                <div className="opacity-60 mb-1">Profitability</div>
                <div className="font-semibold text-base">{health.profitability}</div>
                <div className="text-[10px] opacity-50 mt-0.5">40% weight</div>
              </div>
              <div className="text-center p-2 rounded-md bg-[var(--surface)]">
                <div className="opacity-60 mb-1">Fee Performance</div>
                <div className="font-semibold text-base">{health.feePerformance}</div>
                <div className="text-[10px] opacity-50 mt-0.5">30% weight</div>
              </div>
              <div className="text-center p-2 rounded-md bg-[var(--surface)]">
                <div className="opacity-60 mb-1">Liquidity</div>
                <div className="font-semibold text-base">{health.liquidityUtilization}</div>
                <div className="text-[10px] opacity-50 mt-0.5">20% weight</div>
              </div>
              <div className="text-center p-2 rounded-md bg-[var(--surface)]">
                <div className="opacity-60 mb-1">Risk</div>
                <div className="font-semibold text-base">{health.riskMetrics}</div>
                <div className="text-[10px] opacity-50 mt-0.5">10% weight</div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="text-xs opacity-60">Your Liquidity</div>
              <div className="font-medium">{fmtNum(position.liquidity)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs opacity-60">Uncollected Fees</div>
              <div className="font-medium">{fmtFees(position)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs opacity-60">Position ID</div>
              <div className="font-mono text-xs">{shortId(position.id)}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs opacity-60">Profitability</div>
              <div className="font-medium">{getProfitabilityDisplay(position, health.profitability)}</div>
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <CollectFeesButton tokenId={position.id} />
            <DecreaseLiquidityButton tokenId={position.id} liquidity={position.liquidity} />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getFeesDisplay(position: Position): string {
  const decimals0 = Number(position.token0.decimals || 18);
  const decimals1 = Number(position.token1.decimals || 18);
  const rawFee0 = BigInt(position.uncollectedFeesToken0 || '0');
  const rawFee1 = BigInt(position.uncollectedFeesToken1 || '0');
  const f0 = Number(rawFee0) / Math.pow(10, decimals0);
  const f1 = Number(rawFee1) / Math.pow(10, decimals1);
  if (f0 === 0 && f1 === 0) return "—";
  const total = f0 + f1;
  return shortAmt(total);
}

function fmtNum(n: string | number) {
  const v = typeof n === "string" ? Number(n) : n;
  if (!isFinite(v) || v === 0) return "â€”";
  return v.toLocaleString();
}

function fmtFees(p: Position) {
  const decimals0 = Number(p.token0.decimals || 18);
  const decimals1 = Number(p.token1.decimals || 18);

  const rawFee0 = BigInt(p.uncollectedFeesToken0 || '0');
  const rawFee1 = BigInt(p.uncollectedFeesToken1 || '0');

  const f0 = Number(rawFee0) / Math.pow(10, decimals0);
  const f1 = Number(rawFee1) / Math.pow(10, decimals1);

  if (f0 === 0 && f1 === 0) return "â€”";
  return `${shortAmt(f0)} ${p.token0.symbol} / ${shortAmt(f1)} ${p.token1.symbol}`;
}

function shortAmt(n: number) {
  if (!isFinite(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "k";
  if (n >= 1) return n.toFixed(2);
  if (n >= 0.00001) return n.toFixed(5);
  if (n === 0) return "0";
  return "~0";
}

function shortId(id: string) {
  if (!id) return "â€”";
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}â€¦${id.slice(-4)}`;
}

function getProfitabilityDisplay(position: Position, score: number) {
  const decimals0 = Number(position.token0.decimals || 18);
  const decimals1 = Number(position.token1.decimals || 18);

  const totalFees0 = BigInt(position.collectedFeesToken0 || '0') + BigInt(position.uncollectedFeesToken0 || '0');
  const totalFees1 = BigInt(position.collectedFeesToken1 || '0') + BigInt(position.uncollectedFeesToken1 || '0');

  const fees0 = Number(totalFees0) / Math.pow(10, decimals0);
  const fees1 = Number(totalFees1) / Math.pow(10, decimals1);

  const totalFees = fees0 + fees1;

  // Use score to determine display color
  let color = 'var(--foreground)';
  let emoji = '';
  if (score >= 75) {
    color = 'var(--lifeguard-good)';
    emoji = 'âœ…';
  } else if (score >= 60) {
    color = 'var(--lifeguard-warning)';
    emoji = 'âš ï¸';
  } else if (score < 60) {
    color = 'var(--lifeguard-danger)';
    emoji = 'âš ï¸';
  }

  if (totalFees === 0) return <span className="opacity-60">No fees yet</span>;

  return (
    <span style={{ color }}>
      {shortAmt(totalFees)} fees {emoji}
    </span>
  );
}
