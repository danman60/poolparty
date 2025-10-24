"use client";

import React from "react";
import { useToast } from "./ToastProvider";

// Simple copy icon as inline SVG (to avoid lucide-react Turbopack issues)
function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

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
      <CopyIcon />
      {label}
    </button>
  );
}
