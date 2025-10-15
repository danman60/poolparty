// Simple check that the ingest endpoint responds (dry-run allowed)
const BASE = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  try {
    const res = await fetch(`${BASE}/api/ingest/uniswap?limit=1`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
    console.log('Ingest endpoint:', json);
  } catch (e) {
    console.error('Ingest check failed:', e.message || String(e));
    process.exit(1);
  }
})();

