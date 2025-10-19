"use client";

import React from "react";

export default function CopyLinkButton({ label = "Copy Link" }: { label?: string }) {
  async function onCopy() {
    try {
      const href = typeof window !== 'undefined' ? window.location.href : '';
      await navigator.clipboard.writeText(href);
    } catch {}
  }
  return (
    <button
      onClick={onCopy}
      className="text-xs underline opacity-70 hover:opacity-100"
      title="Copy current page link"
      aria-label="Copy current page link"
    >
      {label}
    </button>
  );
}
