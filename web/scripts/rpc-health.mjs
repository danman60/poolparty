const targets = [
  process.env.NEXT_PUBLIC_RPC_MAINNET || 'https://ethereum.publicnode.com',
  process.env.NEXT_PUBLIC_RPC_SEPOLIA || 'https://ethereum-sepolia.publicnode.com',
];

async function ping(url) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'web3_clientVersion', params: [] }),
    });
    const ms = Date.now() - started;
    const ok = res.ok;
    const json = await res.json().catch(() => ({}));
    return { url, ok, ms, client: json.result || 'unknown' };
  } catch (e) {
    return { url, ok: false, ms: Date.now() - started, error: String(e) };
  }
}

(async () => {
  const results = await Promise.all(targets.map(ping));
  for (const r of results) {
    const status = r.ok ? 'OK' : 'ERR';
    const warn = r.ms > 1500 ? ' (WARN: >1.5s)' : '';
    console.log(`${status} ${r.url} ${r.ms}ms${warn} ${r.client ?? ''}`);
    if (!r.ok) console.log(`  error: ${r.error}`);
  }
  // Always exit 0 here; pipeline treats as warning-only at this stage
  process.exit(0);
})();

