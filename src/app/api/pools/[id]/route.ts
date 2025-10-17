import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ pool: null, snapshots: [], warning: "Supabase env not set" }, { status: 200 });
  }
  const { id } = await ctx.params;
  const { data: pool, error: pErr } = await supabase
    .from("pools")
    .select(`
      id,
      chain,
      token0_id,
      token1_id,
      fee_tier,
      tvl_usd,
      volume_usd_24h,
      updated_at,
      token0:token0_id(symbol, name),
      token1:token1_id(symbol, name)
    `)
    .eq("id", id)
    .maybeSingle();
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  const { data: snapshots, error: sErr } = await supabase
    .from("pool_snapshots")
    .select("pool_id, ts, tvl_usd, volume_usd_24h, fee_apr_annual")
    .eq("pool_id", id)
    .order("ts", { ascending: true })
    .limit(200);
  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });
  return NextResponse.json({ pool, snapshots }, { status: 200 });
}
