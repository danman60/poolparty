import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));
  const fee = url.searchParams.get("fee"); // e.g., "500","3000","10000"
  const sort = url.searchParams.get("sort") === "volume" ? "volume_usd_24h" : "tvl_usd";
  const orderDir = (url.searchParams.get("order") || "desc").toLowerCase() === "asc" ? true : false;

  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json(
      { data: [], meta: { total: 0, page, limit }, warning: "Supabase env not set" },
      { status: 200, headers: { "Cache-Control": "public, max-age=15, s-maxage=60, stale-while-revalidate=300" } }
    );
  }

  // Build query with token symbols joined
  let query = supabase
    .from("pools")
    .select(`
      *,
      token0:token0_id(symbol, name),
      token1:token1_id(symbol, name)
    `, { count: "exact" });

  if (fee && /^\d+$/.test(fee)) {
    query = query.eq("fee_tier", Number(fee));
  }

  query = query.order(sort, { ascending: orderDir });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ data: [], meta: { total: 0, page, limit }, error: error.message }, { status: 500 });
  }
  return NextResponse.json(
    { data: data || [], meta: { total: count || 0, page, limit } },
    { status: 200, headers: { "Cache-Control": "public, max-age=15, s-maxage=60, stale-while-revalidate=300" } }
  );
}
