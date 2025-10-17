import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = process.env.INGEST_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false, error: "INGEST_SECRET not set" }, { status: 500 });
  }
  try {
    const origin = new URL(req.url).origin;
    const url = `${origin}/api/ingest/uniswap?limit=100`;
    const res = await fetch(url, {
      method: "GET",
      headers: { authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    const body = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, status: res.status, body });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}

