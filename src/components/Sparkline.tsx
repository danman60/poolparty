"use client";

export default function Sparkline({ values, height = 24, stroke = "currentColor" }: { values: number[]; height?: number; stroke?: string }) {
  const w = 100; // percentage width
  const h = height;
  const vals = (values || []).slice(-30);
  if (!vals.length) return <div style={{ height: h }} className="opacity-50 text-[11px] flex items-center">No data</div>;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1 || 1)) * w;
    const y = h - ((v - min) / range) * (h - 2) - 1; // padding 1px
    return `${x},${y}`;
  });
  const path = `M ${pts.join(" L ")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" width="100%" height={h} aria-label="sparkline">
      <path d={path} fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}

