import { NextResponse } from "next/server";

export async function GET() {
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE);
  const hasRpc = !!(process.env.NEXT_PUBLIC_RPC_MAINNET);
  const hasIngestSecret = !!process.env.INGEST_SECRET;
  return NextResponse.json({ ok: true, env: { hasSupabase, hasRpc, hasIngestSecret } });
}

