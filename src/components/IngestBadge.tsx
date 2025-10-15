"use client";

import { useQuery } from "@tanstack/react-query";

type IngestRes = { ok: boolean; latestIso?: string | null; ageMs?: number | null; pools?: number | null; dryRun?: boolean };

export default function IngestBadge() {
  const { data } = useQuery<IngestRes>({
    queryKey: ["ingestBadge"],
    queryFn: async () => {
      const res = await fetch("/api/health/ingest", { cache: "no-store" });
      return res.json();
    },
    staleTime: 60_000,
  });
  if (!data) return null;
  if (data.dryRun) return null;
  const ageMin = data.ageMs != null ? Math.max(0, Math.round(data.ageMs / 60000)) : null;
  const label = ageMin == null ? "Ingest: n/a" : ageMin === 0 ? "Ingest: now" : `Ingest: ${ageMin}m`;
  const tone = ageMin == null ? "warn" : ageMin <= 10 ? "ok" : ageMin <= 60 ? "neutral" : "warn";
  return (
    <span
      title={data.latestIso || undefined}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
        tone === "ok"
          ? "bg-green-500/15 text-green-700 dark:text-green-300"
          : tone === "neutral"
          ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300"
          : "bg-red-500/15 text-red-700 dark:text-red-300"
      }`}
    >
      <span className={`inline-block w-2 h-2 rounded-full ${tone === "ok" ? "bg-green-500" : tone === "neutral" ? "bg-yellow-500" : "bg-red-500"}`} />
      {label}
      {typeof data.pools === "number" && <span className="opacity-70">· Pools: {data.pools}</span>}
    </span>
  );
}
