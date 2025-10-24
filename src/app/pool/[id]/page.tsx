import PoolSparkline from "@/components/PoolSparkline";
import APRCalculator from "@/components/APRCalculator";
import PoolMetricsCharts from "@/components/PoolMetricsCharts";
import MintPosition from "@/components/MintPosition";
import PoolRating from "@/components/advisor/PoolRating";
import PoolAdvisor from "@/components/advisor/PoolAdvisor";
import PoolAprBadge from "@/components/PoolAprBadge";
import NotificationCenter from "@/components/NotificationCenter";
import NotificationToggles from "@/components/NotificationToggles";
import CopyLinkButton from "@/components/CopyLinkButton";
import AdvisorBadge from "@/components/advisor/AdvisorBadge";
import AlertDot from "@/components/AlertDot";
import { scoreVolumeToTVL } from "@/lib/advisor/volumeToTvl";
import { analyzeFeeTier } from "@/lib/advisor/feeTier";
import { pairMetaFromSymbols } from "@/lib/advisor/pairMeta";
import { volumeTrend } from "@/lib/advisor/volumeAnalysis";
import WatchlistStar from "@/components/WatchlistStar";
import PoolsHeaderFeeMomentum from "@/components/advisor/PoolsHeaderFeeMomentum";
import PoolsMiniSparkline from "@/components/advisor/PoolsMiniSparkline";
import AdvisorLegend from "@/components/advisor/AdvisorLegend";
import HealthBar from "@/components/advisor/HealthBar";
import MetricTooltip from "@/components/advisor/MetricTooltip";
import { FEATURE_CHARTS, FEATURE_MINT } from "@/lib/flags";
import { getServerSupabase } from "@/lib/supabase/server";
import { optimalRange } from "@/lib/advisor/rangeOptimization";
import { formatLargeNumber } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

async function getData(id: string) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return { pool: null, snapshots: [], warning: "Supabase env not set" };
  }

  const { data: pool, error: pErr } = await supabase
    .from("pools")
    .select(`
      *,
      token0:token0_id(symbol, name),
      token1:token1_id(symbol, name)
    `)
    .eq("id", id)
    .maybeSingle();

  if (pErr) return { pool: null, snapshots: [], warning: pErr.message };

  const { data: snapshots, error: sErr } = await supabase
    .from("pool_snapshots")
    .select("pool_id, ts, tvl_usd, volume_usd_24h, fee_apr_annual")
    .eq("pool_id", id)
    .order("ts", { ascending: true })
    .limit(200);

  if (sErr) return { pool, snapshots: [], warning: sErr.message };

  return { pool, snapshots };
}

export default async function PoolDetailPage({ params }: Props) {
  const { id } = await params;
  const { pool, snapshots, warning } = await getData(id);
  const ratingContext = (() => {
    try {
      if (!pool) return null;
      const tvl = pool?.tvl_usd ?? 0;
      const vol = pool?.volume_usd_24h ?? 0;
      const vScore = scoreVolumeToTVL(vol, tvl).score;
      const feeRate = (pool?.fee_tier ?? 0) / 1_000_000;
      let score = vScore * 10;
      if (feeRate >= 0.01) score += 5; else if (feeRate >= 0.003) score += 2;
      const st = score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 55 ? 'warning' : score >= 40 ? 'danger' : 'critical';
      const color = st==='excellent'?'var(--lifeguard-excellent)':st==='good'?'var(--lifeguard-good)':st==='warning'?'var(--lifeguard-warning)':st==='danger'?'var(--lifeguard-danger)':'var(--lifeguard-critical)';
      const bg = `color-mix(in srgb, ${color} 6%, transparent)`;
      const pulse = (st==='danger'||st==='critical') ? ' pulse-soft' : '';
      return { score, st, color, bg, pulse };
    } catch { return null; }
  })();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between rounded-md px-2 py-1" style={{ background: ratingContext?.bg }}>
          <div className="flex items-center gap-3">
            <WatchlistStar id={id} name={pool ? generatePoolName(id) : undefined} />
            <h1 className="text-2xl font-semibold mb-2">{pool ? generatePoolName(id) : "Pool Detail"}</h1>
            {pool && (() => {
              const tvl = pool?.tvl_usd ?? 0; const vol = pool?.volume_usd_24h ?? 0; const feeRate = (pool?.fee_tier ?? 0) / 1_000_000;
              const vScore = scoreVolumeToTVL(vol, tvl); const sc = Math.max(0, Math.min(100, Math.round(vScore.score * 10 + (feeRate >= 0.01 ? 5 : feeRate >= 0.003 ? 2 : 0))));
              const st = sc >= 85 ? 'excellent' : sc >= 70 ? 'good' : sc >= 55 ? 'warning' : sc >= 40 ? 'danger' : 'critical';
              return (
                <div className="inline-flex items-center gap-2">
                  <AlertDot poolId={id} />
                  <AdvisorBadge status={st as any} score={sc} />
                  <div className="w-24"><HealthBar score={sc} status={st as any} /></div>
                </div>
              );
            })()}
            {(() => {
              const rows = (snapshots || []).map((s: any) => ({ date: s.ts, volumeUSD: s.volume_usd_24h }));
              const t = volumeTrend(rows as any);
              const arrow = t.trend === 'rising' ? '↑' : t.trend === 'falling' ? '↓' : '→';
              const color = t.trend === 'rising' ? 'text-[var(--lifeguard-good)]' : t.trend === 'falling' ? 'text-[var(--lifeguard-danger)]' : 'opacity-70';
              return <div className={`text-sm ${color}`}>Momentum {arrow} {isFinite(t.pctChange7d) ? t.pctChange7d.toFixed(1) + '%' : ''}</div>;
            })()}
            <PoolsHeaderFeeMomentum poolId={id} />
            <div className="hidden md:block">
              <div className="flex items-center gap-2">
                <div className="text-[10px] opacity-60">Vol</div>
                <div className="w-[140px]"><PoolsMiniSparkline poolId={id} metric="volumeUSD" /></div>
                <div className="text-[10px] opacity-60">Fees</div>
                <div className="w-[140px]"><PoolsMiniSparkline poolId={id} metric="feesUSD" /></div>
              </div>
            </div>
          </div>
          <CopyLinkButton label="Copy Pool Link" />
        </div>
        {pool && (
          <div className="space-y-1">
            <div className="text-sm opacity-80">
              {getTokenSymbols(pool)} • Fee: {fmtFeeTier(pool.fee_tier)}
            </div>
            <div className="text-xs opacity-60 break-all font-mono">Pool Address: {id}</div>
          </div>
        )}
      </div>

      {pool && (
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <PoolRating poolId={id} tvlUsd={pool?.tvl_usd ?? null} volume24hUsd={pool?.volume_usd_24h ?? null} feeTier={pool?.fee_tier ?? null} />
        </div>
      )}

      {!pool && (
        <p className="text-sm opacity-80">
          {warning || "Pool not found or data unavailable. Populate via /api/ingest/uniswap."}
        </p>
      )}

      {pool && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className={`rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1${ratingContext?.pulse ?? ''}`} style={{ background: ratingContext?.bg }}>
            <div className="text-xs opacity-60">Token Pair</div>
            <div className="text-sm font-medium">{getTokenSymbols(pool)}</div>
            <div className="text-xs opacity-60 font-mono">
              {short(pool.token0_id)} / {short(pool.token1_id)}
            </div>
          </div>
          <div className={`rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1${ratingContext?.pulse ?? ''}`} style={{ background: ratingContext?.bg }}>
            <div className="text-xs opacity-60">Fee Tier</div>
            <div className="text-sm inline-flex items-center gap-2">
              {fmtFeeTier(pool.fee_tier)}
              {(() => { try { const meta = pairMetaFromSymbols(pool?.token0?.symbol, pool?.token1?.symbol); const adv = analyzeFeeTier(pool?.fee_tier ?? 0, meta); return (
                <MetricTooltip label="Fee tier fit">{adv.note}</MetricTooltip>
              ); } catch { return null; } })()}
            </div>
          </div>
          <div className={`rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1${ratingContext?.pulse ?? ''}`} style={{ background: ratingContext?.bg }}>
            <div className="text-xs opacity-60">TVL (latest)</div>
            <div className="text-sm">{fmtUsd(pool.tvl_usd)}</div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <div className="text-sm opacity-70 mb-2">TVL Sparkline</div>
        <PoolSparkline data={(snapshots ?? []).map((s: any) => ({ ts: s.ts, tvl_usd: s.tvl_usd }))} />
      </div>

      {FEATURE_CHARTS && (
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4">
          <PoolMetricsCharts poolId={id} />
        </div>
      )}

      {pool && (
        <div className={`rounded-lg border border-black/10 dark:border-white/10 p-4${ratingContext?.pulse ?? ''}`} style={{ background: ratingContext?.bg }}>
          <div className="flex items-center justify-between">
            <NotificationCenter poolId={id} />
            <NotificationToggles poolId={id} />
          </div>
          <PoolAprBadge poolId={id} />
        </div>
      )}

      {pool && (
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-3">
          <div className="text-sm opacity-70">APR Calculator</div>
          <APRCalculator initialTVL={pool?.tvl_usd ?? null} initialVolume24h={pool?.volume_usd_24h ?? null} feeBps={pool?.fee_tier ?? null} />
        </div>
      )}

      {pool && (
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-3">
          <PoolAdvisor poolId={id} tvlUsd={pool?.tvl_usd ?? null} volume24hUsd={pool?.volume_usd_24h ?? null} feeTier={pool?.fee_tier ?? null} />
          {(() => {
            try {
              const symbols = { a: pool?.token0?.symbol as string | undefined, b: pool?.token1?.symbol as string | undefined };
              const meta = pairMetaFromSymbols(symbols.a, symbols.b);
              const type = meta.stable ? 'stable' : meta.blueChip ? 'bluechip' : 'longtail';
              const dailyVol = meta.stable ? 0.1 : meta.blueChip ? 5 : 30; // heuristic daily vol %
              const r = optimalRange(type as any, { price: 1, dailyVolPct: dailyVol });
              return (
                <div className="rounded border border-black/10 dark:border-white/10 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="opacity-70">Suggested Range</div>
                    <MetricTooltip label="How computed?">Heuristic width based on pair type and daily volatility. When price feed is available, bounds will be priced.</MetricTooltip>
                  </div>
                  <div className="opacity-80">Approx. width ~ {r.widthPct.toFixed(1)}%</div>
                  <div className="text-xs opacity-60">{r.note}</div>
                </div>
              );
            } catch { return null; }
          })()}
          <AdvisorLegend />
        </div>
      )}

      {FEATURE_MINT && pool && (
        <div className="rounded-lg border-2 border-blue-500/50 dark:border-blue-400/50 bg-blue-50/30 dark:bg-blue-950/20 p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Join This Pool</h2>
            <p className="text-sm opacity-80">Provide liquidity to earn trading fees from {getTokenSymbols(pool)} swaps</p>
          </div>
          <MintPosition poolId={id} feeTier={pool?.fee_tier ?? null} token0={pool?.token0_id} token1={pool?.token1_id} />
        </div>
      )}
    </div>
  );
}

function short(addr: string) {
  if (!addr) return "-";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v === 0 ? "-" : formatLargeNumber(v, { prefix: "$", decimals: 2 });
}

function fmtFeeTier(feeTier: number | null | undefined): string {
  if (feeTier == null) return "-";
  return `${(feeTier / 10000).toFixed(2)}%`;
}

// Generate a fun, deterministic pool name from pool ID
function generatePoolName(poolId: string): string {
  const adjectives = [
    "Soaking", "Dancing", "Happy", "Bouncing", "Sparkling", "Golden", "Silver",
    "Mystic", "Cosmic", "Turbo", "Swift", "Mighty", "Gentle", "Wild", "Calm",
    "Blazing", "Frozen", "Electric", "Quantum", "Stellar", "Lucky", "Bold",
    "Clever", "Rapid", "Silent", "Loud", "Bright", "Dark", "Shiny", "Fluffy"
  ];
  const animals = [
    "Hog", "Fox", "Bear", "Bull", "Whale", "Shark", "Dolphin", "Eagle",
    "Tiger", "Lion", "Panda", "Koala", "Otter", "Badger", "Raccoon", "Wolf",
    "Hawk", "Falcon", "Dragon", "Phoenix", "Unicorn", "Pegasus", "Griffin",
    "Kraken", "Narwhal", "Platypus", "Axolotl", "Capybara", "Lemur", "Lynx"
  ];

  // Use pool ID to deterministically select words
  const hash = poolId.toLowerCase().replace(/[^0-9a-f]/g, '');
  const adjIndex = parseInt(hash.slice(2, 10), 16) % adjectives.length;
  const animalIndex = parseInt(hash.slice(10, 18), 16) % animals.length;

  return `${adjectives[adjIndex]}${animals[animalIndex]}`;
}

function getTokenSymbols(pool: any): string {
  const token0Symbol = pool.token0?.symbol;
  const token1Symbol = pool.token1?.symbol;

  if (token0Symbol && token1Symbol) {
    return `${token0Symbol} / ${token1Symbol}`;
  }
  return `${short(pool.token0_id)} / ${short(pool.token1_id)}`;
}
