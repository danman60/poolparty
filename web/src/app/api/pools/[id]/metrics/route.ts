import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const idLower = id.toLowerCase();
  const query = `query PoolDayData($id: ID!, $first: Int!) {
    poolDayDatas(where: { pool: $id }, orderBy: date, orderDirection: asc, first: $first) {
      date
      tvlUSD
      volumeUSD
      feesUSD
    }
  }`;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id: idLower, first: 60 } }),
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ error: `subgraph ${res.status}` }, { status: 502 });
    const json = await res.json();
    if (json.errors) return NextResponse.json({ error: json.errors }, { status: 502 });
    const rows = (json.data?.poolDayDatas || []).map((d: any) => ({
      date: new Date(Number(d.date) * 1000).toISOString().slice(0, 10),
      tvlUSD: Number(d.tvlUSD || 0),
      volumeUSD: Number(d.volumeUSD || 0),
      feesUSD: Number(d.feesUSD || 0),
    }));
    return NextResponse.json({ data: rows }, { status: 200, headers: { 'Cache-Control': 'public, max-age=300' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
