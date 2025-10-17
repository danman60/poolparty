import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function POST() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase not configured" }, { status: 500 });
  }

  // Delete pool_snapshots for pools with null volume
  const { data: poolsToDelete } = await supabase
    .from("pools")
    .select("id")
    .is("volume_usd_24h", null);

  if (poolsToDelete && poolsToDelete.length > 0) {
    const poolIds = poolsToDelete.map((p: { id: string }) => p.id);

    // Delete snapshots first (foreign key constraint)
    const { error: snapErr } = await supabase
      .from("pool_snapshots")
      .delete()
      .in("pool_id", poolIds);

    if (snapErr) return NextResponse.json({ ok: false, error: snapErr.message }, { status: 500 });

    // Delete pools
    const { error: poolErr } = await supabase
      .from("pools")
      .delete()
      .in("id", poolIds);

    if (poolErr) return NextResponse.json({ ok: false, error: poolErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, deleted: { pools: poolIds.length } });
  }

  return NextResponse.json({ ok: true, deleted: { pools: 0 }, message: "No spam pools found" });
}
