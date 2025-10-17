import React from "react";

export default function ManualIngestButton() {
  const hasSecret = !!process.env.INGEST_SECRET;
  if (!hasSecret) return null;

  async function triggerIngest() {
    "use server";
    const token = process.env.INGEST_SECRET as string | undefined;
    if (!token) return;

    const base = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const url = `${base}/api/ingest/uniswap?limit=50`;
    try {
      await fetch(url, {
        method: "GET",
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });
    } catch {
      // ignore errors; UI will reflect via status badge
    }
  }

  return (
    <form action={triggerIngest}>
      <button
        type="submit"
        className="px-2 py-1 rounded border border-black/10 dark:border-white/10 text-xs hover:bg-black/5 dark:hover:bg-white/5"
        title="Manually trigger data ingest"
      >
        Refresh Data
      </button>
    </form>
  );
}

