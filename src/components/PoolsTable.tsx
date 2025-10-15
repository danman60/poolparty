"use client";

import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

type PoolRow = {
  id: string;
  chain: string;
  token0_id: string;
  token1_id: string;
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

export default function PoolsTable() {
  const [fee, setFee] = useState<FeeFilter>("all");
  const [sort, setSort] = useState<"tvl" | "volume" | "apr">("tvl");
  const [page, setPage] = useState(1);
  const limit = 10;

  const apiSort = sort === "apr" ? "tvl" : sort;

  const { data, isLoading, error } = useQuery<ApiResponse>({
    queryKey: ["pools", { fee, sort: apiSort, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit), sort: apiSort });
      if (fee !== "all") params.set("fee", fee);
      const res = await fetch(`/api/pools?${params.toString()}`, { cache: "no-store" });
      return res.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const rowsRaw = useMemo(() => data?.data ?? [], [data?.data]);
  const rows = useMemo(() => {
    if (sort !== "apr") return rowsRaw;
    return [...rowsRaw].sort((a, b) => aprValue(b) - aprValue(a));
  }, [rowsRaw, sort]);

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
        <div className="ml-auto flex items-center gap-2 text-sm">
          <span className="opacity-80">Sort by</span>
          <button
            className={`px-2 py-1 rounded border text-xs ${
              sort === "tvl" ? "bg-black text-white dark:bg-white dark:text-black" : "border-black/10 dark:border-white/10"
            }`}
            onClick={() => setSort("tvl")}
          >
            TVL
          </button>
          <button
            className={`px-2 py-1 rounded border text-xs ${
              sort === "volume" ? "bg-black text-white dark:bg-white dark:text-black" : "border-black/10 dark:border-white/10"
            }`}
            onClick={() => setSort("volume")}
          >
            Volume 24h
          </button>
          <button
            className={`px-2 py-1 rounded border text-xs ${
              sort === "apr" ? "bg-black text-white dark:bg-white dark:text-black" : "border-black/10 dark:border-white/10"
            }`}
            onClick={() => setSort("apr")}
          >
            Fee APR
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-black/10 dark:border-white/10 overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm" role="table" aria-label="Top pools table">
          <caption className="sr-only">Top pools by TVL, Volume and APR</caption>
          <thead className="bg-black/5 dark:bg-white/5">
            <tr>
              <th scope="col" className="text-left px-3 py-2">Pool</th>
              <th scope="col" className="text-right px-3 py-2">Fee</th>
              <th scope="col" className="text-right px-3 py-2">TVL (USD)</th>
              <th scope="col" className="text-right px-3 py-2">Vol 24h (USD)</th>
              <th scope="col" className="text-right px-3 py-2">Fee APR (est)</th>
              <th scope="col" className="text-right px-3 py-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center opacity-70">Loading pools…</td>
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
                <td className="px-3 py-2"><a className="hover:underline" href={`/pool/${p.id}`}>{short(p.token0_id)} / {short(p.token1_id)}</a></td>
                <td className="px-3 py-2 text-right">{p.fee_tier ?? "—"}</td>
                <td className="px-3 py-2 text-right">{fmtUsd(p.tvl_usd)}</td>
                <td className="px-3 py-2 text-right">{fmtUsd(p.volume_usd_24h)}</td>
                <td className="px-3 py-2 text-right">{fmtApr(p)}</td>
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
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v === 0 ? "—" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtTime(iso?: string | null) {
  if (!iso) return "—";
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
  if (v <= 0) return "—";
  return (v * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%";
}


