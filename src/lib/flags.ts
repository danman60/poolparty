function toBool(v: string | undefined, d = false) {
  if (v == null) return d;
  const s = String(v).trim().toLowerCase();
  return ["1", "true", "on", "yes", "y"].includes(s);
}

export const FEATURE_STATUS = toBool(process.env.NEXT_PUBLIC_FEATURE_STATUS, true);
export const FEATURE_CHARTS = toBool(process.env.NEXT_PUBLIC_FEATURE_CHARTS, true);
export const FEATURE_MINT = toBool(process.env.NEXT_PUBLIC_FEATURE_MINT, true); // Enable for testing

export const FEATURE_TRENDS = toBool(process.env.NEXT_PUBLIC_FEATURE_TRENDS, false);
export const FEATURE_WALLET_STATS = toBool(process.env.NEXT_PUBLIC_FEATURE_WALLET_STATS, true);
export function isEnabled(name: string, defaultValue = false) {
  return toBool(process.env[name], defaultValue);
}

