"use client";

import { useQuery } from "@tanstack/react-query";

type EnvRes = { ok: boolean; env: { hasSupabase: boolean; hasRpc: boolean; hasIngestSecret: boolean } };

export default function EnvBanner() {
  const isProd = process.env.NODE_ENV === 'production';
  const { data } = useQuery<EnvRes>({
    queryKey: ['envBanner'],
    queryFn: async () => {
      const res = await fetch('/api/health/env', { cache: 'no-store' });
      return res.json();
    },
    staleTime: 60_000,
  });
  if (!data) return null;
  const warn = !data.env.hasSupabase || !data.env.hasRpc;
  if (!warn) return null;
  return (
    <div className="bg-yellow-500/15 text-yellow-800 dark:text-yellow-200 text-xs px-4 py-2">
      {isProd ? 'Configuration issue detected.' : 'Dev config: '} Missing
      {!data.env.hasSupabase ? ' Supabase env' : ''}
      {!data.env.hasSupabase && !data.env.hasRpc ? ' and' : ''}
      {!data.env.hasRpc ? ' RPC override' : ''}.
      {isProd ? ' Check environment variables in Vercel.' : ' Fill .env.local to enable full features.'}
    </div>
  );
}

