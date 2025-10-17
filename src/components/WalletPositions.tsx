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
        <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                <th className="text-left px-3 py-2">Pair</th>
                <th className="text-right px-3 py-2">Fee</th>
                <th className="text-right px-3 py-2">Liquidity</th>
                <th className="text-right px-3 py-2">Uncollected Fees</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => (
                <tr key={p.id} className="border-t border-black/5 dark:border-white/5">
                  <td className="px-3 py-2">{p.token0.symbol} / {p.token1.symbol}</td>
                  <td className="px-3 py-2 text-right">{Number(p.feeTier) / 10000}%</td>
                  <td className="px-3 py-2 text-right">{fmtNum(p.liquidity)}</td>
                  <td className="px-3 py-2 text-right">{fmtFees(p)}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <CollectFeesButton tokenId={p.id} />
                      <DecreaseLiquidityButton tokenId={p.id} liquidity={p.liquidity} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
