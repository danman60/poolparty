"use client";

import { useEffect, useState } from "react";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { ilFromPriceChange, breakEvenVolumeUsd, ilRiskLevel } from "@/lib/advisor/impermanentLoss";
import { volumeTrend, feeMomentum } from "@/lib/advisor/volumeAnalysis";
import { useRouter, useSearchParams } from "next/navigation";
import MetricTooltip from "@/components/advisor/MetricTooltip";

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v <= 0 ? "-" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function PoolAdvisor({ poolId, tvlUsd, volume24hUsd, feeTier }: { poolId?: string; tvlUsd?: number | null; volume24hUsd?: number | null; feeTier?: number | null }) {
  const tvl = tvlUsd ?? 0;
  const vol = volume24hUsd ?? 0;
  const feeRate = (feeTier ?? 0) / 1_000_000; // 3000 -> 0.003

  const vScore = scoreVolumeToTVL(vol, tvl);

  // Adjustable IL scenario (default 10%)
  const router = useRouter();
  const params = useSearchParams();
  const [ilPct, setIlPct] = useState<number>(10);
  const ilVal = ilFromPriceChange(ilPct);
  const beVol = breakEvenVolumeUsd(tvl, feeRate, ilVal);
  const ilPctLabel = (ilVal * 100).toFixed(2) + "%";
  const ilRisk = ilRiskLevel(ilVal);

  const [trend, setTrend] = useState<{ trend: 'rising'|'flat'|'falling'; pctChange7d: number } | null>(null);
  const [fees, setFees] = useState<{ trend: 'rising'|'flat'|'falling'; pctChange7d: number } | null>(null);
  useEffect(() => {
    let canceled = false;
    async function load() {
      if (!poolId) return;
      try {
        const res = await fetch(`/api/pools/${poolId}/metrics`, { cache: 'no-store' });
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        const t = volumeTrend(rows);
        const f = feeMomentum(rows);
        if (!canceled) { setTrend(t); setFees(f); }
      } catch {}
    }
    load();
    return () => { canceled = true };
  }, [poolId]);

  // Persist IL preset per-pool (client-only) and allow URL override (?il=)
  useEffect(() => {
    try {
      if (!poolId || typeof window === 'undefined') return;
      const urlIl = params?.get('il');
      if (urlIl) {
        const v = Number(urlIl);
        if (Number.isFinite(v) && v >= 1 && v <= 80) { setIlPct(v); return; }
      }
      // Prefer per-pool saved value; otherwise use global default if present
      const per = localStorage.getItem(`pp_il_${poolId}`);
      if (per) {
        const v = Number(per);
        if (Number.isFinite(v) && v >= 1 && v <= 80) { setIlPct(v); return; }
      }
      const glob = localStorage.getItem('pp_il_default');
      if (glob) {
        const v = Number(glob);
        if (Number.isFinite(v) && v >= 1 && v <= 80) setIlPct(v);
      }
    } catch {}
  }, [poolId, params]);

  useEffect(() => {
    try {
      if (!poolId || typeof window === 'undefined') return;
      localStorage.setItem(`pp_il_${poolId}`, String(ilPct));
      // reflect in URL for shareability
      const q = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      q.set('il', String(ilPct));
      router?.replace(`?${q.toString()}`);
    } catch {}
  }, [poolId, ilPct, router]);

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-70">Advisor Insights</div>

      <div className="grid md:grid-cols-4 gap-3 text-sm">
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
          <div className="text-xs opacity-60">Volume to TVL</div>
          <div className="font-medium">{vScore.rating}</div>
          <div className="text-xs opacity-60">Score {vScore.score}/10 - {vScore.description}</div>
        </div>
        <div className="card card-compact space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              IL @ Price Move
              <MetricTooltip label="Impermanent Loss">
                Simulate IL at different price movements. Higher % = more volatile price scenarios.
              </MetricTooltip>
            </div>
            <div className="inline-flex gap-1">
              {[5,10,20,50].map(p => (
                <button
                  key={p}
                  className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all duration-200 ${
                    ilPct === p
                      ? 'bg-primary-blue text-white border-primary-blue shadow-sm'
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }`}
                  onClick={() => setIlPct(p)}
                  aria-label={`Set IL scenario to ${p}% price move`}
                  title={`Simulate ${p}% price move`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min={1}
              max={80}
              step={1}
              value={ilPct}
              onChange={(e) => setIlPct(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-neutral-200 dark:bg-neutral-700"
              style={{
                background: `linear-gradient(to right, var(--primary-blue) 0%, var(--primary-blue) ${((ilPct - 1) / 79) * 100}%, var(--neutral-200) ${((ilPct - 1) / 79) * 100}%, var(--neutral-200) 100%)`
              }}
              aria-label="Price move percent slider"
              title={`Current: ${ilPct}% price move`}
            />
            <div
              className="absolute -top-8 left-0 px-2 py-1 bg-neutral-900 text-white text-xs rounded shadow-lg pointer-events-none"
              style={{ left: `calc(${((ilPct - 1) / 79) * 100}% - 20px)` }}
            >
              {ilPct}%
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium text-lg">{ilPctLabel} IL</div>
            <div className={`text-xs font-semibold px-2 py-1 rounded ${
              ilRisk === 'low' ? 'bg-success-green/20 text-success-green' :
              ilRisk === 'medium' ? 'bg-warning-yellow/20 text-warning-yellow' :
              ilRisk === 'high' ? 'bg-warning-orange/20 text-warning-orange' :
              'bg-danger-red/20 text-danger-red'
            }`}>
              Risk: {ilRisk}
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
          <div className="text-xs opacity-60 flex items-center gap-2">
            Break-even volume (daily)
            <MetricTooltip label="How calculated?">
              Break-even volume is estimated as TVL * IL / feeRate for the selected price move. It approximates the daily trading volume needed to offset impermanent loss with fees.
            </MetricTooltip>
          </div>
          <div className="font-medium">{fmtUsd(beVol)}</div>
          <div className="text-xs opacity-60">Fees needed to offset IL@{ilPct}%</div>
        </div>
        {poolId && (
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
            <div className="text-xs opacity-60">Volume momentum (7d)</div>
            <div className="font-medium">{trend ? `${trend.trend}` : '...'}</div>
            <div className="text-xs opacity-60">{trend ? `${trend.pctChange7d.toFixed(1)}% vs prev 7d` : 'Loading...'}</div>
          </div>
        )}
        {poolId && (
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
            <div className="text-xs opacity-60">Fee momentum (7d)</div>
            <div className="font-medium">{fees ? `${fees.trend}` : '...'}</div>
            <div className="text-xs opacity-60">{fees ? `${fees.pctChange7d.toFixed(1)}% vs prev 7d` : 'Loading...'}</div>
          </div>
        )}
      </div>
    </div>
  );
}
