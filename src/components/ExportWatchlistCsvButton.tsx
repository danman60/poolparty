"use client";

import React from "react";

import { useWatchlist } from "./WatchlistStore";
import { useToast } from "./ToastProvider";

export default function ExportWatchlistCsvButton({ label = "Export Watchlist CSV" }: { label?: string }) {
  const { items } = useWatchlist();
  const { addToast } = useToast();

  function onExport() {
    try {
      if (!items || items.length === 0) {
        addToast('Watchlist is empty', 'error');
        return;
      }
      const headers = ["pool_id","name"];
      const rows = items.map((it) => [it.id, it.name || ""]);
      const csv = toCsv(headers, rows);
      downloadCsv(`watchlist_${new Date().toISOString().slice(0,10)}.csv`, csv);
      addToast(`Exported ${items.length} pools from watchlist`, 'success');
    } catch (err) {
      console.error('Watchlist export failed:', err);
      addToast('Export failed. Please try again.', 'error');
    }
  }
  return (
    <button
      onClick={onExport}
      disabled={!items || items.length === 0}
      className={`text-xs underline ${(!items || items.length===0) ? 'opacity-30 cursor-not-allowed' : 'opacity-70 hover:opacity-100'}`}
      aria-label="Export watchlist to CSV"
      title="Export watchlist to CSV"
    >
      {label}
    </button>
  );
}

function toCsv(headers: string[], rows: Array<Array<string | number | bigint | null | undefined>>): string {
  const esc = (v: any) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  try {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {}
}
