const STABLES = new Set(["USDC", "USDT", "DAI", "TUSD", "USDP", "FRAX", "LUSD", "GUSD"]);
const BLUECHIPS = new Set(["ETH", "WETH", "WBTC", "BTC", "SOL", "MATIC", "POL", "BNB"]);

export function pairMetaFromSymbols(a?: string | null, b?: string | null): { stable: boolean; blueChip: boolean } {
  const A = (a || '').toUpperCase();
  const B = (b || '').toUpperCase();
  const stable = (STABLES.has(A) && STABLES.has(B));
  // blue-chip if any side is a main asset and pair isn’t both stables
  const blueChip = !stable && (BLUECHIPS.has(A) || BLUECHIPS.has(B));
  return { stable, blueChip };
}

