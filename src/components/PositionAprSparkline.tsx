"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

type Row = { date: string; tvlUSD: number; feesUSD: number };

export default function PositionAprSparkline({ poolId }: { poolId: string }) {
  const { data } = useQuery<{ data: Row[] }>({
    queryKey: ["poolMetrics", poolId, 30],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${poolId}/metrics?days=30`, { cache: "no-store" });
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  const rows = (data?.data || []).map((r) => ({ date: r.date, aprAnnual: r.tvlUSD > 0 ? (r.feesUSD * 365) / r.tvlUSD : 0 }));
  const latest = rows.length > 0 ? rows[rows.length - 1].aprAnnual : 0;

  if (rows.length === 0) return null;

  return (
    <div className="grid grid-cols-2 items-center gap-3">
      <div>
        <div className="text-xs opacity-60">APR (annualized)</div>
        <div className="text-sm font-semibold">{asPct(latest)}</div>
      </div>
      <div className="h-[48px]">
        <ResponsiveContainer width="100%" height={48}>
          <AreaChart data={rows} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <Area type="monotone" dataKey="aprAnnual" stroke="#3b82f6" fill="#3b82f633" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function asPct(n: number) {
  return (n).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 });
}

