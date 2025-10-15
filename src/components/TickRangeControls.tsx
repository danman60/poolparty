"use client";

type Props = {
  tickSpacing: number;
  currentTick?: number | null;
  lower: string;
  upper: string;
  onLower: (v: string) => void;
  onUpper: (v: string) => void;
};

export default function TickRangeControls({ tickSpacing, currentTick, lower, upper, onLower, onUpper }: Props) {
  const lo = Number(lower);
  const hi = Number(upper);
  const width = Number.isFinite(lo) && Number.isFinite(hi) ? hi - lo : 0;

  function stepLower(delta: number) {
    const v = Number.isFinite(lo) ? lo + delta * tickSpacing : 0;
    onLower(String(nearest(v, tickSpacing)));
  }

  function stepUpper(delta: number) {
    const v = Number.isFinite(hi) ? hi + delta * tickSpacing : 0;
    onUpper(String(nearest(v, tickSpacing)));
  }

  function setAround(mult: number) {
    if (typeof currentTick !== 'number' || !Number.isFinite(currentTick)) return;
    const w = tickSpacing * mult;
    onLower(String(nearest(currentTick - w, tickSpacing)));
    onUpper(String(nearest(currentTick + w, tickSpacing, true)));
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <span className="opacity-70">Range width:</span>
        <span>{Number.isFinite(width) ? width : '—'} ticks</span>
        {typeof currentTick === 'number' && (
          <span className="ml-auto opacity-70">Current tick: {currentTick}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs" onClick={() => stepLower(-1)}>-</button>
        <span className="text-xs opacity-70">Lower</span>
        <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs" onClick={() => stepLower(1)}>+</button>

        <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-2" />

        <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs" onClick={() => stepUpper(-1)}>-</button>
        <span className="text-xs opacity-70">Upper</span>
        <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs" onClick={() => stepUpper(1)}>+</button>

        {typeof currentTick === 'number' && (
          <div className="ml-auto flex items-center gap-2">
            <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs" onClick={() => setAround(50)}>±50</button>
            <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs" onClick={() => setAround(100)}>±100</button>
            <button className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs" onClick={() => setAround(200)}>±200</button>
          </div>
        )}
      </div>
    </div>
  );
}

function nearest(tick: number, spacing: number, up = false) {
  if (!Number.isFinite(tick) || !spacing) return tick;
  const n = Math.floor(tick / spacing) * spacing;
  return up && n !== tick ? n + spacing : n;
}

