"use client";

import { useEffect, useState } from "react";
import Sparkline from "@/components/Sparkline";

type MetricKey = 'volumeUSD' | 'feesUSD' | 'tvlUSD';

export default function PoolsMiniSparkline({ poolId, metric = 'volumeUSD', stroke }: { poolId: string; metric?: MetricKey; stroke?: string }) {
  const [values, setValues] = useState<number[] | null>(null);
  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const res = await fetch(`/api/pools/${poolId}/metrics`, { cache: 'no-store' });
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const vals = rows.map((r: any) => Number(r[metric] ?? 0)).filter((n: number) => Number.isFinite(n));
        if (!canceled) setValues(vals);
      } catch { if (!canceled) setValues([]); }
    }
    load();
    return () => { canceled = true; };
  }, [poolId, metric]);

  if (!values) return <div className="opacity-50 text-[11px]">…</div>;
  return (
    <div className="w-[120px]">
      <Sparkline values={values} height={18} stroke={stroke || 'currentColor'} />
    </div>
  );
}

