"use client";

import React from "react";
import AdvisorBadge from "./AdvisorBadge";

export default function AdvisorLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs opacity-80">
      <span className="opacity-60">Legend:</span>
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
  );
}
