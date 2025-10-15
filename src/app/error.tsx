"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to console for now; can be wired to a monitoring service later
    console.error("App error:", error);
  }, [error]);

  return (
    <html>
      <body className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
        <p className="opacity-80 text-sm mb-4">An unexpected error occurred while rendering this page.</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => reset()}
            className="px-3 py-1.5 rounded bg-black text-white dark:bg-white dark:text-black text-sm"
          >
            Try again
          </button>
          <Link href="/" className="text-sm underline">Go home</Link>
        </div>
      </body>
    </html>
  );
}
