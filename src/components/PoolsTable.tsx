"use client";

import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import AdvisorBadge from "./advisor/AdvisorBadge";
import MetricTooltip from "@/components/advisor/MetricTooltip";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { ilFromPriceChange, ilRiskLevel } from "@/lib/advisor/impermanentLoss";

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
  // Fee tier bonus
  if (feeRate >= 0.01) score += 5; else if (feeRate >= 0.003) score += 2;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export default function PoolsTable() {
  const [fee, setFee] = useState<FeeFilter>("all");
  const [sortKey, setSortKey] = useState<"pool" | "fee" | "tvl" | "volume" | "apr" | "rating" | "updated">("tvl");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [ratingMin, setRatingMin] = useState<"all" | "good" | "excellent">("all");
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

  const rowsRaw = useMemo(() => data?.data ?? [], [data?.data]);
  const rows = useMemo(() => {
    // Always apply client-side sort so header sorting and direction work consistently
    let arr = [...rowsRaw];
    if (ratingMin !== "all") {
      arr = arr.filter((r) => {
        const st = toStatus(previewRating(r));
        if (ratingMin === "excellent") return st === "excellent";
        return st === "excellent" || st === "good";
      });
    }
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortKey) {
        case "pool": {
          const an = getPoolName(a);
          const bn = getPoolName(b);
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
      }
    });
    return arr;
  }, [rowsRaw, sortKey, sortDir]);

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
  }

  function headerAria(key: typeof sortKey) {
    if (sortKey !== key) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  }

  function sortCaret(key: typeof sortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? "^" : "v";
  }

  function caret(key: typeof sortKey) {
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
        <div className="ml-auto text-xs opacity-60">Click table headers to sort</div>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm" role="table" aria-label="Top pools table">
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
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center opacity-70">Loading pools...€¦</td>
              </tr>
            )}
            {error && !isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-red-600">{String((error as any)?.message || error)}</td>
              </tr>
            )}
            {!isLoading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center opacity-70">No data yet. Populate via /api/ingest/uniswap.</td>
              </tr>
            )}
            {!isLoading && !error && rows.map((p) => (
              <tr key={p.id} className="border-t border-black/5 dark:border-white/5">
                <td className="px-3 py-2">
                  <a className="hover:underline" href={`/pool/${p.id}`}>
                    <div className="font-medium">{getPoolName(p)}</div>
                    <div className="text-xs opacity-60 font-mono">{getTokenPair(p)}</div>
                  </a>
                  {renderVtvlBadge(p)}
                </td>
                <td className="px-3 py-2 text-right">{fmtFeeTier(p.fee_tier)}</td>
                <td className="px-3 py-2 text-right">{fmtUsd(p.tvl_usd)}</td>
                <td className="px-3 py-2 text-right">{fmtUsd(p.volume_usd_24h)}</td>
                <td className="px-3 py-2 text-right">{fmtApr(p)}</td>
                <td className="px-3 py-2 text-right">
                  {(() => { const sc = previewRating(p); const st = toStatus(sc); return (
                    <div className="inline-flex items-center gap-1 justify-end">
                      <AdvisorBadge status={st as any} score={sc} />
                      <MetricTooltip label="Preview">
                        Quick rating uses Volume:TVL, fee tier bonus, and a 10% IL penalty. Open pool for full advisor insights.
                      </MetricTooltip>
                    </div>
                  ); })()}
                </td>
                <td className="px-3 py-2 text-right">{fmtTime(p.updated_at)}</td>
              </tr>
            ))}
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
  if (!addr) return "â€”";
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
  if (feeTier == null) return "â€”";
  return `${(feeTier / 10000).toFixed(2)}%`;
}

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v === 0 ? "â€”" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtTime(iso?: string | null) {
  if (!iso) return "â€”";
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
  if (v <= 0) return "â€”";
  return (v * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%";
}

function renderVtvlBadge(p: PoolRow) {
  const tvl = p.tvl_usd ?? 0;
  if (tvl <= 0) return <div className="mt-1 text-[11px] opacity-50">V:TVL â€”</div>;
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



