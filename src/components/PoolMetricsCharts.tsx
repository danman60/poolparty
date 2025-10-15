"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Row = { date: string; tvlUSD: number; volumeUSD: number; feesUSD: number };

export default function PoolMetricsCharts({ poolId }: { poolId: string }) {
  const { data, isLoading, error } = useQuery<{ data: Row[] }>({
    queryKey: ["poolMetrics", poolId],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${poolId}/metrics`, { cache: "no-store" });
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-4">
      {isLoading && <div className="text-sm opacity-70">Loading metrics…</div>}
      {error && <div className="text-sm text-red-600">Failed to load metrics</div>}

      {!isLoading && !error && rows.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
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

