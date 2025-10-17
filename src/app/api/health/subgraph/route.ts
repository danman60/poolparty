import { NextResponse } from "next/server";

const ENDPOINT = process.env.SUBGRAPH_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

export async function GET() {
  const query = `query { swaps(first: 1, orderBy: timestamp, orderDirection: desc) { timestamp } }`;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ ok: false, status: res.status });
    const json = await res.json();
    const ts = Number(json?.data?.swaps?.[0]?.timestamp || 0) * 1000;
    const now = Date.now();
    const ageMs = ts ? now - ts : null;
    return NextResponse.json({ ok: !!ts, ts, ageMs, iso: ts ? new Date(ts).toISOString() : null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
