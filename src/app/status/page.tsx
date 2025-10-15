"use client";

import { useQuery } from "@tanstack/react-query";

type RpcRes = { ok: boolean; results: { url: string; ok: boolean; ms: number; client?: string; error?: string }[] };
type EnvRes = { ok: boolean; env: { hasSupabase: boolean; hasRpc: boolean; hasIngestSecret: boolean } };
type SubgraphRes = { ok: boolean; ts?: number; ageMs?: number; iso?: string; status?: number; error?: string };
type IngestRes = { ok: boolean; latestIso?: string | null; ageMs?: number | null; pools?: number | null; dryRun?: boolean };

export default function StatusPage() {
  const envQ = useQuery<EnvRes>({ queryKey: ['env'], queryFn: () => fetch('/api/health/env', { cache: 'no-store' }).then(r => r.json()) });
  const rpcQ = useQuery<RpcRes>({ queryKey: ['rpc'], queryFn: () => fetch('/api/health/rpc', { cache: 'no-store' }).then(r => r.json()) });
  const sgQ = useQuery<SubgraphRes>({ queryKey: ['subgraph'], queryFn: () => fetch('/api/health/subgraph', { cache: 'no-store' }).then(r => r.json()) });
  const ingestQ = useQuery<IngestRes>({ queryKey: ['ingest'], queryFn: () => fetch('/api/health/ingest', { cache: 'no-store' }).then(r => r.json()) });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">System Status</h1>

      <section className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h2 className="text-sm opacity-70 mb-2">Environment</h2>
        {envQ.isLoading ? (
          <p className="text-sm opacity-70">Checking…</p>
        ) : envQ.data ? (
          <ul className="text-sm space-y-1">
            <li>Supabase keys: <Badge ok={envQ.data.env.hasSupabase} /></li>
            <li>RPC mainnet set: <Badge ok={envQ.data.env.hasRpc} /></li>
            <li>Ingest secret set: <Badge ok={envQ.data.env.hasIngestSecret} /></li>
          </ul>
        ) : (
          <p className="text-sm text-red-600">Failed to load env status</p>
        )}
      </section>

      <section className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h2 className="text-sm opacity-70 mb-2">RPC Endpoints</h2>
        {rpcQ.isLoading ? (
          <p className="text-sm opacity-70">Pinging…</p>
        ) : rpcQ.data ? (
          <ul className="text-sm space-y-1">
            {rpcQ.data.results.map((r) => (
              <li key={r.url} className="flex items-center gap-2">
                <Badge ok={r.ok} />
                <span className="font-mono break-all">{r.url}</span>
                <span className="opacity-70">— {r.ms} ms {r.client ? `(${r.client})` : ''}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-red-600">Failed to ping RPC endpoints</p>
        )}
      </section>

      <section className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h2 className="text-sm opacity-70 mb-2">Subgraph Recency</h2>
        {sgQ.isLoading ? (
          <p className="text-sm opacity-70">Checking…</p>
        ) : sgQ.data ? (
          <div className="text-sm">
            <Badge ok={!!sgQ.data.ok} /> Last swap: {sgQ.data.iso || 'n/a'}
            {typeof sgQ.data.ageMs === 'number' && (
              <span className="opacity-70"> — {Math.round((sgQ.data.ageMs || 0) / 60000)} minutes ago</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-600">Failed to query subgraph</p>
        )}
      </section>

      <section className="rounded-lg border border-black/10 dark:border-white/10 p-4">
        <h2 className="text-sm opacity-70 mb-2">Ingest</h2>
        {ingestQ.isLoading ? (
          <p className="text-sm opacity-70">Checking…</p>
        ) : ingestQ.data ? (
          <div className="text-sm">
            <Badge ok={!!ingestQ.data.ok} /> Last ingest: {ingestQ.data.latestIso || 'n/a'}
            {typeof ingestQ.data.ageMs === 'number' && (
              <span className="opacity-70"> — {Math.round((ingestQ.data.ageMs || 0) / 60000)} minutes ago</span>
            )}
            {typeof ingestQ.data.pools === 'number' && (
              <span className="opacity-70"> — Pools: {ingestQ.data.pools}</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-red-600">Failed to load ingest status</p>
        )}
      </section>

      <p className="text-xs opacity-60">This page auto-refreshes on navigation. Use Ctrl/Cmd+R to refresh.</p>
    </div>
  );
}

function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${ok ? 'bg-green-500/15 text-green-700 dark:text-green-300' : 'bg-red-500/15 text-red-700 dark:text-red-300'}`}>
      <span className={`inline-block w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
      {ok ? 'OK' : 'Issue'}
    </span>
  );
}
