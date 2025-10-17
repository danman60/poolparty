import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const endpoint = process.env.SUBGRAPH_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json({ error: "SUBGRAPH_ENDPOINT not set" }, { status: 500 });
  }
  try {
    const body = await req.text();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}

