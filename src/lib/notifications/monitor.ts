import { detectVolatilitySpike } from '@/lib/advisor/exitTriggers'
import { fetchTokenPrices } from '@/lib/prices'

type Options = {
  pollMs?: number
  volatility?: boolean
}

export type Unsubscribe = () => void

export async function fetchMetrics(poolId: string): Promise<Array<{ date: string; tvlUSD?: number; volumeUSD?: number; feesUSD?: number }>> {
  const res = await fetch(`/api/pools/${poolId}/metrics`, { cache: 'no-store' })
  const json = await res.json()
  if (Array.isArray(json?.data)) return json.data
  return []
}

async function fetchPoolMeta(poolId: string): Promise<{ token0?: { id?: string; symbol?: string }, token1?: { id?: string; symbol?: string } } | null> {
  try {
    const res = await fetch(`/api/pools/${poolId}`, { cache: 'no-store' })
    const json = await res.json()
    if (json?.pool) return json.pool
    return null
  } catch { return null }
}

export function startPoolMonitor(poolId: string, onAlert: (kind: string, data: any) => void, opts: Options = {}): Unsubscribe {
  const pollMs = opts.pollMs ?? 30_000
  let stopped = false
  let timer: any
  const lastAlerts: Record<string, number> = {}
  async function tick() {
    if (stopped) return
    try {
      const rows = await fetchMetrics(poolId)
      const returns: number[] = []

      // Volatility spike on feesUSD as proxy (rough heuristic)
      const fees = rows.map((r) => Number(r.feesUSD || 0))
      if ((opts.volatility ?? true) && fees.length >= 25) {
        for (let i = 1; i < fees.length; i++) {
          const prev = fees[i - 1] || 0
          const cur = fees[i] || 0
          const ret = prev > 0 ? ((cur - prev) / prev) * 100 : 0
          returns.push(ret)
        }
        const v = detectVolatilitySpike(returns, 24, 3)
        if (v.spike) {
          const key = 'volatility'
          const now = Date.now()
          if (!lastAlerts[key] || now - lastAlerts[key] > 30*60*1000) {
            lastAlerts[key] = now
            onAlert('volatility', v)
          }
        }
      }

      // Stablecoin depeg detection (symbol-based, CoinGecko price)
      try {
        const meta = await fetchPoolMeta(poolId)
        const stables = new Set(['USDC','USDT','DAI','TUSD','USDP','FRAX','LUSD','GUSD'])
        const tokens = [meta?.token0, meta?.token1].filter(t => t && t.symbol && stables.has(String(t.symbol))) as Array<{ id?: string; symbol?: string }>
        if (tokens.length > 0) {
          const addrs = tokens.map(t => String(t.id || '').toLowerCase()).filter(Boolean)
          if (addrs.length) {
            const prices = await fetchTokenPrices(addrs)
            tokens.forEach((t, idx) => {
              const addr = addrs[idx]
              const p = prices[addr]
              if (typeof p === 'number') {
                const dev = Math.abs((p - 1) / 1) * 100
                const level = dev > 2 ? 3 : dev > 1 ? 2 : dev > 0.5 ? 1 : 0
                if (level > 0) {
                  const key = `depeg:${t.symbol}`
                  const now = Date.now()
                  if (!lastAlerts[key] || now - lastAlerts[key] > 60*60*1000) {
                    lastAlerts[key] = now
                    onAlert('depeg', { level, symbol: t.symbol, price: p })
                  }
                }
              }
            })
          }
        }
      } catch {}
    } catch {}
    finally {
      timer = setTimeout(tick, pollMs)
    }
  }
  tick()
  return () => { stopped = true; if (timer) clearTimeout(timer) }
}
