import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, tokenId, action, hash, chain } = body || {};

    const supabase = getSupabaseServer();
    if (!supabase) return NextResponse.json({ ok: false, dryRun: true }, { status: 200 });

    const { error } = await supabase
      .from("position_actions")
      .insert({ wallet, token_id: tokenId, action, tx_hash: hash, chain });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("address") || searchParams.get("wallet");
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const tokenId = searchParams.get("tokenId");
    const before = searchParams.get("before");

    const supabase = getSupabaseServer();
    if (!supabase) return NextResponse.json({ ok: true, data: [], dryRun: true });

    let query = supabase
      .from("position_actions")
      .select("wallet, token_id, action, tx_hash, chain, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (wallet) query = query.eq("wallet", wallet);
    if (tokenId) query = query.eq("token_id", tokenId);
    if (before) query = query.lt("created_at", before);

    const { data, error } = await query;
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
