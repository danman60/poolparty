"use client";

import React from "react";
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
      className="text-xs underline opacity-70 hover:opacity-100"
      title="Copy current page link"
      aria-label="Copy current page link"
    >
      {label}
    </button>
  );
}
