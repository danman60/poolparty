"use client";

type Status = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';

export default function HealthBar({ score, status }: { score: number; status: Status }) {
  const pct = Math.max(0, Math.min(100, Number(score || 0)));
  const color = status === 'excellent' ? 'var(--lifeguard-excellent)'
    : status === 'good' ? 'var(--lifeguard-good)'
    : status === 'warning' ? 'var(--lifeguard-warning)'
    : status === 'danger' ? 'var(--lifeguard-danger)'
    : 'var(--lifeguard-critical)';
  return (
    <div className="w-full h-1.5 rounded bg-black/10 dark:bg-white/10 overflow-hidden" aria-label={`Health ${pct}`}> 
      <div style={{ width: `${pct}%`, backgroundColor: color }} className="h-full" />
    </div>
  );
}

