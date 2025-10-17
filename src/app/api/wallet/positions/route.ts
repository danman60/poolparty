import { NextRequest, NextResponse } from "next/server";

const ENDPOINT = process.env.SUBGRAPH_ENDPOINT || "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";

const QUERY = `query Positions($owner: Bytes!, $first: Int!) {
  positions(where: { owner: $owner }, first: $first, orderBy: liquidity, orderDirection: desc) {
    id
    pool {
      id
      token0 { id symbol name decimals }
      token1 { id symbol name decimals }
      feeTier
    }
    liquidity
    depositedToken0
    depositedToken1
    withdrawnToken0
    withdrawnToken1
    collectedFeesToken0
    collectedFeesToken1
    feeGrowthInside0LastX128
    feeGrowthInside1LastX128
    tickLower { tickIdx feeGrowthOutside0X128 feeGrowthOutside1X128 }
    tickUpper { tickIdx feeGrowthOutside0X128 feeGrowthOutside1X128 }
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

    // Helper to safely convert to BigInt (truncate decimals)
    const toBigInt = (val: any): bigint => {
      if (!val) return 0n;
      const str = String(val);
      // If it has a decimal point, truncate it
      const intPart = str.includes('.') ? str.split('.')[0] : str;
      // Parse as float first, then floor, then convert to bigint
      try {
        return BigInt(Math.floor(Math.abs(parseFloat(intPart))));
      } catch {
        return 0n;
      }
    };

    // Transform positions to flatten pool data and calculate fees
    const positions = (json.data.positions || []).map((p: any) => {
      const deposited0 = toBigInt(p.depositedToken0);
      const withdrawn0 = toBigInt(p.withdrawnToken0);
      const collected0 = toBigInt(p.collectedFeesToken0);
      const deposited1 = toBigInt(p.depositedToken1);
      const withdrawn1 = toBigInt(p.withdrawnToken1);
      const collected1 = toBigInt(p.collectedFeesToken1);

      // Calculate uncollected = deposited - withdrawn - collected
      const uncollected0 = deposited0 - withdrawn0 - collected0;
      const uncollected1 = deposited1 - withdrawn1 - collected1;

      return {
        id: p.id,
        token0: p.pool?.token0 || { id: '', symbol: '?', name: '', decimals: '18' },
        token1: p.pool?.token1 || { id: '', symbol: '?', name: '', decimals: '18' },
        feeTier: p.pool?.feeTier || '0',
        liquidity: p.liquidity || '0',
        depositedToken0: p.depositedToken0 || '0',
        depositedToken1: p.depositedToken1 || '0',
        collectedFeesToken0: p.collectedFeesToken0 || '0',
        collectedFeesToken1: p.collectedFeesToken1 || '0',
        uncollectedFeesToken0: String(uncollected0 < 0n ? 0n : uncollected0),
        uncollectedFeesToken1: String(uncollected1 < 0n ? 0n : uncollected1),
        tickLower: p.tickLower,
        tickUpper: p.tickUpper,
      };
    });

    return NextResponse.json({ data: positions }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}
