import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format large numbers with B/M/K suffixes
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted string (e.g., "$1.05B", "1.5M", "250K")
 */
export function formatLargeNumber(
  value: number | null | undefined,
  options: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
  } = {}
): string {
  const { prefix = '', suffix = '', decimals = 2 } = options;

  if (value == null || !Number.isFinite(value)) return '—';
  if (value === 0) return `${prefix}0${suffix}`;

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // Billions
  if (absValue >= 1_000_000_000) {
    return `${sign}${prefix}${(absValue / 1_000_000_000).toFixed(decimals)}B${suffix}`;
  }

  // Millions
  if (absValue >= 1_000_000) {
    return `${sign}${prefix}${(absValue / 1_000_000).toFixed(decimals)}M${suffix}`;
  }

  // Thousands
  if (absValue >= 1_000) {
    return `${sign}${prefix}${(absValue / 1_000).toFixed(decimals)}K${suffix}`;
  }

  // Less than 1000 - show full number
  return `${sign}${prefix}${absValue.toFixed(decimals)}${suffix}`;
}

