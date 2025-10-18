import PoolSparkline from "@/components/PoolSparkline";
import APRCalculator from "@/components/APRCalculator";
import PoolMetricsCharts from "@/components/PoolMetricsCharts";
import MintPosition from "@/components/MintPosition";
import PoolRating from "@/components/advisor/PoolRating";
import PoolAdvisor from "@/components/advisor/PoolAdvisor";
import { FEATURE_CHARTS, FEATURE_MINT } from "@/lib/flags";
import { getServerSupabase } from "@/lib/supabase/server";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{pool ? generatePoolName(id) : "Pool Detail"}</h1>
        {pool && (
          <div className="space-y-1">
            <div className="text-sm opacity-80">
              {getTokenSymbols(pool)} â€¢ Fee: {fmtFeeTier(pool.fee_tier)}
            </div>
            <div className="text-xs opacity-60 break-all font-mono">Pool Address: {id}</div>
          </div>
        )}
      </div>

      {!pool && (
        <p className="text-sm opacity-80">
          {warning || "Pool not found or data unavailable. Populate via /api/ingest/uniswap."}
        </p>
      )}

      {pool && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1">
            <div className="text-xs opacity-60">Token Pair</div>
            <div className="text-sm font-medium">{getTokenSymbols(pool)}</div>
            <div className="text-xs opacity-60 font-mono">
              {short(pool.token0_id)} / {short(pool.token1_id)}
            </div>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1">
            <div className="text-xs opacity-60">Fee Tier</div>
            <div className="text-sm">{fmtFeeTier(pool.fee_tier)}</div>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1">
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

      <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-3">
        <div className="text-sm opacity-70">APR Calculator</div>
        <APRCalculator initialTVL={pool?.tvl_usd ?? null} initialVolume24h={pool?.volume_usd_24h ?? null} feeBps={pool?.fee_tier ?? null} />
      </div>

      {pool && (
        <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-3">
          <PoolAdvisor tvlUsd={pool?.tvl_usd ?? null} volume24hUsd={pool?.volume_usd_24h ?? null} feeTier={pool?.fee_tier ?? null} />
        </div>
      )}

      {FEATURE_MINT && pool && (
        <div className="rounded-lg border-2 border-blue-500/50 dark:border-blue-400/50 bg-blue-50/30 dark:bg-blue-950/20 p-6 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">ðŸ’§ Join This Pool</h2>
            <p className="text-sm opacity-80">Provide liquidity to earn trading fees from {getTokenSymbols(pool)} swaps</p>
          </div>
          <MintPosition poolId={id} feeTier={pool?.fee_tier ?? null} token0={pool?.token0_id} token1={pool?.token1_id} />
        </div>
      )}
    </div>
  );
}

function short(addr: string) {
  if (!addr) return "â€”";
  return `${addr.slice(0, 6)}â€¦${addr.slice(-4)}`;
}

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v === 0 ? "â€”" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtFeeTier(feeTier: number | null | undefined): string {
  if (feeTier == null) return "â€”";
  return `${(feeTier / 10000).toFixed(2)}%`;
}

// Generate a fun, deterministic pool name from pool ID
function generatePoolName(poolId: string): string {
  const adjectives = [
    "Soaking", "Dancing", "Happy", "Bouncing", "Sparkling", "Golden", "Silver",
    "Mystic", "Cosmic", "Turbo", "Swift", "Mighty", "Gentle", "Wild", "Calm",
    "Blazing", "Frozen", "Electric", "Quantum", "Stell-Lucky", "Bold",
    "Clever", "Rapid", "Silent", "Loud", "Bright", "Dark", "Shiny", "Fluffy"
  ];
  const animals = [
    "Hog", "Fox", "Be-Bull", "Whale", "Shark", "Dolphin", "Eagle",
    "Tiger", "Lion", "Panda", "Koala", "Otter", "Badger", "Raccoon", "Wolf",
    "Hawk", "Falcon", "Dragon", "Phoenix", "Unicorn", "Pegasus", "Griffin",
    "Kraken", "Narwh-Platypus", "Axolotl", "Capybara", "Lemur", "Lynx"
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





