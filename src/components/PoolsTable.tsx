"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import AdvisorBadge from "./advisor/AdvisorBadge";
import AdvisorLegend from "./advisor/AdvisorLegend";
import ExportPoolsAdvisorCsvButton from "./ExportPoolsAdvisorCsvButton";
import ExportWatchlistCsvButton from "./ExportWatchlistCsvButton";
import CopyLinkButton from "./CopyLinkButton";
import CopyPoolsAdvisorSummaryButton from "./CopyPoolsAdvisorSummaryButton";
import WhyRatingLink from "./advisor/WhyRatingLink";
import PoolsMomentumBadge from "./advisor/PoolsMomentumBadge";
import PoolsFeeMomentumBadge from "./advisor/PoolsFeeMomentumBadge";
import WatchlistStar from "./WatchlistStar";
import WatchlistBar from "./WatchlistBar";
import { useWatchlist } from "./WatchlistStore";
import PoolsMiniSparkline from "./advisor/PoolsMiniSparkline";
import MetricTooltip from "@/components/advisor/MetricTooltip";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { ilFromPriceChange, ilRiskLevel } from "@/lib/advisor/impermanentLoss";
import HealthBar from "./advisor/HealthBar";
import { analyzeFeeTier } from "@/lib/advisor/feeTier";
import { useToast } from "./ToastProvider";
import Link from "next/link";

type PoolRow = {
  id: string;
  chain: string;
  token0_id: string;
  token1_id: string;
  token0: { symbol: string; name: string } | null;
  token1: { symbol: string; name: string } | null;
  fee_tier: number | null;
  tvl_usd: number | null;
  volume_usd_24h: number | null;
  updated_at: string | null;
};

type ApiResponse = {
  data: PoolRow[];
  meta?: { total: number; page: number; limit: number };
  error?: string;
  warning?: string;
};

const FEE_TIERS = ["all", "500", "3000", "10000"] as const;
type FeeFilter = (typeof FEE_TIERS)[number];

type Status = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';

function toStatus(score: number): Status {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 55) return 'warning';
  if (score >= 40) return 'danger';
  return 'critical';
}

function previewRating(p: PoolRow): number {
  const tvl = p.tvl_usd ?? 0;
  const vol = p.volume_usd_24h ?? 0;
  const feeRate = (p.fee_tier ?? 0) / 1_000_000; // 3000 -> 0.003
  // Volume:TVL score (0-10) -> 0-100
  const ratio = tvl > 0 ? vol / tvl : 0;
  let vScore = 1;
  if (ratio > 1.0) vScore = 10; else if (ratio > 0.5) vScore = 9; else if (ratio > 0.3) vScore = 7; else if (ratio > 0.15) vScore = 5; else if (ratio > 0.05) vScore = 3; else vScore = 1;
  let score = vScore * 10;
  // IL penalty at 10% move (heuristic, pool-agnostic)
  const il = ilFromPriceChange(10);
  const risk = ilRiskLevel(il);
  if (risk === 'medium') score -= 5; else if (risk === 'high') score -= 15; else if (risk === 'extreme') score -= 30;
  // Fee tier analysis
  const tier = analyzeFeeTier(p.fee_tier ?? 0, {});
  score += tier.bonus;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default function PoolsTable() {
  const { addToast } = useToast();
  const [recentAlertIds, setRecentAlertIds] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    try {
      const load = () => {
        try {
          if (typeof window === 'undefined') return;
          const raw = localStorage.getItem('pp_alerts');
          const now = Date.now();
          const cutoff = now - 24 * 3600 * 1000;
          const set = new Set<string>();
          if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              arr.forEach((t: any) => {
                if (t?.poolId && t.ts >= cutoff) set.add(String(t.poolId).toLowerCase());
              });
            }
          }
          setRecentAlertIds(set);
        } catch {}
      };
      load();
      const onStorage = (e: StorageEvent) => { if (e.key === 'pp_alerts') load(); };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    } catch {}
  }, []);
  const [fee, setFee] = useState<FeeFilter>("all");
  // Persist rating/sort in URL (fallback if next/navigation hooks unavailable)
  let router: any = null as any;
  let search: URLSearchParams | null = null;
  try {
    const nav = require('next/navigation');
    router = nav?.useRouter?.();
    if (typeof window !== 'undefined') {
      search = new URLSearchParams(window.location.search);
    }
  } catch {}
  const [sortKey, setSortKey] = useState<"pool" | "fee" | "tvl" | "volume" | "apr" | "rating" | "updated">("tvl");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [ratingMin, setRatingMin] = useState<"all" | "fair" | "good" | "excellent">("all");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [momentumOnly, setMomentumOnly] = useState(false);
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [risingIds, setRisingIds] = useState<Set<string>>(new Set());
  const [watchOnly, setWatchOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const apiSort = sortKey === "volume" ? "volume" : sortKey === "tvl" ? "tvl" : "tvl";

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["pools", { fee, sort: apiSort, order: sortDir, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), sort: apiSort, order: sortDir });
      if (fee !== "all") params.set("fee", fee);
      const res = await fetch(`/api/pools?${params.toString()}`, { cache: "no-store" });
      return res.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });

  // Persist rating/search/watch filters to URL for shareability
  try {
    const nav2 = require('next/navigation');
    const r2 = nav2?.useRouter?.();
    if (r2) {
      // useEffect must be called in render; this dynamic require pattern preserves SSR compatibility like above
      const React = require('react');
      const useEffect = React.useEffect;
      useEffect(() => {
        try {
          const params = (typeof window !== 'undefined') ? new URLSearchParams(window.location.search) : new URLSearchParams();
          params.set('rating', ratingMin);
          // persist watchOnly as well
          params.set('watch', String(watchOnly ? 1 : 0));
          if (momentumOnly) params.set('momentum', 'rising'); else params.delete('momentum');
          if (alertsOnly) params.set('alerts', '1'); else params.delete('alerts');
          if (query && query.trim()) params.set('q', query.trim()); else params.delete('q');
          r2.replace(`/?${params.toString()}`);
        } catch {}
      }, [ratingMin, watchOnly, momentumOnly, alertsOnly, query]);
    }
  } catch {}

  // Initialize from URL on first render (cheap guard)
  try {
    const sk = search?.get("sort");
    const od = search?.get("order");
    const rm = search?.get("rating");
    const w = search?.get("watch");
    const q = search?.get("q");
    const mom = search?.get("momentum");
    const al = search?.get("alerts");
    if (sk && ["pool","fee","tvl","volume","apr","rating","updated"].includes(sk) && sortKey !== sk) setSortKey(sk as any);
    if (od && ["asc","desc"].includes(od) && sortDir !== od) setSortDir(od as any);
    if (rm && ["all","fair","good","excellent"].includes(rm) && ratingMin !== rm) setRatingMin(rm as any);
    if (w && ["1","true","yes"].includes(w.toLowerCase())) {
      // Best effort: guard against SSR
      try { setWatchOnly(true); } catch {}
    }
    if (q && q.length) {
      try { setQuery(q); } catch {}
    }
    if (mom && mom.toLowerCase() === 'rising') { try { setMomentumOnly(true); } catch {} }
    if (al && ["1","true","yes"].includes(al.toLowerCase())) { try { setAlertsOnly(true); } catch {} }
  } catch {}

  const rowsRaw = useMemo(() => data?.data ?? [], [data?.data]);
  const { items: watchlist, add: addWatch, remove: removeWatch } = useWatchlist();
  const advisorCounts = useMemo(() => {
    const counts = { excellent: 0, good: 0, warning: 0, danger: 0, critical: 0 } as Record<string, number>;
    for (const r of rowsRaw) {
      const sc = previewRating(r);
      const st = toStatus(sc);
      counts[st] = (counts[st] || 0) + 1;
    }
    return counts;
  }, [rowsRaw]);

  // Compute filtered counts for the rating buttons (based on current filters except rating)
  const filteredCounts = useMemo(() => {
    try {
      let arr = [...(rowsRaw || [])];
      // Apply search filter
      if (debouncedQuery && debouncedQuery.trim()) {
        const q = debouncedQuery.trim().toLowerCase();
        arr = arr.filter((r) => {
          try {
            const t0 = r?.token0?.symbol?.toLowerCase() || '';
            const t1 = r?.token1?.symbol?.toLowerCase() || '';
            const name = getPoolName(r)?.toLowerCase() || '';
            return t0.includes(q) || t1.includes(q) || name.includes(q);
          } catch {
            return false;
          }
        });
      }
      // Don't apply rating filter here - we want counts for all ratings
      const counts = { all: arr.length, excellent: 0, good: 0, warning: 0, danger: 0, critical: 0 } as Record<string, number>;
      for (const r of arr) {
        try {
          const sc = previewRating(r);
          const st = toStatus(sc);
          counts[st] = (counts[st] || 0) + 1;
        } catch {}
      }
      return counts;
    } catch {
      return { all: 0, excellent: 0, good: 0, warning: 0, danger: 0, critical: 0 };
    }
  }, [rowsRaw, debouncedQuery]);
  // Publish counts for dashboard header overview
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pp_health_counts', JSON.stringify(advisorCounts));
      }
    } catch {}
  }, [advisorCounts]);

  // Debounce search query (250ms)
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 250);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const rows = useMemo(() => {
    try {
      // Always apply client-side sort so header sorting and direction work consistently
      let arr = [...(rowsRaw || [])];
      if (debouncedQuery && debouncedQuery.trim()) {
        const q = debouncedQuery.trim().toLowerCase();
        arr = arr.filter((r) => {
          try {
            const t0 = r?.token0?.symbol?.toLowerCase() || '';
            const t1 = r?.token1?.symbol?.toLowerCase() || '';
            const name = getPoolName(r)?.toLowerCase() || '';
            return t0.includes(q) || t1.includes(q) || name.includes(q);
          } catch {
            return false;
          }
        });
      }
      if (ratingMin !== "all") {
        arr = arr.filter((r) => {
          try {
            const st = toStatus(previewRating(r));
            if (ratingMin === "excellent") return st === "excellent";
            if (ratingMin === "good") return st === "excellent" || st === "good";
            if (ratingMin === "fair") return st === "excellent" || st === "good" || st === "warning";
            return true;
          } catch {
            return false;
          }
        });
      }
      const dir = sortDir === "asc" ? 1 : -1;
      arr.sort((a, b) => {
        try {
          switch (sortKey) {
            case "pool": {
              const an = getPoolName(a) || '';
              const bn = getPoolName(b) || '';
              return an.localeCompare(bn) * dir;
            }
            case "fee": {
              const av = a.fee_tier ?? 0;
              const bv = b.fee_tier ?? 0;
              return (av - bv) * dir;
            }
            case "tvl": {
              const av = a.tvl_usd ?? 0;
              const bv = b.tvl_usd ?? 0;
              return (av - bv) * dir;
            }
            case "volume": {
              const av = a.volume_usd_24h ?? 0;
              const bv = b.volume_usd_24h ?? 0;
              return (av - bv) * dir;
            }
            case "apr": {
              const av = aprValue(a);
              const bv = aprValue(b);
              return (av - bv) * dir;
            }
            case "rating": {
              const av = previewRating(a);
              const bv = previewRating(b);
              return (av - bv) * dir;
            }
            case "updated": {
              const av = a.updated_at ? new Date(a.updated_at).getTime() : 0;
              const bv = b.updated_at ? new Date(b.updated_at).getTime() : 0;
              return (av - bv) * dir;
            }
            default:
              return 0;
          }
        } catch {
          return 0;
        }
      });
      return arr;
    } catch (err) {
      console.error('Error filtering/sorting rows:', err);
      return rowsRaw || [];
    }
  }, [rowsRaw, sortKey, sortDir, debouncedQuery, ratingMin]);

  const displayedRows = useMemo(() => {
    try {
      let base = rows || [];
      if (alertsOnly) {
        base = base.filter(r => r && recentAlertIds.has((r.id || '').toLowerCase()));
      }
      if (momentumOnly) {
        base = base.filter(r => r && risingIds.has((r.id || '').toLowerCase()));
      }
      if (!watchOnly) return base;
      const set = new Set((watchlist || []).map((w: any) => (w?.id || '').toLowerCase()));
      return base.filter(r => r && set.has((r.id || '').toLowerCase()));
    } catch (err) {
      console.error('Error applying displayedRows filters:', err);
      return rows || [];
    }
  }, [rows, alertsOnly, recentAlertIds, momentumOnly, risingIds, watchOnly, watchlist]);

  // Compute rising momentum set when filter enabled
  useEffect(() => {
    let canceled = false;
    async function run() {
      try {
        if (!momentumOnly) { setRisingIds(new Set()); return; }
        const ids = rows.map(r => r.id);
        // Fetch metrics in parallel for current rows
        const responses = await Promise.all(ids.map(async (id) => {
          try {
            const res = await fetch(`/api/pools/${id}/metrics`, { cache: 'no-store' });
            const json = await res.json();
            const rows = Array.isArray(json?.data) ? json.data : [];
            const mod = await import('@/lib/advisor/volumeAnalysis');
            const t = mod.volumeTrend(rows);
            return t.trend === 'rising' ? id.toLowerCase() : null;
          } catch {
            return null;
          }
        }));
        if (!canceled) setRisingIds(new Set(responses.filter(Boolean) as string[]));
      } catch {
        if (!canceled) setRisingIds(new Set());
      }
    }
    run();
    return () => { canceled = true };
  }, [momentumOnly, rows.map(r => r.id).join(',')]);

  function onHeaderSort(nextKey: typeof sortKey) {
    if (sortKey === nextKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(nextKey);
      // Default direction: numbers desc, names asc
      setSortDir(nextKey === "pool" ? "asc" : "desc");
    }
    // Reset to first page on sort change
    setPage(1);
    try {
      if (router) {
        const params = search || new URLSearchParams();
        params.set("sort", nextKey);
        params.set("order", sortDir === "asc" && sortKey === nextKey ? "desc" : "asc");
        router.replace(`/?${params.toString()}`);
      }
    } catch {}
  }

  function headerAria(key: typeof sortKey) {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  function sortCaret(key: typeof sortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? "â–²" : "â–¼";
  }

  const total = data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-3" aria-live="polite">
      <div className="flex items-center gap-3">
        <label className="text-sm opacity-80">Fee tier</label>
        <select
          className="rounded border border-black/10 dark:border-white/10 px-2 py-1 text-sm bg-transparent"
          value={fee}
          onChange={(e) => setFee(e.target.value as FeeFilter)}
        >
          {FEE_TIERS.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All" : `${t}`}
            </option>
          ))}
        </select>
        <label className="text-sm opacity-80 ml-4">Search</label>
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. ETH/USDC"
            className="rounded border border-black/10 dark:border-white/10 px-2 py-1 text-sm bg-transparent pr-6"
            aria-label="Search pools"
          />
          {isSearching && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60" aria-label="Searching">
              ...
            </span>
          )}
        </div>
        <label className="text-sm opacity-80 ml-4">Min rating</label>
        <select
          className="rounded border border-black/10 dark:border-white/10 px-2 py-1 text-sm bg-transparent"
          value={ratingMin}
          onChange={(e) => setRatingMin(e.target.value as any)}
        >
          <option value="all">All</option>
          <option value="good">Good+</option>
          <option value="excellent">Excellent only</option>
        </select>
        <div className="inline-flex items-center gap-2">
          <button
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 ${
              ratingMin === 'all'
                ? 'bg-primary-blue text-white border-primary-blue shadow-sm'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400'
            }`}
            onClick={() => setRatingMin('all')}
            aria-pressed={ratingMin === 'all'}
            title="Show all pools"
          >
            All <span className="font-semibold">{filteredCounts.all}</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 ${
              ratingMin === 'fair'
                ? 'bg-warning-yellow text-white border-warning-yellow shadow-sm'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400'
            }`}
            onClick={() => setRatingMin('fair')}
            aria-pressed={ratingMin === 'fair'}
            title="Show fair and better pools"
          >
            Fair+ <span className="font-semibold">{filteredCounts.warning + filteredCounts.good + filteredCounts.excellent}</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 ${
              ratingMin === 'good'
                ? 'bg-info-blue text-white border-info-blue shadow-sm'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400'
            }`}
            onClick={() => setRatingMin('good')}
            aria-pressed={ratingMin === 'good'}
            title="Show good and excellent pools"
          >
            Good+ <span className="font-semibold">{filteredCounts.good + filteredCounts.excellent}</span>
          </button>
          <button
            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-all duration-200 ${
              ratingMin === 'excellent'
                ? 'bg-success-green text-white border-success-green shadow-sm'
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:border-neutral-400'
            }`}
            onClick={() => setRatingMin('excellent')}
            aria-pressed={ratingMin === 'excellent'}
            title="Show excellent pools only"
          >
            Excellent <span className="font-semibold">{filteredCounts.excellent}</span>
          </button>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <AdvisorLegend />
          <div className="text-xs opacity-60">IL default:</div>
          {([5,10,20,50] as const).map((p) => (
            <button
              key={p}
              className="text-xs underline opacity-70 hover:opacity-100"
              onClick={() => { try { localStorage.setItem('pp_il_default', String(p)); } catch {} }}
              aria-label={`Set global IL default ${p}%`}
              title={`Set global IL default ${p}%`}
            >
              {p}%
            </button>
          ))}
          <label className="inline-flex items-center gap-1 text-xs opacity-80">
            <input type="checkbox" checked={watchOnly} onChange={(e) => setWatchOnly(e.target.checked)} aria-label="Show watchlist only" />
            Watchlist only
          </label>
          <label className="inline-flex items-center gap-1 text-xs opacity-80">
            <input type="checkbox" checked={momentumOnly} onChange={(e) => setMomentumOnly(e.target.checked)} aria-label="Show rising momentum only" />
            Rising only
          </label>
          <label className="inline-flex items-center gap-1 text-xs opacity-80">
            <input type="checkbox" checked={alertsOnly} onChange={(e) => setAlertsOnly(e.target.checked)} aria-label="Show recent alerts only" />
            Alerts only
          </label>
          <button
            className="text-xs underline opacity-70 hover:opacity-100"
            onClick={() => { try { (displayedRows || []).forEach(r => addWatch({ id: r.id, name: getPoolName(r) })); } catch {} }}
            aria-label="Add visible pools to watchlist"
            title="Add visible pools to watchlist"
          >
            Add visible to Watchlist
          </button>
          <button
            className="text-xs underline opacity-70 hover:opacity-100"
            onClick={() => { try { (displayedRows || []).forEach(r => removeWatch(r.id)); } catch {} }}
            aria-label="Remove visible pools from watchlist"
            title="Remove visible pools from watchlist"
          >
            Remove visible
          </button>
          <button
            className="text-xs underline opacity-70 hover:opacity-100"
            onClick={() => { try { const { remove } = require('./WatchlistStore'); (displayedRows || []).forEach((r: any) => remove?.remove?.(r.id)); } catch {} }}
            aria-label="Remove visible pools from watchlist"
            title="Remove visible pools from watchlist"
          >
            Remove visible
          </button>
          <ExportPoolsAdvisorCsvButton rows={displayedRows} label="Export Pools Advisor CSV" disabled={!displayedRows?.length} />
          <CopyPoolsAdvisorSummaryButton rows={displayedRows} label="Copy Advisor Summary" />
          <ExportWatchlistCsvButton label="Export Watchlist CSV" />
          <CopyLinkButton label="Copy View Link" />
          <button
            className="text-xs underline opacity-70 hover:opacity-100"
            onClick={() => { setFee('all'); setSortKey('tvl'); setSortDir('desc'); setRatingMin('all'); setPage(1); }}
            aria-label="Reset table filters"
            title="Reset"
          >
            Reset
          </button>
          <span className="text-xs opacity-60">Click table headers to sort</span>
        </div>
      </div>

      <div className="w-full h-2 rounded overflow-hidden border border-black/10 dark:border-white/10" title="Advisor distribution">
        {(() => { const total = rowsRaw.length || 1; const seg = (n: number) => `${(n/total)*100}%`; return (
          <div className="w-full flex">
            <div style={{ width: seg(advisorCounts.excellent), backgroundColor: 'var(--lifeguard-excellent)' }} aria-label="Excellent"></div>
            <div style={{ width: seg(advisorCounts.good), backgroundColor: 'var(--lifeguard-good)' }} aria-label="Good"></div>
            <div style={{ width: seg(advisorCounts.warning), backgroundColor: 'var(--lifeguard-warning)' }} aria-label="Fair"></div>
            <div style={{ width: seg(advisorCounts.danger), backgroundColor: 'var(--lifeguard-danger)' }} aria-label="Risky"></div>
            <div style={{ width: seg(advisorCounts.critical), backgroundColor: 'var(--lifeguard-critical)' }} aria-label="Critical"></div>
          </div>
        ); })()}
      </div>

      <WatchlistBar />

      <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm table-fixed" role="table" aria-label="Top pools table">
          <caption className="sr-only">Top pools by TVL, Volume and APR</caption>
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th scope="col" className="text-left px-3 py-2" aria-sort={headerAria("pool")}>
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onHeaderSort("pool")}>
                  Pool <span>{sortCaret("pool")}</span>
                </button>
              </th>
              <th scope="col" className="text-right px-3 py-2" aria-sort={headerAria("fee")}>
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onHeaderSort("fee")}>
                  Fee <span>{sortCaret("fee")}</span>
                </button>
              </th>
              <th scope="col" className="text-right px-3 py-2" aria-sort={headerAria("tvl")}>
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onHeaderSort("tvl")}>
                  TVL (USD) <span>{sortCaret("tvl")}</span>
                </button>
              </th>
              <th scope="col" className="text-right px-3 py-2" aria-sort={headerAria("volume")}>
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onHeaderSort("volume")}>
                  Vol 24h (USD) <span>{sortCaret("volume")}</span>
                </button>
              </th>
              <th scope="col" className="text-right px-3 py-2" aria-sort={headerAria("apr")}>
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onHeaderSort("apr")}>
                  Fee APR (est) <span>{sortCaret("apr")}</span>
                </button>
              </th>
              <th scope="col" className="text-right px-3 py-2" aria-sort={headerAria("rating")}>
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onHeaderSort("rating")}>
                  Rating <span>{sortCaret("rating")}</span>
                </button>
              </th>
              <th scope="col" className="text-right px-3 py-2" aria-sort={headerAria("updated")}>
                <button className="inline-flex items-center gap-1 hover:underline" onClick={() => onHeaderSort("updated")}>
                  Updated <span>{sortCaret("updated")}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody style={{ minHeight: '600px' }}>
            {isLoading && (
              <>
                {[...Array(limit)].map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-t border-black/5 dark:border-white/5">
                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        <div className="h-4 w-32 skeleton"></div>
                        <div className="h-3 w-24 skeleton"></div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-16 skeleton ml-auto"></div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-20 skeleton ml-auto"></div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-20 skeleton ml-auto"></div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-16 skeleton ml-auto"></div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-6 w-20 skeleton ml-auto"></div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-24 skeleton ml-auto"></div>
                    </td>
                  </tr>
                ))}
              </>
            )}
            {error && !isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-red-600">{String((error as any)?.message || error)}</td>
              </tr>
            )}
            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-6xl" role="img" aria-label="Empty pool">🏊‍♂️</div>
                    <div className="text-lg font-medium opacity-80">No Pools Found</div>
                    <div className="text-sm opacity-60 max-w-md">
                      {debouncedQuery ? `No pools match "${debouncedQuery}". Try a different search term.` : "No pool data available yet. Populate via /api/ingest/uniswap."}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && !error && displayedRows.length === 0 && rows.length > 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-6xl" role="img" aria-label="No results">🔍</div>
                    <div className="text-lg font-medium opacity-80">No Matching Pools</div>
                    <div className="text-sm opacity-60 max-w-md">
                      No pools match your current filters. Try adjusting your search or filter criteria.
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!isLoading && !error && displayedRows.map((p) => { const sc = previewRating(p); const st = toStatus(sc); const color = st==='excellent'?'var(--lifeguard-excellent)':st==='good'?'var(--lifeguard-good)':st==='warning'?'var(--lifeguard-warning)':st==='danger'?'var(--lifeguard-danger)':'var(--lifeguard-critical)'; const pulse = (st==='danger'||st==='critical') ? ' pulse-soft' : ''; return (
              <tr key={p.id} className={`border-t border-black/5 dark:border-white/5${pulse}`} style={{ borderLeft: `4px solid ${color}` }}>
                <td className="px-3 py-2">
                  <div className="font-medium flex items-center gap-2">
                    <WatchlistStar id={p.id} name={getPoolName(p)} />
                    <Link href={`/pool/${p.id}`} className="hover:underline">
                      {getPoolName(p)}
                    </Link>
                      {recentAlertIds.has((p.id || '').toLowerCase()) && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-600" title="Recent alert" aria-label="Recent alert">• ï¸ Alert</span>
                      )}
                      <AdvisorBadge status={st as any} score={sc} />
                  </div>
                  <div className="w-[120px] mt-1">
                    <HealthBar score={sc} status={st as any} />
                  </div>
                  <div className="text-xs opacity-60 font-mono">{getTokenPair(p)}</div>
                  {renderVtvlBadge(p)}
                  <PoolsMomentumBadge poolId={p.id} />
                  <PoolsFeeMomentumBadge poolId={p.id} />
                  <div className="flex items-center gap-2 mt-1 opacity-80">
                    <MetricTooltip label="Volume trend sparkline">Last ~30 points of daily volume from metrics endpoint.</MetricTooltip>
                    <div className="text-[10px] opacity-60">Vol</div>
                    <PoolsMiniSparkline poolId={p.id} metric="volumeUSD" />
                    <MetricTooltip label="Fees trend sparkline">Last ~30 points of daily fees from metrics endpoint.</MetricTooltip>
                    <div className="text-[10px] opacity-60">Fees</div>
                    <PoolsMiniSparkline poolId={p.id} metric="feesUSD" />
                  </div>
                  <div className="mt-1">
                    <WhyRatingLink tvlUsd={p.tvl_usd} volumeUsd24h={p.volume_usd_24h} feeTier={p.fee_tier ?? undefined} rating={st} score={sc} />
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  {fmtFeeTier(p.fee_tier)}
                  {(() => { try { const { pairMetaFromSymbols } = require('@/lib/advisor/pairMeta'); const { analyzeFeeTier } = require('@/lib/advisor/feeTier'); const meta = pairMetaFromSymbols(p.token0?.symbol, p.token1?.symbol); const adv = analyzeFeeTier(p.fee_tier ?? 0, meta); return (
                    <span className="ml-2 align-middle">
                      <MetricTooltip label="Fee tier fit">{adv.note}</MetricTooltip>
                    </span>
                  ); } catch { return null; } })()}
                </td>
                <td className="px-3 py-2 text-right">{fmtUsd(p.tvl_usd)}</td>
                <td className="px-3 py-2 text-right">{fmtUsd(p.volume_usd_24h)}</td>
                <td className="px-3 py-2 text-right">{fmtApr(p)}</td>
                <td className="px-3 py-2 text-right">
                  {(() => { const sc = previewRating(p); const st = toStatus(sc); const hasAlert = recentAlertIds.has((p.id || '').toLowerCase()); return (
                    <div className="inline-flex items-center gap-1 justify-end">
                      {hasAlert && <span className="text-[10px] text-red-600" title="Recent alert" aria-label="Recent alert">•¢</span>}
                      <AdvisorBadge status={st as any} score={sc} />
                      <MetricTooltip label="Preview">
                        Quick rating uses Volume:TVL, fee tier bonus, and a 10% IL penalty. Open pool for full advisor insights.
                      </MetricTooltip>
                    </div>
                  ); })()}
                </td>
                <td className="px-3 py-2 text-right">{fmtTime(p.updated_at)}</td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 justify-end text-sm">
        <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 disabled:opacity-50" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isLoading} aria-label="Previous page">Prev</button>
        <span className="opacity-70">Page {page} of {totalPages}</span>
        <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 disabled:opacity-50" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isLoading} aria-label="Next page">Next</button>
      </div>

      <p className="text-xs opacity-60">Tip: Use <code>/api/ingest/uniswap?limit=50</code> to seed data. If Supabase env is missing, the endpoint responds with <code>dryRun: true</code>.</p>
    </div>
  );
}

function short(addr: string) {
  if (!addr) return "-";
  return `${addr.slice(0, 6)}â€¦${addr.slice(-4)}`;
}

// Generate a fun, deterministic pool name from pool ID
function generatePoolName(poolId: string): string {
  const adjectives = [
    "Soaking", "Dancing", "Happy", "Bouncing", "Sparkling", "Golden", "Silver",
    "Mystic", "Cosmic", "Turbo", "Swift", "Mighty", "Gentle", "Wild", "Calm",
    "Blazing", "Frozen", "Electric", "Quantum", "Stellar", "Lucky", "Bold",
    "Clever", "Rapid", "Silent", "Loud", "Bright", "Dark", "Shiny", "Fluffy"
  ];
  const animals = [
    "Hog", "Fox", "Bear", "Bull", "Whale", "Shark", "Dolphin", "Eagle",
    "Tiger", "Lion", "Panda", "Koala", "Otter", "Badger", "Raccoon", "Wolf",
    "Hawk", "Falcon", "Dragon", "Phoenix", "Unicorn", "Pegasus", "Griffin",
    "Kraken", "Narwhal", "Platypus", "Axolotl", "Capybara", "Lemur", "Lynx"
  ];

  // Use pool ID to deterministically select words
  const hash = poolId.toLowerCase().replace(/[^0-9a-f]/g, '');
  const adjIndex = parseInt(hash.slice(2, 10), 16) % adjectives.length;
  const animalIndex = parseInt(hash.slice(10, 18), 16) % animals.length;

  return `${adjectives[adjIndex]}${animals[animalIndex]}`;
}

function getPoolName(pool: PoolRow): string {
  // Always return the fun generated name
  return generatePoolName(pool.id);
}

function getTokenPair(pool: PoolRow): string {
  const token0Symbol = pool.token0?.symbol;
  const token1Symbol = pool.token1?.symbol;
  const feeTier = pool.fee_tier ? ` â€¢ ${(pool.fee_tier / 10000).toFixed(2)}%` : '';

  if (token0Symbol && token1Symbol) {
    return `${token0Symbol} / ${token1Symbol}${feeTier}`;
  }
  return `${short(pool.token0_id)} / ${short(pool.token1_id)}${feeTier}`;
}

function fmtFeeTier(feeTier: number | null): string {
  if (feeTier == null) return "-";
  return `${(feeTier / 10000).toFixed(2)}%`;
}

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v <= 0 ? "-" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtTime(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

function aprValue(p: PoolRow) {
  const tvl = p.tvl_usd ?? 0;
  const vol = p.volume_usd_24h ?? 0;
  const fee = (p.fee_tier ?? 0) / 1_000_000; // 3000 -> 0.003
  if (tvl <= 0 || vol <= 0 || fee <= 0) return 0;
  return (vol * fee * 365) / tvl;
}

function fmtApr(p: PoolRow) {
  const v = aprValue(p);
  if (v <= 0) return "-";
  return (v * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%";
}

function renderVtvlBadge(p: PoolRow) {
  const tvl = p.tvl_usd ?? 0;
  if (tvl <= 0) return <div className="mt-1 text-[11px] opacity-50">V:TVL -</div>;
  const vol = p.volume_usd_24h ?? 0;
  const { score, rating } = scoreVolumeToTVL(vol, tvl);
  const status = score >= 9 ? 'excellent' : score >= 7 ? 'good' : score >= 5 ? 'warning' : score >= 3 ? 'danger' : 'critical';
  return (
    <div className="mt-1 flex items-center gap-2 text-[11px]">
      <span className="opacity-60">V:TVL</span>
      <AdvisorBadge status={status as any} label={rating} />
    </div>
  );
}









