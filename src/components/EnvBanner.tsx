"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type EnvRes = { ok: boolean; env: { hasSupabase: boolean; hasRpc: boolean; hasIngestSecret: boolean } };

export default function EnvBanner() {
  const [mounted, setMounted] = useState(false);
  const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

  const { data } = useQuery<EnvRes>({
    queryKey: ['envBanner'],
    queryFn: async () => {
      const res = await fetch('/api/health/env', { cache: 'no-store' });
      return res.json();
    },
    staleTime: 60_000,
    enabled: mounted,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !data) return null;
  const warn = !data.env.hasSupabase || !data.env.hasRpc;

  // Show green gradient when OK, red gradient when there are warnings
  if (warn) {
    return (
      <div className="bg-gradient-to-r from-red-500/10 to-red-600/5 text-red-800 dark:text-red-200 text-xs px-4 py-2 border-b border-red-500/20">
        {isProd ? 'Configuration issue detected.' : 'Dev config: '} Missing
        {!data.env.hasSupabase ? ' Supabase env' : ''}
        {!data.env.hasSupabase && !data.env.hasRpc ? ' and' : ''}
        {!data.env.hasRpc ? ' RPC override' : ''}.
        {isProd ? ' Check environment variables in Vercel.' : ' Fill .env.local to enable full features.'}
      </div>
    );
  }

  // Show subtle green banner when everything is OK (optional - only in dev)
  if (!isProd) {
    return (
      <div className="bg-gradient-to-r from-green-500/10 to-green-600/5 text-green-800 dark:text-green-200 text-xs px-4 py-2 border-b border-green-500/20">
        All environment variables configured ✓
      </div>
    );
  }

  return null;
}

