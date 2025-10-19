"use client";

import { useAccount } from "wagmi";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MetricTooltip from "@/components/advisor/MetricTooltip";
import { fetchTokenPrices, type PriceMap } from "@/lib/prices";
import { FEATURE_TRENDS, FEATURE_WALLET_STATS } from "@/lib/flags";

import PositionCard from "./PositionCard";
import PortfolioSummary from "./PortfolioSummary";
import PortfolioEarnings from "./PortfolioEarnings";
import WalletAdvisor from "./advisor/WalletAdvisor";
import RecentActivity from "./RecentActivity";
import ServerActivity from "./ServerActivity";
import WalletAtGlance from "./WalletAtGlance";
import WalletVisibleStats from "./WalletVisibleStats";
import WalletActivityTrends from "./WalletActivityTrends";
import ExportPositionsCsvButton from "./ExportPositionsCsvButton";
import ExportFeesCsvButton from "./ExportFeesCsvButton";
import ExportAdvisorCsvButton from "./ExportAdvisorCsvButton";
import BatchCollectFeesButton from "./BatchCollectFeesButton";
import BatchClosePositionsButton from "./BatchClosePositionsButton";
import AdvisorLegend from "./advisor/AdvisorLegend";
import { calculateHealthScore, getHealthStatusSafe } from "@/lib/lifeguard/healthScore";
import Sparkline from "./Sparkline";
import CopyLinkButton from "./CopyLinkButton";
import CopyAdvisorSummaryButton from "./CopyAdvisorSummaryButton";
import ExportWatchlistCsvButton from "./ExportWatchlistCsvButton";
import { useWatchlist } from "./WatchlistStore";

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
  const { add: addWatch } = useWatchlist();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [prices, setPrices] = useState<PriceMap | undefined>(undefined);
  const [onlyFees, setOnlyFees] = useState(false);
  const [showStats, setShowStats] = useState<boolean>(FEATURE_WALLET_STATS);
  const [showTrends, setShowTrends] = useState<boolean>(FEATURE_TRENDS);
  const [advisorFilter, setAdvisorFilter] = useState<"all" | "risky" | "good" | "excellent">("all");
  const [sortKey, setSortKey] = useState<"default" | "health" | "fees">("default");
  const [watchOnly, setWatchOnly] = useState<boolean>(false);

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

  // Initialize from URL query on first mount
  useEffect(() => {
    try {
      if (!searchParams) return;
      const qOnlyFees = searchParams.get("onlyFees");
      const qStats = searchParams.get("stats");
      const qTrends = searchParams.get("trends");
      const qSort = searchParams.get("sort");
      const qFilter = searchParams.get("filter");
      const qWatch = searchParams.get("watch");
      if (qOnlyFees != null) setOnlyFees(["1","true","yes"].includes(qOnlyFees.toLowerCase()));
      if (qStats != null) setShowStats(["1","true","yes"].includes(qStats.toLowerCase()));
      if (qTrends != null) setShowTrends(["1","true","yes"].includes(qTrends.toLowerCase()));
      if (qSort && (qSort === "health" || qSort === "fees" || qSort === "default")) setSortKey(qSort as any);
      if (qFilter && (qFilter === "all" || qFilter === "risky" || qFilter === "good" || qFilter === "excellent")) setAdvisorFilter(qFilter as any);
      if (qWatch != null) setWatchOnly(["1","true","yes"].includes(qWatch.toLowerCase()));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist simple wallet view preferences locally
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      // Don't override URL-provided params
      const hasUrlPrefs = typeof window !== 'undefined' && new URLSearchParams(window.location.search).toString().length > 0;
      const raw = hasUrlPrefs ? null : localStorage.getItem('pp_wallet_prefs');
      if (!raw) return;
      const prefs = JSON.parse(raw || '{}');
      if (typeof prefs.onlyFees === 'boolean') setOnlyFees(prefs.onlyFees);
      if (typeof prefs.showStats === 'boolean') setShowStats(prefs.showStats);
      if (typeof prefs.showTrends === 'boolean') setShowTrends(prefs.showTrends);
      if (typeof prefs.sortKey === 'string') setSortKey(prefs.sortKey);
      if (typeof prefs.advisorFilter === 'string') setAdvisorFilter(prefs.advisorFilter);
      if (typeof prefs.watchOnly === 'boolean') setWatchOnly(prefs.watchOnly);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const prefs = { onlyFees, showStats, showTrends, sortKey, advisorFilter, watchOnly };
      localStorage.setItem('pp_wallet_prefs', JSON.stringify(prefs));
    } catch {}
  }, [onlyFees, showStats, showTrends, sortKey, advisorFilter, watchOnly]);

  // Sync prefs to URL (replace) for shareability
  useEffect(() => {
    try {
      if (!router) return;
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      params.set('onlyFees', String(onlyFees ? 1 : 0));
      params.set('stats', String(showStats ? 1 : 0));
      params.set('trends', String(showTrends ? 1 : 0));
      params.set('sort', sortKey);
      params.set('filter', advisorFilter);
      params.set('watch', String(watchOnly ? 1 : 0));
      const qs = params.toString();
      router.replace(`?${qs}`);
    } catch {}
  }, [onlyFees, showStats, showTrends, sortKey, advisorFilter, watchOnly, router]);

  const tokenAddresses = useMemo(() => {
    const addrs = new Set<string>();
    for (const p of positions) {
      if (p?.token0?.id) addrs.add(p.token0.id);
      if (p?.token1?.id) addrs.add(p.token1.id);
    }
    return Array.from(addrs);
  }, [positions]);

  const visiblePositions = useMemo(() => {
    let list = positions;
    if (onlyFees) {
      list = list.filter((p) => {
        try {
          return (
            BigInt(p.uncollectedFeesToken0 || "0") > 0n ||
            BigInt(p.uncollectedFeesToken1 || "0") > 0n
          );
        } catch {
          return false;
        }
      });
    }
    if (watchOnly) {
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('pp_watchlist') : null;
        const arr = raw ? (JSON.parse(raw) as Array<{ id?: string }>) : [];
        const set = new Set((arr || []).map((w) => (w?.id || '').toLowerCase()));
        list = list.filter((p) => p.poolId && set.has(p.poolId.toLowerCase()));
      } catch {}
    }
    if (advisorFilter !== 'all') {
      list = list.filter((p) => {
        try {
          const color = calculateHealthScore(p).status.color;
          if (advisorFilter === 'risky') return color === 'danger' || color === 'critical';
          if (advisorFilter === 'good') return color === 'good' || color === 'excellent';
          if (advisorFilter === 'excellent') return color === 'excellent';
          return true;
        } catch {
          return false;
        }
      });
    }
    // Sorting (desc)
    if (sortKey !== "default") {
      const byHealth = (p: Position) => {
        try { return calculateHealthScore(p).overall; } catch { return -1; }
      };
      const byFeesUsd = (p: Position) => {
        try {
          if (!prices) return 0;
          const d0 = Number(p.token0.decimals || 18);
          const d1 = Number(p.token1.decimals || 18);
          const px0 = prices[p.token0.id.toLowerCase()] || 0;
          const px1 = prices[p.token1.id.toLowerCase()] || 0;
          const f0 = Number(BigInt(p.uncollectedFeesToken0 || '0')) / Math.pow(10, d0);
          const f1 = Number(BigInt(p.uncollectedFeesToken1 || '0')) / Math.pow(10, d1);
          return f0 * px0 + f1 * px1;
        } catch { return 0; }
      };
      const getter = sortKey === 'health' ? byHealth : byFeesUsd;
      list = [...list].sort((a, b) => getter(b) - getter(a));
    }
    return list;
  }, [positions, onlyFees, watchOnly, advisorFilter, sortKey, prices]);

  const advisorCounts = useMemo(() => {
    const counts = { excellent: 0, good: 0, warning: 0, danger: 0, critical: 0 } as Record<string, number>;
    try {
      for (const p of positions) {
        const c = calculateHealthScore(p).status.color;
        counts[c] = (counts[c] || 0) + 1;
      }
    } catch {}
    return counts;
  }, [positions]);

  const avgHealth = useMemo(() => {
    try {
      if (!positions.length) return 0;
      let sum = 0;
      for (const p of positions) { sum += calculateHealthScore(p).overall; }
      return Math.round(sum / positions.length);
    } catch { return 0; }
  }, [positions]);

  const [healthSeries, setHealthSeries] = useState<number[]>([]);
  useEffect(() => {
    try {
      const key = 'pp_health_spark';
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const arr = raw ? (JSON.parse(raw) as number[]) : [];
      const next = [...(Array.isArray(arr) ? arr : []), avgHealth].slice(-60);
      if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(next));
      setHealthSeries(next);
    } catch {}
  }, [avgHealth]);

  const visibleFeesUsd = useMemo(() => {
    if (!prices) return 0;
    let sum = 0;
    for (const p of visiblePositions) {
      const d0 = Number(p.token0.decimals || 18);
      const d1 = Number(p.token1.decimals || 18);
      const px0 = prices[p.token0.id.toLowerCase()] || 0;
      const px1 = prices[p.token1.id.toLowerCase()] || 0;
      const f0 =
        Number(
          (BigInt(p.collectedFeesToken0 || "0") +
            BigInt(p.uncollectedFeesToken0 || "0")) as bigint
        ) / Math.pow(10, d0);
      const f1 =
        Number(
          (BigInt(p.collectedFeesToken1 || "0") +
            BigInt(p.uncollectedFeesToken1 || "0")) as bigint
        ) / Math.pow(10, d1);
      sum += f0 * px0 + f1 * px1;
    }
    return sum;
  }, [visiblePositions, prices]);

  useEffect(() => {
    let cancelled = false;
    async function loadPrices() {
      if (!isConnected || tokenAddresses.length === 0) {
        setPrices(undefined);
        return;
      }
      try {
        const map = await fetchTokenPrices(tokenAddresses);
        if (!cancelled) setPrices(map);
      } catch {
        if (!cancelled) setPrices(undefined);
      }
    }
    loadPrices();
    return () => {
      cancelled = true;
    };
  }, [isConnected, tokenAddresses]);

  if (!isConnected) return null;

  return (
    <div className="space-y-3 safe-bottom">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Your Pools</h2>
          <div className="flex items-center gap-2">
            <div className="text-xs opacity-60">Avg health</div>
            <div>
              <span className="inline-flex items-center gap-1">
                {/* Inline Advisor badge using avg health */}
                {(() => { const st = getHealthStatusSafe(avgHealth).color; const Badge = require('./advisor/AdvisorBadge').default; return <Badge status={st as any} score={avgHealth} />; })()}
              </span>
            </div>
            <div className="text-xs opacity-60">Risky</div>
            <div className="text-xs font-semibold">{advisorCounts.danger + advisorCounts.critical}</div>
            <div className="hidden md:block w-[140px]">
              <Sparkline values={healthSeries} height={18} />
            </div>
          </div>
        </div>
        <div className="text-xs opacity-60 px-2 py-1 rounded-full bg-[var(--surface)] border border-[var(--border)]">
          {positions.length} {positions.length === 1 ? "position" : "positions"}
        </div>
      </div>

      {(advisorCounts.danger + advisorCounts.critical) > 0 && (
        <div className="px-1">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm flex items-center gap-3">
            <div className="text-xs opacity-70">Lifeguard Notice</div>
            <div className="flex-1">
              {advisorCounts.danger + advisorCounts.critical} risky positions detected. Consider narrowing exposure or collecting fees.
            </div>
            <button
              className="text-xs underline opacity-80 hover:opacity-100"
              onClick={() => setAdvisorFilter('risky')}
              aria-label="Filter to risky positions"
            >
              Show risky
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-sm px-1">
        <MetricTooltip label="Filters">
          Toggle to show only positions that currently have uncollected fees. Exports and batch actions operate on the visible set.
        </MetricTooltip>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyFees}
            onChange={(e) => setOnlyFees(e.target.checked)}
            aria-label="Show only positions with fees"
          />
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
        {FEATURE_TRENDS && (
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={showTrends}
              onChange={(e) => setShowTrends(e.target.checked)}
              aria-label="Toggle activity trends"
            />
            <span className="opacity-80">Show trends</span>
          </label>
        )}
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={watchOnly}
            onChange={(e) => setWatchOnly(e.target.checked)}
            aria-label="Show watchlist only"
          />
          <span className="opacity-80">Watchlist only</span>
        </label>
        <div className="inline-flex items-center gap-2">
          <button
            className="text-xs underline opacity-70 hover:opacity-100"
            onClick={() => { setAdvisorFilter('good'); setSortKey('fees'); setOnlyFees(true); }}
            aria-label="Use yield preset"
            title="Yield preset: Good+ filter, sort by fees, show only fees"
          >
            Yield preset
          </button>
          <button
            className="text-xs underline opacity-70 hover:opacity-100"
            onClick={() => { setAdvisorFilter('risky'); setSortKey('health'); setOnlyFees(false); }}
            aria-label="Use risk preset"
            title="Risk preset: Risky filter, sort by health"
          >
            Risk preset
          </button>
        </div>
        <div className="inline-flex items-center gap-2">
          <label className="text-xs opacity-70" htmlFor="pp-filter">Advisor filter</label>
          <MetricTooltip label="What does this filter do?">
            Filters positions by Lifeguard status: Risky (danger+critical), Good+ (good or excellent), or Excellent only.
          </MetricTooltip>
          <select
            id="pp-filter"
            className="rounded border border-black/10 dark:border-white/10 px-2 py-1 text-xs bg-transparent"
            value={advisorFilter}
            onChange={(e) => setAdvisorFilter(e.target.value as any)}
            aria-label="Advisor filter"
          >
            <option value="all">All</option>
            <option value="risky">Risky only</option>
            <option value="good">Good+</option>
            <option value="excellent">Excellent only</option>
          </select>
        </div>
        <div className="inline-flex items-center gap-2 text-xs">
          <button
            className={`px-2 py-1 rounded border border-black/10 dark:border-white/10 ${advisorFilter==='risky'?'opacity-100':'opacity-70 hover:opacity-100'}`}
            onClick={() => setAdvisorFilter('risky')}
            aria-pressed={advisorFilter==='risky'}
            title="Show risky (danger+critical)"
          >
            Risky {advisorCounts.danger + advisorCounts.critical}
          </button>
          <button
            className={`px-2 py-1 rounded border border-black/10 dark:border-white/10 ${advisorFilter==='good'?'opacity-100':'opacity-70 hover:opacity-100'}`}
            onClick={() => setAdvisorFilter('good')}
            aria-pressed={advisorFilter==='good'}
            title="Show good and excellent"
          >
            Good+ {advisorCounts.good + advisorCounts.excellent}
          </button>
          <button
            className={`px-2 py-1 rounded border border-black/10 dark:border-white/10 ${advisorFilter==='excellent'?'opacity-100':'opacity-70 hover:opacity-100'}`}
            onClick={() => setAdvisorFilter('excellent')}
            aria-pressed={advisorFilter==='excellent'}
            title="Show excellent only"
          >
            Excellent {advisorCounts.excellent}
          </button>
        </div>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={showStats}
            onChange={(e) => setShowStats(e.target.checked)}
            aria-label="Toggle wallet stats"
          />
          <span className="opacity-80">Show stats</span>
        </label>
        <div className="inline-flex items-center gap-2">
          <label className="text-xs opacity-70" htmlFor="pp-sort">Sort</label>
          <MetricTooltip label="Sort options">
            Health sorts by overall Lifeguard score; Fees sorts by estimated USD of uncollected fees.
          </MetricTooltip>
          <select
            id="pp-sort"
            className="rounded border border-black/10 dark:border-white/10 px-2 py-1 text-xs bg-transparent"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            aria-label="Sort positions"
          >
            <option value="default">Default</option>
            <option value="health">Health (desc)</option>
            <option value="fees">Fees USD (desc)</option>
          </select>
        </div>
        {!!prices && (
          <div className="text-xs opacity-60">
            Visible fees: {visibleFeesUsd <= 0
              ? "-"
              : visibleFeesUsd.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                })}
          </div>
        )}
        <CopyLinkButton label="Copy View Link" />
        <CopyAdvisorSummaryButton counts={{ excellent: advisorCounts.excellent, good: advisorCounts.good, warning: advisorCounts.warning, danger: advisorCounts.danger, critical: advisorCounts.critical }} visibleFeesUsd={visibleFeesUsd} />
        <ExportWatchlistCsvButton label="Export Watchlist CSV" />
        <button
          className="text-xs underline opacity-70 hover:opacity-100"
          onClick={() => { try { (visiblePositions || []).forEach(p => { if (p.poolId) addWatch({ id: p.poolId, name: `${p.token0.symbol}/${p.token1.symbol}` }); }); } catch {} }}
          aria-label="Add visible pools to watchlist"
          title="Add visible pools to watchlist"
        >
          Add visible to Watchlist
        </button>
        <button
          className="text-xs underline opacity-70 hover:opacity-100"
          onClick={() => {
            setOnlyFees(false);
            setShowStats(FEATURE_WALLET_STATS);
            setShowTrends(FEATURE_TRENDS);
            setAdvisorFilter('all');
            setSortKey('default');
          }}
          aria-label="Reset wallet filters"
          title="Reset filters"
        >
          Reset
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          <div className="skeleton h-24 w-full" aria-hidden></div>
          <div className="skeleton h-24 w-full" aria-hidden></div>
          <div className="text-sm opacity-70 text-center py-2">
            Loading your pool party...
          </div>
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
          <div className="text-4xl" aria-hidden>💧</div>
          <div className="text-sm opacity-70">
            <div className="font-semibold mb-1">No positions yet</div>
            <div className="text-xs">
              Jump into a pool to start earning fees!
            </div>
          </div>
        </div>
      )}

      {!loading && !error && positions.length > 0 && (
        <>
          {FEATURE_WALLET_STATS && showStats && (
            <WalletAtGlance positions={visiblePositions} prices={prices} />
          )}

          <WalletAdvisor positions={visiblePositions} prices={prices} />

          <div className="px-1">
            <AdvisorLegend />
          </div>
          <div className="px-1">
            <div className="h-2 w-full rounded overflow-hidden border border-black/10 dark:border-white/10" title="Advisor distribution">
              {(() => { const total = positions.length || 1; const seg = (n: number) => `${(n/total)*100}%`; return (
                <div className="w-full flex">
                  <div style={{ width: seg(advisorCounts.excellent), backgroundColor: 'var(--lifeguard-excellent)' }} aria-label="Excellent"></div>
                  <div style={{ width: seg(advisorCounts.good), backgroundColor: 'var(--lifeguard-good)' }} aria-label="Good"></div>
                  <div style={{ width: seg(advisorCounts.warning), backgroundColor: 'var(--lifeguard-warning)' }} aria-label="Fair"></div>
                  <div style={{ width: seg(advisorCounts.danger), backgroundColor: 'var(--lifeguard-danger)' }} aria-label="Risky"></div>
                  <div style={{ width: seg(advisorCounts.critical), backgroundColor: 'var(--lifeguard-critical)' }} aria-label="Critical"></div>
                </div>
              ); })()}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <PortfolioSummary positions={positions} prices={prices} />
            <PortfolioEarnings positions={positions} prices={prices} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <RecentActivity />
            <ServerActivity />
          </div>
          {FEATURE_TRENDS && showTrends && <WalletActivityTrends />}

          <div className="flex flex-wrap gap-3 items-center px-1">
            <MetricTooltip label="Batch actions">
              Collect fees from or close all currently visible positions. Use
              the filter to limit the set.
            </MetricTooltip>
            <ExportPositionsCsvButton
              positions={visiblePositions}
              prices={prices}
              label="Export Positions CSV"
              disabled={visiblePositions.length === 0}
            />
            <ExportFeesCsvButton
              positions={visiblePositions}
              prices={prices}
              label="Export Fees CSV"
              disabled={visiblePositions.length === 0}
            />
            <ExportAdvisorCsvButton
              positions={visiblePositions}
              prices={prices}
              label="Export Advisor CSV"
              disabled={visiblePositions.length === 0}
            />
            <BatchCollectFeesButton positions={visiblePositions} prices={prices} />
            <BatchClosePositionsButton positions={visiblePositions} />
          </div>

          <div className="space-y-3 mt-2">
            {FEATURE_WALLET_STATS && showStats && (
              <WalletVisibleStats
                positions={visiblePositions}
                prices={prices}
              />
            )}
            {visiblePositions.map((p) => (
              <PositionCard key={p.id} position={p} prices={prices} />
            ))}
          </div>
          {/* Floating tray for recent txs */}
          <div className="relative">
            {(() => { const Tray = require('./TxActivityTray').default; return <Tray />; })()}
          </div>
        </>
      )}
    </div>
  );
}
