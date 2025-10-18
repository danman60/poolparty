export type PriceMap = Record<string, number>; // lowercase address -> usd price

export async function fetchTokenPrices(addresses: string[]): Promise<PriceMap> {
  const uniq = Array.from(new Set((addresses || []).filter(Boolean).map(a => a.toLowerCase())));
  if (uniq.length === 0) return {};
  const chunkSize = 50; // CG allows many; keep small to be safe
  const out: PriceMap = {};
  for (let i = 0; i < uniq.length; i += chunkSize) {
    const chunk = uniq.slice(i, i + chunkSize);
    const url = `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${chunk.join(',')}&vs_currencies=usd`;
    try {
      const res = await fetch(url, { cache: 'no-store' as any });
      if (!res.ok) continue;
      const json = await res.json();
      for (const [addr, data] of Object.entries<any>(json)) {
        const usd = Number(data?.usd);
        if (Number.isFinite(usd)) out[addr.toLowerCase()] = usd;
      }
    } catch {
      // ignore chunk errors
    }
  }
  return out;
}

