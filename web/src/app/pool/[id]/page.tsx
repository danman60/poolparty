import PoolSparkline from "@/components/PoolSparkline";
import APRCalculator from "@/components/APRCalculator";
import PoolMetricsCharts from "@/components/PoolMetricsCharts";
import MintPosition from "@/components/MintPosition";
import { FEATURE_CHARTS, FEATURE_MINT } from "@/lib/flags";

type Props = { params: { id: string } };

async function getData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/pools/${id}`, { cache: "no-store" });
  if (!res.ok) return { pool: null, snapshots: [] };
  return res.json();
}

export default async function PoolDetailPage({ params }: Props) {
  const { id } = params;
  const { pool, snapshots, warning } = await getData(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pool Detail</h1>
        <span className="text-xs opacity-60 break-all">{id}</span>
      </div>

      {!pool && (
        <p className="text-sm opacity-80">
          {warning || "Pool not found or data unavailable. Populate via /api/ingest/uniswap."}
        </p>
      )}

      {pool && (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1">
            <div className="text-xs opacity-60">Tokens</div>
            <div className="font-mono text-sm">{short(pool.token0_id)} / {short(pool.token1_id)}</div>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 p-4 space-y-1">
            <div className="text-xs opacity-60">Fee Tier</div>
            <div className="text-sm">{pool.fee_tier ?? "—"}</div>
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
        {FEATURE_MINT && (
          <>
            <div className="text-sm opacity-70">Provide Liquidity</div>
            <MintPosition poolId={id} feeTier={pool?.fee_tier ?? null} token0={pool?.token0_id} token1={pool?.token1_id} />
          </>
        )}
      </div>
    </div>
  );
}

function short(addr: string) {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function fmtUsd(n?: number | null) {
  const v = n ?? 0;
  return v === 0 ? "—" : v.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
