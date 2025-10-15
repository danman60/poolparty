export function txUrl(chainId: number | undefined, hash: `0x${string}` | undefined) {
  if (!hash) return undefined;
  const base = chainId === 1 ? 'https://etherscan.io' : chainId === 11155111 ? 'https://sepolia.etherscan.io' : 'https://etherscan.io';
  return `${base}/tx/${hash}`;
}

