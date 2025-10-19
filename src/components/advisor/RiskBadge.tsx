"use client";

import React from "react";

type RiskType = 'depeg' | 'out-of-range' | 'stop-loss' | 'volatility';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskData = {
  type: RiskType;
  level: RiskLevel;
  message?: string;
};

export default function RiskBadge({ type, level, message }: RiskData) {
  const badgeClass = getBadgeClass(level);
  const icon = getRiskIcon(type);
  const label = message || getDefaultLabel(type, level);

  return (
    <div
      className={`${badgeClass} px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1`}
      title={label}
      aria-label={`${type} risk: ${label}`}
    >
      <span>{icon}</span>
      <span>{getRiskTypeLabel(type)}</span>
    </div>
  );
}

function getBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'badge-good';
    case 'medium':
      return 'badge-warning';
    case 'high':
      return 'badge-danger';
    case 'critical':
      return 'badge-critical pulse';
  }
}

function getRiskIcon(type: RiskType): string {
  switch (type) {
    case 'depeg':
      return '!';
    case 'out-of-range':
      return 'X';
    case 'stop-loss':
      return '!';
    case 'volatility':
      return '~';
  }
}

function getRiskTypeLabel(type: RiskType): string {
  switch (type) {
    case 'depeg':
      return 'Depeg';
    case 'out-of-range':
      return 'Out of Range';
    case 'stop-loss':
      return 'Stop Loss';
    case 'volatility':
      return 'High Vol';
  }
}

function getDefaultLabel(type: RiskType, level: RiskLevel): string {
  const severity = level === 'critical' ? 'Critical' : level === 'high' ? 'High' : level === 'medium' ? 'Medium' : 'Low';
  return `${severity} ${getRiskTypeLabel(type)} Risk`;
}
