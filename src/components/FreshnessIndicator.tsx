"use client";

import { useQuery } from "@tanstack/react-query";

type DataRes = { ok: boolean; iso: string | null; ageMs: number | null; dryRun?: boolean };

export default function FreshnessIndicator() {
  const { data, isLoading } = useQuery<DataRes>({
    queryKey: ["freshness"],
    queryFn: async () => {
      const res = await fetch("/api/health/data", { cache: "no-store" });
      return res.json();
    },
    refetchInterval: 60_000,
  });

  if (isLoading) return <Badge label="Checking…" tone="neutral" />;
  if (!data) return <Badge label="No data" tone="warn" />;
  if (data.dryRun) return <Badge label="No DB configured" tone="neutral" />;

  const ageMin = data.ageMs != null ? Math.max(0, Math.round(data.ageMs / 60000)) : null;
  const tone: Tone = ageMin == null ? "warn" : ageMin <= 10 ? "ok" : ageMin <= 60 ? "neutral" : "warn";
  const label = ageMin == null ? "No data" : ageMin === 0 ? "Updated just now" : `Updated ${ageMin}m ago`;

  return <Badge label={label} tone={tone} />;
}

type Tone = "ok" | "neutral" | "warn";

function Badge({ label, tone }: { label: string; tone: Tone }) {
  const cls =
    tone === "ok"
      ? "bg-green-500/15 text-green-700 dark:text-green-300"
      : tone === "neutral"
      ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300"
      : "bg-red-500/15 text-red-700 dark:text-red-300";
  const dot =
    tone === "ok" ? "bg-green-500" : tone === "neutral" ? "bg-yellow-500" : "bg-red-500";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${cls}`} title={label}>
      <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

