import { NextRequest, NextResponse } from "next/server";
import { fetchTopPools, fetchPoolDayData } from "@/lib/ingest/uniswap";
import { getServerSupabase } from "@/lib/supabase/server";

function isAuthorized(req: NextRequest) {
  const expected = process.env.INGEST_SECRET;
  if (!expected) return true; // allow if no secret set (dev fallback)
  // Allow Vercel Cron invocations
  if (req.headers.get("x-vercel-cron")) return true;
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : auth;
  const q = req.nextUrl.searchParams.get("token");
  return token === expected || q === expected;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const limit = Number(req.nextUrl.searchParams.get("limit") || 50);
  let pools;
  try {
    pools = await fetchTopPools(Math.min(Math.max(limit, 1), 200));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 502 });
  }

  const supabase = getServerSupabase();
  const hasSupabase = !!supabase;
  const now = new Date().toISOString();

  if (!hasSupabase) {
    // Dry-run response; useful locally without env set
    return NextResponse.json({ ok: true, dryRun: true, count: pools.length });
  }

  // Prepare upserts
  const chain = "ethereum";
  const tokens = new Map<string, { id: string; chain: string; address: string; symbol: string; name: string; decimals: number }>();
  for (const p of pools) {
    tokens.set(p.token0.id, {
      id: p.token0.id,
      chain,
      address: p.token0.id,
      symbol: p.token0.symbol,
      name: p.token0.name,
      decimals: Number(p.token0.decimals),
    });
    tokens.set(p.token1.id, {
      id: p.token1.id,
      chain,
      address: p.token1.id,
      symbol: p.token1.symbol,
      name: p.token1.name,
      decimals: Number(p.token1.decimals),
    });
  }

  // Fetch last 24h day data for volume/fees
  const sinceSec = Math.floor(Date.now() / 1000) - 24 * 3600;
  const dayData = await fetchPoolDayData(pools.map((p) => p.id), sinceSec);

  const poolsRows = pools.map((p) => {
    const dd = dayData[p.id];
    const tvl = Number(p.totalValueLockedUSD);
    const volume24 = dd?.volume24h ?? null;
    return {
      id: p.id,
      chain,
      token0_id: p.token0.id,
      token1_id: p.token1.id,
      fee_tier: Number(p.feeTier),
      tvl_usd: tvl,
      volume_usd_24h: volume24,
      updated_at: now,
    };
  });

  const snapshotRows = pools.map((p) => {
    const dd = dayData[p.id];
    const tvl = Number(p.totalValueLockedUSD);
    const feeRate = Number(p.feeTier) / 1_000_000;
    const feeAprAnnual = tvl > 0 && dd ? ((dd.volume24h * feeRate * 365) / tvl) : null;
    return {
      pool_id: p.id,
      ts: now,
      tvl_usd: tvl,
      volume_usd_24h: dd?.volume24h ?? null,
      fee_apr_annual: feeAprAnnual,
    };
  });

  const { error: tErr } = await supabase
    .from("tokens")
    .upsert(Array.from(tokens.values()), { onConflict: "id" });
  if (tErr) return NextResponse.json({ ok: false, error: tErr.message }, { status: 500 });

  const { error: pErr } = await supabase
    .from("pools")
    .upsert(poolsRows, { onConflict: "id" });
  if (pErr) return NextResponse.json({ ok: false, error: pErr.message }, { status: 500 });

  const { error: sErr } = await supabase
    .from("pool_snapshots")
    .upsert(snapshotRows, { onConflict: "pool_id,ts" });
  if (sErr) return NextResponse.json({ ok: false, error: sErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, upserted: { tokens: tokens.size, pools: poolsRows.length, snapshots: snapshotRows.length } });
}
