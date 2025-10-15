import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const hasEnv = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE);
  const supabase = getServerSupabase();
  if (!supabase) return NextResponse.json({ ok: false, hasEnv });
  const { error } = await supabase.from("pools").select("id").limit(1);
  return NextResponse.json({ ok: !error, hasEnv, error: error?.message });
}

