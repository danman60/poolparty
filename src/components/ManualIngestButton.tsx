"use client";

import React, { useState } from "react";

export default function ManualIngestButton() {
  const [pending, setPending] = useState(false);

  async function onClick() {
    try {
      setPending(true);
      await fetch("/api/ingest/trigger", { method: "POST", cache: "no-store" });
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
