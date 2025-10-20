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
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card skeleton" style={{ height: '260px' }}></div>
          <div className="card skeleton" style={{ height: '260px' }}></div>
          <div className="card skeleton" style={{ height: '260px' }}></div>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="text-sm text-red-600 dark:text-red-400">
            <strong>Failed to load metrics</strong>
            <p className="text-xs mt-1 opacity-80">Please try refreshing the page or contact support if the issue persists.</p>
          </div>
        </div>
      )}

      {!isLoading && !error && rows.length === 0 && (
        <div className="chart-empty">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No historical data available for this pool yet</p>
            <p className="text-xs mt-1 opacity-70">Charts will appear once data is collected</p>
          </div>
        </div>
      )}

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
              <BarChart data={rows} margin={{ left: 48, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--neutral-600)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  interval="preserveStartEnd"
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--neutral-600)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(val) => val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : val >= 1000 ? `$${(val/1000).toFixed(0)}k` : `$${val.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(v) => asUsd(Number(v))}
                  labelClassName="text-xs"
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="volumeUSD" fill="var(--success-green)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Fees (USD)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={rows} margin={{ left: 48, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--neutral-600)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  interval="preserveStartEnd"
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--neutral-600)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(val) => val >= 1000000 ? `$${(val/1000000).toFixed(1)}M` : val >= 1000 ? `$${(val/1000).toFixed(0)}k` : `$${val.toFixed(0)}`}
                />
                <Tooltip
                  formatter={(v) => asUsd(Number(v))}
                  labelClassName="text-xs"
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Area type="monotone" dataKey="feesUSD" stroke="var(--warning-yellow)" fill="rgba(245, 158, 11, 0.2)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {!isLoading && !error && aprRows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          <ChartCard title="APR (Annualized)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={aprRows} margin={{ left: 48, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--neutral-600)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  interval="preserveStartEnd"
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--neutral-600)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickFormatter={(val) => `${(val * 100).toFixed(1)}%`}
                />
                <Tooltip
                  formatter={(v) => asPct(Number(v))}
                  labelClassName="text-xs"
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Area type="monotone" dataKey="aprAnnual" stroke="var(--info-blue)" fill="rgba(59, 130, 246, 0.2)" strokeWidth={2.5} />
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
    <div className="card card-compact">
      <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">{title}</h4>
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

