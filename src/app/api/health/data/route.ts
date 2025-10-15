import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, dryRun: true, iso: null, ageMs: null });
  }
  const [{ data: p, error: pErr }, { data: s, error: sErr }] = await Promise.all([
    supabase.from("pools").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("pool_snapshots").select("ts").order("ts", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (pErr || sErr) {
    return NextResponse.json({ ok: false, error: pErr?.message || sErr?.message }, { status: 500 });
  }
  const latestIso = (s?.ts as string) || (p?.updated_at as string) || null;
  const latestMs = latestIso ? new Date(latestIso).getTime() : null;
  const ageMs = latestMs ? Date.now() - latestMs : null;
  return NextResponse.json({ ok: !!latestIso, iso: latestIso, ageMs });
}

