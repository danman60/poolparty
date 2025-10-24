"use client";

import React from "react";
import { Copy } from "lucide-react";
import { useToast } from "./ToastProvider";

export default function CopyLinkButton({ label = "Copy Link" }: { label?: string }) {
  const { addToast } = useToast();

  async function onCopy() {
    try {
      const href = typeof window !== 'undefined' ? window.location.href : '';
      await navigator.clipboard.writeText(href);
      addToast('Link copied to clipboard!', 'success');
    } catch (err) {
      addToast('Failed to copy link', 'error');
    }
  }
  return (
    <button
      onClick={onCopy}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-200"
      title="Copy current page link"
      aria-label="Copy current page link"
    >
      <Copy className="w-4 h-4" />
      {label}
    </button>
  );
}
