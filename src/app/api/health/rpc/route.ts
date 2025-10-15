import { NextResponse } from "next/server";

const targets = [
  process.env.NEXT_PUBLIC_RPC_MAINNET || 'https://ethereum.publicnode.com',
  process.env.NEXT_PUBLIC_RPC_SEPOLIA || 'https://ethereum-sepolia.publicnode.com',
];

async function ping(url: string) {
  const started = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'web3_clientVersion', params: [] }),
      cache: 'no-store',
    });
    const ms = Date.now() - started;
    const ok = res.ok;
    const json = await res.json().catch(() => ({} as any));
    return { url, ok, ms, client: (json as any).result || 'unknown' };
  } catch (e: any) {
    return { url, ok: false, ms: Date.now() - started, error: e?.message || String(e) };
  }
}

export async function GET() {
  const results = await Promise.all(targets.map(ping));
  const ok = results.every((r) => r.ok);
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 207, headers: { 'Cache-Control': 'public, max-age=30' } });
}

