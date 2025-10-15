"use client";

type Props = {
  tickSpacing: number;
  currentTick?: number | null;
  lower: string;
  upper: string;
  onLower: (v: string) => void;
  onUpper: (v: string) => void;
  span?: number; // number of spacings to show around current (default 500)
};

export default function TickRangeSlider({ tickSpacing, currentTick, lower, upper, onLower, onUpper, span = 500 }: Props) {
  if (typeof currentTick !== 'number' || !Number.isFinite(currentTick) || !tickSpacing) return null;
  const loBound = nearest(currentTick - span * tickSpacing, tickSpacing);
  const hiBound = nearest(currentTick + span * tickSpacing, tickSpacing, true);

  // clamp and align
  const lo = clamp(nearest(Number(lower), tickSpacing), loBound, hiBound - tickSpacing);
  const hi = clamp(nearest(Number(upper), tickSpacing, true), loBound + tickSpacing, hiBound);

  const toPct = (tick: number) => ((tick - loBound) / (hiBound - loBound)) * 100;
  const fromPct = (pct: number) => loBound + ((hiBound - loBound) * pct) / 100;

  return (
    <div className="space-y-2">
      <div className="text-xs opacity-70">Adjust range (±{span} spacings around current)</div>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <div className="absolute -top-1 h-4 w-px bg-blue-500" style={{ left: `${toPct(currentTick)}%` }} aria-label="Mid-price marker" />
          <input
            type="range"
            min={0}
            max={100}
            value={toPct(lo)}
            onChange={(e) => {
              const pct = Number(e.target.value);
              const next = nearest(fromPct(pct), tickSpacing);
              onLower(String(clamp(next, loBound, hi - tickSpacing)));
            }}
            className="w-full"
            aria-label="Lower tick"
          />
        </div>
        <span className="text-xs w-20 text-right">{lo}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={toPct(hi)}
          onChange={(e) => {
            const pct = Number(e.target.value);
            const next = nearest(fromPct(pct), tickSpacing, true);
            onUpper(String(clamp(next, lo + tickSpacing, hiBound)));
          }}
          className="w-full"
          aria-label="Upper tick"
        />
        <span className="text-xs w-20 text-right">{hi}</span>
      </div>
    </div>
  );
}

function nearest(tick: number, spacing: number, up = false) {
  if (!Number.isFinite(tick) || !spacing) return tick;
  const n = Math.floor(tick / spacing) * spacing;
  return up && n !== tick ? n + spacing : n;
}

function clamp(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}
