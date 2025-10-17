const ENDPOINT = process.env.SUBGRAPH_ENDPOINT || 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

export type SubgraphPool = {
  id: string;
  feeTier: string;
  totalValueLockedUSD: string;
  volumeUSD: string;
  token0: { id: string; symbol: string; name: string; decimals: string };
  token1: { id: string; symbol: string; name: string; decimals: string };
};

export async function fetchTopPools(limit = 50): Promise<SubgraphPool[]> {
  const query = `query TopPools($first: Int!, $minVolume: BigDecimal!, $maxTvl: BigDecimal!) {
    pools(
      first: $first,
      orderBy: totalValueLockedUSD,
      orderDirection: desc,
      where: {
        volumeUSD_gt: $minVolume,
        totalValueLockedUSD_lt: $maxTvl
      }
    ) {
      id feeTier totalValueLockedUSD volumeUSD
      token0 { id symbol name decimals }
      token1 { id symbol name decimals }
    }
  }`;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        first: limit,
        minVolume: "1000000",      // $1M+ total volume
        maxTvl: "10000000000"       // < $10B TVL (filter out spam with inflated TVL)
      }
    }),
    // avoid edge cache surprises during development
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Subgraph HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Subgraph error: ${JSON.stringify(json.errors)}`);
  return (json.data?.pools ?? []) as SubgraphPool[];
}

type DayData = {
  pool: { id: string };
  date: number; // seconds since epoch
  volumeUSD: string;
  feesUSD: string;
  tvlUSD?: string;
};

export async function fetchPoolDayData(poolIds: string[], sinceSec: number): Promise<Record<string, { volume24h: number; fees24h: number }>> {
  if (poolIds.length === 0) return {};
  // GraphQL input lists have practical limits; chunk if needed
  const chunks: string[][] = [];
  for (let i = 0; i < poolIds.length; i += 50) chunks.push(poolIds.slice(i, i + 50));
  const results: Record<string, { volume24h: number; fees24h: number }> = {};

  const query = `query PoolDay($ids: [ID!], $since: Int!) {
    poolDayDatas(first: 1000, where: { pool_in: $ids, date_gte: $since }, orderBy: date, orderDirection: asc) {
      pool { id }
      date
      volumeUSD
      feesUSD
    }
  }`;

  for (const ids of chunks) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { ids, since: sinceSec } }),
      cache: 'no-store',
    });
    if (!res.ok) continue;
    const json = await res.json();
    const rows: DayData[] = json?.data?.poolDayDatas ?? [];
    for (const r of rows) {
      const id = r.pool.id;
      const v = Number(r.volumeUSD || 0);
      const f = Number(r.feesUSD || 0);
      if (!results[id]) results[id] = { volume24h: 0, fees24h: 0 };
      results[id].volume24h += v;
      results[id].fees24h += f;
    }
  }
  return results;
}
