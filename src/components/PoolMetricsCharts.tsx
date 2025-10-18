"use client";
import MetricTooltip from "@/components/advisor/MetricTooltip";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { date: string; tvlUSD: number; volumeUSD: number; feesUSD: number };

export default function PoolMetricsCharts({ poolId }: { poolId: string }) {
  const [days, setDays] = useState(60);
  const { data, isLoading, error } = useQuery<{ data: Row[] }>({
    queryKey: ["poolMetrics", poolId, days],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${poolId}/metrics?days=${days}` as any, { cache: "no-store" as any });
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const rows = data?.data ?? [];
  const aprRows = rows.map(r => ({ date: r.date, aprAnnual: r.tvlUSD > 0 ? (r.feesUSD * 365) / r.tvlUSD : 0 }));

  return (
    <div className="space-y-4">
      {isLoading && <div className="text-sm opacity-70">Loading metrics…</div>}
      {error && <div className="text-sm text-red-600">Failed to load metrics</div>}

      {!isLoading && !error && rows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="col-span-2 flex items-center gap-2 text-xs opacity-70">
            <MetricTooltip label="Window">
              Select how many past days to include when charting fees, volume and APR.
            </MetricTooltip>
            <button
              onClick={() => setDays(30)}
              aria-label="Show 30 days of data"
              className={`px-2 py-1 rounded border border-black/10 dark:border-white/10 ${days===30 ? 'opacity-100' : 'opacity-60'}`}
            >
              30d
            </button>
            <button
              onClick={() => setDays(60)}
              aria-label="Show 60 days of data"
              className={`px-2 py-1 rounded border border-black/10 dark:border-white/10 ${days===60 ? 'opacity-100' : 'opacity-60'}`}
            >
              60d
            </button>
            <button
              onClick={() => setDays(90)}
              aria-label="Show 90 days of data"
              className={`px-2 py-1 rounded border border-black/10 dark:border-white/10 ${days===90 ? 'opacity-100' : 'opacity-60'}`}
            >
              90d
            </button>
          </div>
          <ChartCard title="Volume (USD)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rows} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} hide={true} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip formatter={(v) => asUsd(Number(v))} labelClassName="text-xs" />
                <Bar dataKey="volumeUSD" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Fees (USD)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={rows} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} hide={true} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip formatter={(v) => asUsd(Number(v))} labelClassName="text-xs" />
                <Area type="monotone" dataKey="feesUSD" stroke="#f59e0b" fill="#f59e0b33" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {!isLoading && !error && aprRows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          <ChartCard title="APR (Annualized)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={aprRows} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} hide={true} />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip formatter={(v) => asPct(Number(v))} labelClassName="text-xs" />
                <Area type="monotone" dataKey="aprAnnual" stroke="#3b82f6" fill="#3b82f633" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="text-sm opacity-70">No metrics available for this pool.</div>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
      <div className="text-sm opacity-70 mb-2">{title}</div>
      {children}
    </div>
  );
}

function asUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function asPct(n: number) {
  return (n).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 });
}

