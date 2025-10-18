"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import PositionCard from "./PositionCard";

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
    <div className="space-y-3 safe-bottom">
      {/* Header with Pool Party style */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">Your Pools</h2>
        <div className="text-xs opacity-60 px-2 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
          {positions.length} {positions.length === 1 ? 'position' : 'positions'}
        </div>
      </div>

      {/* Loading state with shimmer */}
      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full"></div>
          <div className="skeleton h-24 w-full"></div>
          <div className="text-sm opacity-70 text-center py-2">
            Loading your pool party...
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border-2 border-[var(--lifeguard-danger)] bg-red-50 dark:bg-red-950/20 p-4">
          <div className="text-sm text-[var(--lifeguard-danger)]">
            <div className="font-semibold mb-1">Lifeguard Alert</div>
            {error}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && positions.length === 0 && (
        <div className="card-pool p-8 text-center space-y-3">
          <div className="text-4xl">🛟</div>
          <div className="text-sm opacity-70">
            <div className="font-semibold mb-1">No positions yet</div>
            <div className="text-xs">Jump into a pool to start earning fees!</div>
          </div>
        </div>
      )}

      {/* Lifeguard tip (show if positions exist) */}
      {!loading && !error && positions.length > 0 && (
        <div className="mt-4 p-3 rounded-lg bg-[var(--pool-blue-light)] border border-[var(--pool-blue)] text-sm">
          <div className="font-semibold text-xs mb-1">ðŸ’¡ Lifeguard Tip</div>
          <div className="text-xs opacity-90">
            Tap any position to see detailed health metrics and manage your liquidity.
          </div>
        </div>
      )}
    </div>
  );
}


