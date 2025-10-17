"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ManualIngestButton() {
  const [pending, setPending] = useState(false);
  const queryClient = useQueryClient();

  async function onClick() {
    try {
      setPending(true);
      await fetch("/api/ingest/trigger", { method: "POST", cache: "no-store" });
      // Invalidate all relevant queries to trigger refetch
      await queryClient.invalidateQueries({ queryKey: ["pools"] });
      await queryClient.invalidateQueries({ queryKey: ["freshness"] });
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
      title="Manually trigger data ingest"
    >
      {pending ? "Refreshing…" : "Refresh Data"}
    </button>
  );
}
