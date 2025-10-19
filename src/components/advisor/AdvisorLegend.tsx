"use client";

import React, { useState } from "react";
import AdvisorBadge from "./AdvisorBadge";

export default function AdvisorLegend() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs opacity-70 hover:opacity-100 underline"
        aria-expanded={expanded}
        aria-label="Toggle rating legend"
      >
        {expanded ? "Hide Legend" : "Rating Legend"}
      </button>
      {expanded && (
        <div className="flex flex-wrap items-center gap-2 text-xs opacity-80 animate-in fade-in duration-200">
          <span className="inline-flex items-center gap-1">
            <AdvisorBadge status="excellent" label="Excellent" />
          </span>
          <span className="inline-flex items-center gap-1">
            <AdvisorBadge status="good" label="Good" />
          </span>
          <span className="inline-flex items-center gap-1">
            <AdvisorBadge status="warning" label="Fair" />
          </span>
          <span className="inline-flex items-center gap-1">
            <AdvisorBadge status="danger" label="Risky" />
          </span>
          <span className="inline-flex items-center gap-1">
            <AdvisorBadge status="critical" label="Critical" />
          </span>
        </div>
      )}
    </div>
  );
}
