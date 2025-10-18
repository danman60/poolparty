"use client";

import { useQuery } from "@tanstack/react-query";

type Row = { date: string; tvlUSD: number; feesUSD: number };

export default function PoolAprBadge({ poolId, days = 30 }: { poolId: string; days?: number }) {
  const { data, isLoading, error } = useQuery<{ data: Row[] }>({
    queryKey: ["poolApr", poolId, days],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${poolId}/metrics?days=${days}`, { cache: "no-store" as any });
      return res.json();
    },
    staleTime: 5 * 60_000,
  });

  if (isLoading || error) return null;
  const rows = data?.data || [];
  if (rows.length === 0) return null;
  const last = rows[rows.length - 1];
  const apr = last && last.tvlUSD > 0 ? (last.feesUSD * 365) / last.tvlUSD : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm opacity-70">Latest APR (annualized)</div>
      <div className="text-sm font-semibold">{asPct(apr)}</div>
    </div>
  );
}

function asPct(n: number) {
  return (n).toLocaleString(undefined, { style: 'percent', maximumFractionDigits: 2 });
}

