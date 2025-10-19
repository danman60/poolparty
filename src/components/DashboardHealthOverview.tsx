"use client";

import { useEffect, useState } from "react";
import HealthBar from "./advisor/HealthBar";

export default function DashboardHealthOverview() {
  const [avg, setAvg] = useState<number | null>(null);
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const raw = localStorage.getItem('pp_health_spark');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr) && arr.length) {
          const a = arr.map((n: any) => Number(n)).filter((n: number) => Number.isFinite(n));
          if (a.length) setAvg(Math.max(0, Math.min(100, a.reduce((x: number, y: number) => x + y, 0) / a.length)));
        }
      }
    } catch {}
  }, []);
  if (avg == null) return null;
  const status = avg >= 85 ? 'excellent' : avg >= 70 ? 'good' : avg >= 55 ? 'warning' : avg >= 40 ? 'danger' : 'critical';
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <span className="opacity-70">Recent health</span>
      <div className="w-24"><HealthBar score={Math.round(avg)} status={status as any} /></div>
      <span className="opacity-60">{Math.round(avg)}%</span>
    </div>
  );
}

