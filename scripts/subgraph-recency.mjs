const ENDPOINT = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3';

async function main() {
  const query = `query { swaps(first: 1, orderBy: timestamp, orderDirection: desc) { id timestamp } }`;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const ts = Number(json?.data?.swaps?.[0]?.timestamp || 0) * 1000;
    if (!ts) throw new Error('No timestamp');
    const ageMs = Date.now() - ts;
    const ageMin = Math.round(ageMs / 60000);
    const warn = ageMs > 5 * 60000 ? ' (WARN: >5m old)' : '';
    console.log(`Subgraph last swap: ${new Date(ts).toISOString()} (${ageMin}m ago)${warn}`);
  } catch (e) {
    console.log('Subgraph recency check failed:', e.message || String(e));
  }
  process.exit(0);
}

main();

