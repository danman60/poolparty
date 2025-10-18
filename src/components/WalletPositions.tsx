"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import MetricTooltip from "@/components/advisor/MetricTooltip";
import { fetchTokenPrices, type PriceMap } from "@/lib/prices";
import { FEATURE_TRENDS, FEATURE_WALLET_STATS } from "@/lib/flags";

import PositionCard from "./PositionCard";
import PortfolioSummary from "./PortfolioSummary";
import PortfolioEarnings from "./PortfolioEarnings";
import RecentActivity from "./RecentActivity";
import ServerActivity from "./ServerActivity";
import WalletAtGlance from "./WalletAtGlance";
import WalletVisibleStats from "./WalletVisibleStats";
import WalletActivityTrends from "./WalletActivityTrends";
import ExportPositionsCsvButton from "./ExportPositionsCsvButton";
import ExportFeesCsvButton from "./ExportFeesCsvButton";
import BatchCollectFeesButton from "./BatchCollectFeesButton";
import BatchClosePositionsButton from "./BatchClosePositionsButton";

type Position = {
  id: string;
  poolId?: string;
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
  const [prices, setPrices] = useState<PriceMap | undefined>(undefined);
  const [onlyFees, setOnlyFees] = useState(false);

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
    return () => { cancelled = true; };
  }, [address, isConnected]);

  const tokenAddresses = useMemo(() => {
    const addrs = new Set<string>();
    for (const p of positions) {
      if (p?.token0?.id) addrs.add(p.token0.id);
      if (p?.token1?.id) addrs.add(p.token1.id);
    }
    return Array.from(addrs);
  }, [positions]);

  const visiblePositions = useMemo(() => {
    if (!onlyFees) return positions;
    return positions.filter(p => {
      try { return BigInt(p.uncollectedFeesToken0 || '0') > 0n || BigInt(p.uncollectedFeesToken1 || '0') > 0n; } catch { return false; }
    });
  }, [positions, onlyFees]);

  const visibleFeesUsd = useMemo(() => {
    if (!prices) return 0;
    let sum = 0;
    for (const p of visiblePositions) {
      const d0 = Number(p.token0.decimals || 18);
      const d1 = Number(p.token1.decimals || 18);
      const px0 = prices[p.token0.id.toLowerCase()] || 0;
      const px1 = prices[p.token1.id.toLowerCase()] || 0;
      const f0 = Number((BigInt(p.collectedFeesToken0 || '0') + BigInt(p.uncollectedFeesToken0 || '0'))) / Math.pow(10, d0);
      const f1 = Number((BigInt(p.collectedFeesToken1 || '0') + BigInt(p.uncollectedFeesToken1 || '0'))) / Math.pow(10, d1);
      sum += f0 * px0 + f1 * px1;
    }
    return sum;
  }, [visiblePositions, prices]);

  useEffect(() => {
    let cancelled = false;
    async function loadPrices() {
      if (!isConnected || tokenAddresses.length === 0) { setPrices(undefined); return; }
      try {
        const map = await fetchTokenPrices(tokenAddresses);
        if (!cancelled) setPrices(map);
      } catch {
        if (!cancelled) setPrices(undefined);
      }
    }
    loadPrices();
    return () => { cancelled = true; };
  }, [isConnected, tokenAddresses]);

  if (!isConnected) return null;

  return (
    <div className="space-y-3 safe-bottom">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">Your Pools</h2>
        <div className="text-xs opacity-60 px-2 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
          {positions.length} {positions.length === 1 ? 'position' : 'positions'}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm px-1">
        <MetricTooltip label="Filters">
          Toggle to show only positions that currently have uncollected fees. Exports and batch actions operate on the visible set.
        </MetricTooltip>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={onlyFees} onChange={(e) => setOnlyFees(e.target.checked)} aria-label="Show only positions with fees" />
          <span className="opacity-80">Show only positions with fees</span>
        </label>
        {onlyFees && (
          <div className="flex items-center gap-2 text-xs opacity-60">
            <span>{visiblePositions.length} shown</span>
            <button
              className="underline opacity-70 hover:opacity-100"
              onClick={() => setOnlyFees(false)}
              title="Show all positions"
              aria-label="Reset filter to show all positions"
            >
              Reset
            </button>
          </div>
        )}
        {!!prices && (
          <div className="text-xs opacity-60">
            Visible fees: {visibleFeesUsd <= 0 ? '-' : visibleFeesUsd.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}
          </div>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full">??</div>
          <div className="skeleton h-24 w-full">??</div>
          <div className="text-sm opacity-70 text-center py-2">Loading your pool party...</div>
        </div>
      )}

      {error && (
        <div className="rounded-lg border-2 border-[var(--lifeguard-danger)] bg-red-50 dark:bg-red-950/20 p-4">
          <div className="text-sm text-[var(--lifeguard-danger)]">
            <div className="font-semibold mb-1">Lifeguard Alert</div>
            {error}
          </div>
        </div>
      )}

      {!loading && !error && positions.length === 0 && (
        <div className="card-pool p-8 text-center space-y-3">
          <div className="text-4xl">??</div>
          <div className="text-sm opacity-70">
            <div className="font-semibold mb-1">No positions yet</div>
            <div className="text-xs">Jump into a pool to start earning fees!</div>
          </div>
        </div>
      )}

      {!loading && !error && positions.length > 0 && (
        <>
          {FEATURE_WALLET_STATS && (
            <WalletAtGlance positions={visiblePositions} prices={prices} />
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <PortfolioSummary positions={positions} prices={prices} />
            <PortfolioEarnings positions={positions} prices={prices} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <RecentActivity />
            <ServerActivity />
          </div>
          {FEATURE_TRENDS && <WalletActivityTrends />}

          <div className="flex flex-wrap gap-3 items-center px-1">
            <ExportPositionsCsvButton positions={visiblePositions} prices={prices} label={`Export Positions CSV${onlyFees ? ' (filtered)' : ''}`} disabled={visiblePositions.length === 0} />
            <ExportFeesCsvButton positions={visiblePositions} prices={prices} label={`Export Fees CSV${onlyFees ? ' (filtered)' : ''}`} disabled={visiblePositions.length === 0} />
            <BatchCollectFeesButton positions={visiblePositions} />
            <BatchClosePositionsButton positions={visiblePositions} />
          </div>

          <div className="space-y-3 mt-2">
            {FEATURE_WALLET_STATS && (
              <WalletVisibleStats positions={visiblePositions} prices={prices} />
            )}
            {visiblePositions.map((p) => (
              <PositionCard key={p.id} position={p} prices={prices} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


      {/* Tip removed to streamline wallet UI */
"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import PositionCard from "./PositionCard";
import PortfolioSummary from "./PortfolioSummary";
import PortfolioEarnings from "./PortfolioEarnings";
import RecentActivity from "./RecentActivity";
import ServerActivity from "./ServerActivity";
import ExportPositionsCsvButton from "./ExportPositionsCsvButton";
import BatchCollectFeesButton from "./BatchCollectFeesButton";
import BatchClosePositionsButton from "./BatchClosePositionsButton";
import { fetchTokenPrices, type PriceMap } from "@/lib/prices";

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
  const [prices, setPrices] = useState<PriceMap | undefined>(undefined);
  const [onlyFees, setOnlyFees] = useState(false);

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
    return () => { cancelled = true; };
  }, [address, isConnected]);

  // Token addresses for price lookup
  const tokenAddresses = useMemo(() => {
    const addrs = new Set<string>();
    for (const p of positions) {
      if (p?.token0?.id) addrs.add(p.token0.id);
      if (p?.token1?.id) addrs.add(p.token1.id);
    }
    return Array.from(addrs);
  }, [positions]);

  // Visible positions (optionally filter to those with fees)
  const visiblePositions = useMemo(() => {
    if (!onlyFees) return positions;
    return positions.filter(p => {
      try { return BigInt(p.uncollectedFeesToken0 || '0') > 0n || BigInt(p.uncollectedFeesToken1 || '0') > 0n; } catch { return false; }
    });
  }, [positions, onlyFees]);

  // Fetch token prices
  useEffect(() => {
    let cancelled = false;
    async function loadPrices() {
      if (!isConnected || tokenAddresses.length === 0) { setPrices(undefined); return; }
      try {
        const map = await fetchTokenPrices(tokenAddresses);
        if (!cancelled) setPrices(map);
      } catch {
        if (!cancelled) setPrices(undefined);
      }
    }
    loadPrices();
    return () => { cancelled = true; };
  }, [isConnected, tokenAddresses]);

  if (!isConnected) return null;

  return (
    <div className="space-y-3 safe-bottom">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-semibold">Your Pools</h2>
        <div className="text-xs opacity-60 px-2 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
          {positions.length} {positions.length === 1 ? 'position' : 'positions'}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 text-sm px-1">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={onlyFees} onChange={(e) => setOnlyFees(e.target.checked)} aria-label="Show only positions with fees" />
          <span className="opacity-80">Show only positions with fees</span>
        </label>
        {onlyFees && (
          <div className="text-xs opacity-60">{visiblePositions.length} shown</div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full">??</div>
          <div className="skeleton h-24 w-full">??</div>
          <div className="text-sm opacity-70 text-center py-2">Loading your pool party...</div>
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
          <div className="text-4xl">??</div>
          <div className="text-sm opacity-70">
            <div className="font-semibold mb-1">No positions yet</div>
            <div className="text-xs">Jump into a pool to start earning fees!</div>
          </div>
        </div>
      )}

      {/* Summary, activity, controls, positions */}
      {!loading && !error && positions.length > 0 && (
        <>
          {FEATURE_WALLET_STATS && (
          <WalletAtGlance positions={visiblePositions} prices={prices} />
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <PortfolioSummary positions={positions} prices={prices} />
            <PortfolioEarnings positions={positions} prices={prices} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <RecentActivity />
            <ServerActivity />
          </div>

          <div className="flex flex-wrap gap-3 items-center px-1">
            <ExportPositionsCsvButton positions={visiblePositions} prices={prices} label={Export Positions CSV} disabled={visiblePositions.length === 0} />
            <ExportFeesCsvButton positions={visiblePositions} prices={prices} label={Export Fees CSV} disabled={visiblePositions.length === 0} />
            <BatchCollectFeesButton positions={visiblePositions} />
            <BatchClosePositionsButton positions={visiblePositions} />
          </div>

          <div className="space-y-3 mt-2">
            {visiblePositions.map((p) => (
              <PositionCard key={p.id} position={p} prices={prices} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

