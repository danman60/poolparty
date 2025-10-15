import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, dryRun: true });
  const [poolsMaxRes, snapsMaxRes, poolsCountRes] = await Promise.all([
    supabase.from('pools').select('updated_at').order('updated_at', { ascending: false }).limit(1),
    supabase.from('pool_snapshots').select('ts').order('ts', { ascending: false }).limit(1),
    supabase.from('pools').select('id', { count: 'exact', head: true }),
  ]);
  const poolsMax = poolsMaxRes.data as { updated_at: string }[] | null;
  const snapsMax = snapsMaxRes.data as { ts: string }[] | null;
  const latestPoolIso = poolsMax?.[0]?.updated_at;
  const latestSnapIso = snapsMax?.[0]?.ts;
  const latestIso = latestSnapIso ?? latestPoolIso ?? null;
  const latestMs = latestIso ? new Date(latestIso).getTime() : null;
  const ageMs = latestMs ? Date.now() - latestMs : null;
  return NextResponse.json({
    ok: !!latestIso,
    latestIso,
    ageMs,
    pools: poolsCountRes.count ?? null,
  });
}




