"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { ts: string; tvl_usd: number | null };

export default function PoolSparkline({ data }: { data: Point[] }) {
  const ready = Array.isArray(data) && data.length > 0;
  if (!ready) {
    return <div className="h-32 flex items-center justify-center text-xs opacity-70">No snapshot data</div>;
  }
  const points = data.map((d) => ({
    ts: new Date(d.ts).toLocaleDateString(),
    tvl: d.tvl_usd ?? 0,
  }));
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <XAxis
            dataKey="ts"
            hide
            tick={{ fontSize: 10, fill: 'var(--foreground)', opacity: 0.7 }}
          />
          <YAxis
            hide
            domain={["auto", "auto"]}
            tick={{ fontSize: 10, fill: 'var(--foreground)', opacity: 0.7 }}
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
          <Line type="monotone" dataKey="tvl" stroke="#3b82f6" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function asUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

