import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = process.env.SUBGRAPH_ENDPOINT || "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const QUERY = `query Positions($owner: Bytes!, $first: Int!) {
  positions(where: { owner: $owner }, first: $first, orderBy: liquidity, orderDirection: desc) {
    id
    token0 { id symbol name decimals }
    token1 { id symbol name decimals }
    feeTier
    liquidity
    depositedToken0
    depositedToken1
    collectedFeesToken0
    collectedFeesToken1
    uncollectedFeesToken0
    uncollectedFeesToken1
    tickLower { tickIdx }
    tickUpper { tickIdx }
  }
}`;

export async function GET(req: NextRequest) {
  const address = (req.nextUrl.searchParams.get("address") || "").toLowerCase();
  const first = Number(req.nextUrl.searchParams.get("first") || 25);
  if (!address || !/^0x[a-f0-9]{40}$/.test(address)) {
    return NextResponse.json({ error: "invalid address" }, { status: 400 });
  }
  const body = JSON.stringify({ query: QUERY, variables: { owner: address, first: Math.min(Math.max(first, 1), 100) } });
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ error: `subgraph ${res.status}` }, { status: 502 });
    const json = await res.json();
    if (json.errors) {
      const errorMsg = Array.isArray(json.errors)
        ? json.errors.map((e: any) => e.message || String(e)).join(", ")
        : String(json.errors);
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }
    return NextResponse.json({ data: json.data.positions }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
