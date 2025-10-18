"use client";

type Status = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';

export default function AdvisorBadge({ status, score, label }: { status: Status; score?: number; label?: string }) {
  const text = label ?? statusLabel(status);
  return (
    <div className={`badge-${status} px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap`}
      title={text}
      aria-label={`${text}${typeof score === 'number' ? ` ${score}` : ''}`}
    >
      <span className="mr-1">{statusEmoji(status)}</span>
      {typeof score === 'number' ? score : text}
    </div>
  );
}

function statusEmoji(s: Status) {
  switch (s) {
    case 'excellent': return '💎';
    case 'good': return '🟢';
    case 'warning': return '🟡';
    case 'danger': return '🟠';
    case 'critical': return '🔴';
  }
}

function statusLabel(s: Status) {
  switch (s) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Good';
    case 'warning': return 'Fair';
    case 'danger': return 'Risky';
    case 'critical': return 'Critical';
  }
}

