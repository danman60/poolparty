"use client";

import { useAccount } from "wagmi";
import CollectFeesButton from "@/components/CollectFeesButton";
import DecreaseLiquidityButton from "@/components/DecreaseLiquidityButton";
import { useEffect, useState } from "react";

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

export default function WalletPositions() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isConnected || !address) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/wallet/positions?address=${address}`);
        const json = await res.json();
        if (res.ok) {
          if (!cancelled) setPositions(json.data || []);
        } else {
          throw new Error(json.error || "Failed to fetch positions");
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  if (!isConnected) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your LP Positions</h2>
        <div className="text-xs opacity-60">{positions.length} positions</div>
      </div>

      {loading && <div className="text-sm opacity-70">Loading positions…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && positions.length === 0 && (
        <div className="text-sm opacity-70">No positions found on Uniswap v3.</div>
      )}

      {!loading && !error && positions.length > 0 && (
        <div className="space-y-4">
          {positions.map((p) => (
            <div key={p.id} className="rounded-lg border-2 border-black/10 dark:border-white/10 bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-950/20 dark:to-purple-950/20 p-6 space-y-4">
              {/* Position Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{p.token0.symbol} / {p.token1.symbol}</h3>
                    <div className="text-xs opacity-60 mt-1">Fee: {Number(p.feeTier) / 10000}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-60">Position ID</div>
                    <div className="text-xs font-mono">{shortId(p.id)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-xs opacity-60">Your Liquidity</div>
                    <div className="font-medium">{fmtNum(p.liquidity)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs opacity-60">Uncollected Fees</div>
                    <div className="font-medium">{fmtFees(p)}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2 border-t border-black/10 dark:border-white/10">
                <div className="flex-1">
                  <CollectFeesButton tokenId={p.id} />
                </div>
                <div className="flex-1">
                  <DecreaseLiquidityButton tokenId={p.id} liquidity={p.liquidity} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fmtNum(n: string | number) {
  const v = typeof n === "string" ? Number(n) : n;
  if (!isFinite(v) || v === 0) return "—";
  return v.toLocaleString();
}

function fmtFees(p: Position) {
  const f0 = Number(p.uncollectedFeesToken0 || 0);
  const f1 = Number(p.uncollectedFeesToken1 || 0);
  if (f0 === 0 && f1 === 0) return "—";
  return `${shortAmt(f0)} ${p.token0.symbol} / ${shortAmt(f1)} ${p.token1.symbol}`;
}

function shortAmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toFixed(4);
}

function shortId(id: string) {
  if (!id) return "—";
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}
