"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  initialTVL?: number | null;
  initialVolume24h?: number | null;
  feeBps?: number | null; // e.g., 3000 = 0.3%
};

export default function APRCalculator({ initialTVL, initialVolume24h, feeBps }: Props) {
  const [tvl, setTvl] = useState<number>(toNum(initialTVL));
  const [vol, setVol] = useState<number>(toNum(initialVolume24h));
  const [fee, setFee] = useState<number>(feeBps ?? 3000);
  const [share, setShare] = useState<number>(1); // % of pool liquidity, default 1%
  const [compound, setCompound] = useState<boolean>(true);

  useEffect(() => {
    if (initialTVL != null) setTvl(toNum(initialTVL));
  }, [initialTVL]);
  useEffect(() => {
    if (initialVolume24h != null) setVol(toNum(initialVolume24h));
  }, [initialVolume24h]);
  useEffect(() => {
    if (feeBps != null) setFee(feeBps);
  }, [feeBps]);

  const { poolApr, userApr, userApy, dailyFeesUser } = useMemo(() => {
    const feeRate = (fee || 0) / 1_000_000; // bps to rate (e.g., 3000 -> 0.003)
    // APR for pool: (24h volume * feeRate * 365) / TVL
    const poolApr = tvl > 0 && vol > 0 ? (vol * feeRate * 365) / tvl : 0;
    const userApr = poolApr * ((share || 0) / 100);
    // Daily user fees: vol * feeRate * (share%)
    const dailyFeesUser = vol * feeRate * ((share || 0) / 100);
    // APY approximation with daily compounding
    const userApy = compound ? Math.pow(1 + userApr / 365, 365) - 1 : userApr;
    return { poolApr, userApr, userApy, dailyFeesUser };
  }, [tvl, vol, fee, share, compound]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs opacity-70">TVL (USD)</label>
          <input
            type="number"
            inputMode="decimal"
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            value={Number.isFinite(tvl) ? String(tvl) : ""}
            onChange={(e) => setTvl(Number(e.target.value))}
            placeholder="e.g., 1000000"
            aria-label="Total value locked in USD"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs opacity-70">Volume 24h (USD)</label>
          <input
            type="number"
            inputMode="decimal"
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            value={Number.isFinite(vol) ? String(vol) : ""}
            onChange={(e) => setVol(Number(e.target.value))}
            placeholder="e.g., 250000"
            aria-label="Trading volume in the last 24 hours in USD"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs opacity-70">Fee tier (bps)</label>
          <select
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            value={fee}
            onChange={(e) => setFee(Number(e.target.value))}
            aria-label="Fee tier basis points"
          >
            {[500, 3000, 10000].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-xs opacity-70">Your share of liquidity (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            className="w-full rounded border border-black/10 dark:border-white/10 bg-transparent px-3 py-2 text-sm"
            value={share}
            onChange={(e) => setShare(Number(e.target.value))}
            aria-label="Your share percentage of the active liquidity"
          />
        </div>
        <div className="flex items-center gap-2">
          <input id="compound" type="checkbox" checked={compound} onChange={(e) => setCompound(e.target.checked)} />
          <label htmlFor="compound" className="text-sm">Compound (APY)</label>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Pool fee APR" value={fmtPct(poolApr)} />
        <Stat label="Your APR" value={fmtPct(userApr)} />
        <Stat label={compound ? "Your APY (est)" : "Your APR (simple)"} value={fmtPct(userApy)} />
      </div>

      <div className="rounded border border-black/10 dark:border-white/10 p-3 text-sm">
        Estimated daily fees (you): <strong>{fmtUsd(dailyFeesUser)}</strong>
      </div>

      <p className="text-xs opacity-60">
        Note: This is a simplified approximation. Realized APR depends on active price range, position
        utilization, and volume distribution. Use for directional estimates only.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/10 p-3">
      <div className="text-xs opacity-70">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function toNum(n?: number | null) {
  if (n == null) return 0;
  return Number(n) || 0;
}

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v === 0 ? "—" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function fmtPct(n?: number | null) {
  const v = n ?? 0;
  return (v * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + "%";
}

