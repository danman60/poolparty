# PoolParty External Integrations

## Overview

PoolParty integrates with multiple external services for blockchain data, wallet connections, and data storage.

---

## Integration Architecture

```
┌─────────────┐
│  PoolParty  │
└──────┬──────┘
       │
       ├─────► The Graph (Uniswap V3 Subgraph)
       ├─────► Supabase (PostgreSQL Database)
       ├─────► Ethereum RPC (Alchemy/Infura)
       ├─────► Uniswap V3 Contracts
       ├─────► wagmi (Wallet Connection)
       └─────► Vercel (Hosting & Cron)
```

---

## The Graph Integration

### Purpose
Query historical and aggregated Uniswap V3 data.

### Subgraph Endpoints

**Mainnet:**
```
https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3
```

**Arbitrum (Future):**
```
https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-arbitrum
```

### Query Examples

**Top Pools by TVL:**
```graphql
query TopPools {
  pools(
    first: 100
    orderBy: totalValueLockedUSD
    orderDirection: desc
  ) {
    id
    token0 {
      id
      symbol
      name
      decimals
    }
    token1 {
      id
      symbol
      name
      decimals
    }
    feeTier
    totalValueLockedUSD
    volumeUSD
    feesUSD
    liquidity
    sqrtPrice
    tick
    token0Price
    token1Price
  }
}
```

**Pool Snapshots (Historical Data):**
```graphql
query PoolSnapshots($poolId: ID!) {
  poolDayDatas(
    first: 30
    orderBy: date
    orderDirection: desc
    where: { pool: $poolId }
  ) {
    date
    tvlUSD
    volumeUSD
    feesUSD
    liquidity
    sqrtPrice
    tick
    token0Price
    token1Price
  }
}
```

**User Positions:**
```graphql
query UserPositions($owner: String!) {
  positions(
    where: { owner: $owner }
    orderBy: liquidity
    orderDirection: desc
  ) {
    id
    pool {
      id
      token0 { symbol }
      token1 { symbol }
      feeTier
    }
    liquidity
    tickLower { tickIdx }
    tickUpper { tickIdx }
    depositedToken0
    depositedToken1
    withdrawnToken0
    withdrawnToken1
    collectedFeesToken0
    collectedFeesToken1
  }
}
```

### Rate Limits

**Free Tier:**
- 1,000 requests/day
- 100 requests/minute

**Mitigation:**
- Cache responses in Supabase
- Hourly/daily ingestion cron
- Client-side caching

### Error Handling

**Pattern:**
```typescript
async function fetchFromSubgraph<T>(query: string, variables?: any): Promise<T | null> {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables })
    })

    if (!response.ok) {
      console.error('Subgraph error:', response.status)
      return null
    }

    const { data, errors } = await response.json()

    if (errors) {
      console.error('GraphQL errors:', errors)
      return null
    }

    return data
  } catch (error) {
    console.error('Subgraph fetch failed:', error)
    return null
  }
}
```

---

## Supabase Integration

### Purpose
PostgreSQL database for storing pool data, tokens, and historical snapshots.

### Connection

**Server-Side:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE!

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
})
```

**Client-Side:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, anonKey)
```

### Schema

See `DATABASE.md` for complete schema.

**Key Tables:**
- `tokens` - Token metadata
- `pools` - Pool current state
- `pool_snapshots` - Historical data

### Queries

**Fetch Top Pools:**
```typescript
const { data: pools, error } = await supabase
  .from('pools')
  .select('*, token0:tokens!pools_token0_id_fkey(*), token1:tokens!pools_token1_id_fkey(*)')
  .order('tvl_usd', { ascending: false })
  .limit(100)
```

**Fetch Pool Snapshots:**
```typescript
const { data: snapshots } = await supabase
  .from('pool_snapshots')
  .select('*')
  .eq('pool_id', poolId)
  .order('timestamp', { ascending: false })
  .limit(30)
```

**Insert Pool Data:**
```typescript
const { error } = await supabase
  .from('pools')
  .upsert({
    id: pool.id,
    token0_id: pool.token0.id,
    token1_id: pool.token1.id,
    fee_tier: pool.feeTier,
    tvl_usd: pool.totalValueLockedUSD,
    volume_usd: pool.volumeUSD,
    fees_usd: pool.feesUSD,
    liquidity: pool.liquidity,
    sqrt_price: pool.sqrtPrice,
    tick: pool.tick,
    updated_at: new Date().toISOString()
  })
```

### Real-Time Subscriptions (Future)

**Pattern:**
```typescript
const subscription = supabase
  .channel('pool-updates')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'pools'
  }, (payload) => {
    console.log('Pool updated:', payload.new)
  })
  .subscribe()
```

### Row Level Security (RLS)

**Current:** All tables public read

**Future (User Features):**
```sql
-- Only users can read their own data
CREATE POLICY "Users can read own positions"
ON user_positions
FOR SELECT
USING (auth.uid() = user_id);
```

---

## Ethereum RPC Integration

### Purpose
Read blockchain state, submit transactions, estimate gas.

### Providers

**Public RPC (Default):**
```typescript
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http()
})
```

**Alchemy (Recommended):**
```typescript
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_MAINNET)
})
```

**Configuration:**
```
NEXT_PUBLIC_RPC_MAINNET=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### Common Operations

**Read Contract:**
```typescript
const totalSupply = await publicClient.readContract({
  address: '0x...',
  abi: ERC20_ABI,
  functionName: 'totalSupply'
})
```

**Estimate Gas:**
```typescript
const gas = await publicClient.estimateContractGas({
  address: POSITION_MANAGER,
  abi: PositionManagerABI,
  functionName: 'mint',
  args: [params],
  account: userAddress
})
```

**Get Block Number:**
```typescript
const blockNumber = await publicClient.getBlockNumber()
```

### Rate Limits

**Public RPC:**
- ~10 requests/second
- Unreliable

**Alchemy Free:**
- 300M compute units/month
- ~100 requests/second

**Mitigation:**
- Use custom RPC endpoint
- Cache responses
- Batch requests
- Exponential backoff on errors

---

## Uniswap V3 Integration

### Contracts

**Position Manager:**
```
0xC36442b4a4522E871399CD717aBDD847Ab11FE88
```

**Swap Router:**
```
0xE592427A0AEce92De3Edee1F18E0157C05861564
```

**Factory:**
```
0x1F98431c8aD98523631AE4a59f267346ea31F984
```

### ABIs

**Import Pattern:**
```typescript
import PositionManagerABI from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import SwapRouterABI from '@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json'
import FactoryABI from '@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json'
```

### Contract Interactions

See `WALLET.md` for detailed wallet interaction patterns.

**Mint Position:**
```typescript
const tx = await positionManager.write.mint([{
  token0: pool.token0,
  token1: pool.token1,
  fee: pool.feeTier,
  tickLower: range.tickLower,
  tickUpper: range.tickUpper,
  amount0Desired: amounts.amount0,
  amount1Desired: amounts.amount1,
  amount0Min: 0n,
  amount1Min: 0n,
  recipient: address,
  deadline: Math.floor(Date.now() / 1000) + 1200
}])
```

**Collect Fees:**
```typescript
const tx = await positionManager.write.collect([{
  tokenId,
  recipient: address,
  amount0Max: MaxUint128,
  amount1Max: MaxUint128
}])
```

### SDK Integration

**Uniswap V3 SDK:**
```typescript
import { Pool, Position, nearestUsableTick } from '@uniswap/v3-sdk'
import { Token, CurrencyAmount } from '@uniswap/sdk-core'

const token0 = new Token(1, pool.token0.id, pool.token0.decimals, pool.token0.symbol)
const token1 = new Token(1, pool.token1.id, pool.token1.decimals, pool.token1.symbol)

const poolObj = new Pool(
  token0,
  token1,
  pool.feeTier,
  pool.sqrtPrice,
  pool.liquidity,
  pool.tick
)
```

---

## wagmi Integration

### Purpose
React hooks for Ethereum wallet interactions.

### Configuration

**File:** `src/lib/wagmi.tsx`

```typescript
import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http()
  }
})
```

### Common Hooks

**Account:**
```typescript
import { useAccount } from 'wagmi'

const { address, isConnected, chainId } = useAccount()
```

**Connect:**
```typescript
import { useConnect } from 'wagmi'

const { connect, connectors } = useConnect()

// Connect to injected wallet (MetaMask)
connect({ connector: connectors[0] })
```

**Disconnect:**
```typescript
import { useDisconnect } from 'wagmi'

const { disconnect } = useDisconnect()
```

**Read Contract:**
```typescript
import { useReadContract } from 'wagmi'

const { data: balance } = useReadContract({
  address: '0x...',
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: [userAddress]
})
```

**Write Contract:**
```typescript
import { useWriteContract } from 'wagmi'

const { writeContract, isPending, isSuccess } = useWriteContract()

writeContract({
  address: POSITION_MANAGER,
  abi: PositionManagerABI,
  functionName: 'mint',
  args: [params]
})
```

**Transaction Receipt:**
```typescript
import { useWaitForTransactionReceipt } from 'wagmi'

const { data: receipt, isLoading } = useWaitForTransactionReceipt({
  hash: txHash
})
```

### Wallet Support

**Supported:**
- ✅ MetaMask
- ✅ Any injected wallet (Coinbase, Rainbow, etc.)

**Planned:**
- ⚠️ WalletConnect
- ⚠️ Ledger
- ⚠️ Trezor

---

## Vercel Integration

### Purpose
Hosting, deployment, serverless functions, cron jobs.

### Configuration

**File:** `vercel.json`

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "crons": [{
    "path": "/api/ingest/uniswap",
    "schedule": "0 0 * * *"
  }]
}
```

### Deployment

**Automatic:**
- Push to `main` branch → Production deploy
- Push to other branches → Preview deploy

**Manual:**
```bash
vercel deploy --prod
```

### Environment Variables

**Vercel Dashboard:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `NEXT_PUBLIC_RPC_MAINNET`
- `SUBGRAPH_API_KEY` (future)

### Cron Jobs

**Ingestion Cron:**
- **Path:** `/api/ingest/uniswap`
- **Schedule:** `0 0 * * *` (daily at midnight UTC)
- **Purpose:** Fetch latest pool data from subgraph

**Limitations:**
- Hobby tier: Daily cron only
- Pro tier: Minutely cron available

### Logs

**View logs:**
```bash
vercel logs
```

**Real-time logs:**
```bash
vercel logs --follow
```

---

## Analytics Integration (Future)

### Vercel Analytics

**Installation:**
```bash
npm install @vercel/analytics
```

**Usage:**
```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

**Metrics:**
- Page views
- User sessions
- Conversion funnels
- Web vitals

---

## Error Monitoring (Future)

### Sentry Integration

**Installation:**
```bash
npm install @sentry/nextjs
```

**Configuration:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
})
```

**Usage:**
```typescript
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error)
  throw error
}
```

---

## Multi-Chain Integration (Future)

### Arbitrum Support

**RPC:**
```
NEXT_PUBLIC_RPC_ARBITRUM=https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
```

**Subgraph:**
```
https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-arbitrum
```

**Contracts:**
- Position Manager: `0xC36442b4a4522E871399CD717aBDD847Ab11FE88`
- Factory: `0x1F98431c8aD98523631AE4a59f267346ea31F984`

### Chain Abstraction

**Pattern:**
```typescript
const CHAIN_CONFIG = {
  1: {
    name: 'Ethereum',
    rpc: process.env.NEXT_PUBLIC_RPC_MAINNET,
    subgraph: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
  },
  42161: {
    name: 'Arbitrum',
    rpc: process.env.NEXT_PUBLIC_RPC_ARBITRUM,
    subgraph: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-arbitrum',
    positionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88'
  }
}
```

---

## Integration Testing

### Subgraph Health Check

**Endpoint:** `/api/health/subgraph`

```typescript
export async function GET() {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ _meta { block { number } } }'
      })
    })

    const { data } = await response.json()
    const blockNumber = data._meta.block.number

    return NextResponse.json({
      status: 'healthy',
      blockNumber,
      lagBlocks: currentBlock - blockNumber
    })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 503 })
  }
}
```

### RPC Health Check

**Endpoint:** `/api/health/rpc`

```typescript
export async function GET() {
  try {
    const start = Date.now()
    const blockNumber = await publicClient.getBlockNumber()
    const latency = Date.now() - start

    return NextResponse.json({
      status: 'healthy',
      blockNumber,
      latency
    })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 503 })
  }
}
```

### Database Health Check

**Endpoint:** `/api/health/supabase`

```typescript
export async function GET() {
  try {
    const { count, error } = await supabase
      .from('pools')
      .select('*', { count: 'exact', head: true })

    if (error) throw error

    return NextResponse.json({
      status: 'healthy',
      poolCount: count
    })
  } catch (error) {
    return NextResponse.json({ status: 'unhealthy', error: error.message }, { status: 503 })
  }
}
```

---

## Rate Limiting

### Client-Side Rate Limiting

**Pattern:**
```typescript
class RateLimiter {
  private requests: number[] = []
  private limit: number
  private window: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.window = windowMs
  }

  canRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.window)

    if (this.requests.length < this.limit) {
      this.requests.push(now)
      return true
    }

    return false
  }
}

const subgraphLimiter = new RateLimiter(100, 60000) // 100 requests/min
```

---

## Caching Strategy

### Subgraph Response Cache

**Pattern:**
```typescript
const cache = new Map<string, { data: any, timestamp: number }>()

async function fetchWithCache(query: string, ttlMs = 60000) {
  const cached = cache.get(query)

  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data
  }

  const data = await fetchFromSubgraph(query)
  cache.set(query, { data, timestamp: Date.now() })

  return data
}
```

### Next.js Caching

**Static Generation:**
```typescript
export const revalidate = 3600 // Revalidate every hour

export default async function PoolPage({ params }) {
  const pool = await fetch(`/api/pools/${params.id}`).then(r => r.json())
  return <PoolDetail pool={pool} />
}
```

**On-Demand Revalidation:**
```typescript
import { revalidatePath } from 'next/cache'

export async function POST() {
  await ingestData()
  revalidatePath('/') // Revalidate homepage
  revalidatePath('/pool/[id]', 'page') // Revalidate all pool pages
}
```

---

## Security Considerations

### API Keys

**Storage:**
- Server-side keys in Vercel environment
- Never expose in client code
- Use `.env.local` for development

### RPC Security

**Best Practices:**
- Use authenticated RPC endpoints
- Rotate API keys quarterly
- Monitor usage for abuse
- Set spending limits

### Contract Interactions

**Validation:**
- Verify contract addresses
- Check transaction parameters
- Set reasonable gas limits
- Use slippage protection

---

## Monitoring & Alerts

### Health Checks

**Frequency:** Every 5 minutes

**Checks:**
- RPC connectivity
- Subgraph sync status
- Database availability
- Cron job success

### Alerts (Future)

**Trigger Conditions:**
- RPC latency > 2s
- Subgraph lag > 100 blocks
- Database query time > 1s
- Cron job failure
- Error rate > 5%

**Channels:**
- Email
- Slack
- PagerDuty

---

## Integration Roadmap

### v0.2 (Current)
- ✅ The Graph integration
- ✅ Supabase storage
- ✅ wagmi wallet connection
- ✅ Vercel hosting + cron

### v0.3 (Q2 2025)
- ⚠️ Arbitrum subgraph
- ⚠️ Multi-chain RPC
- ⚠️ WalletConnect support

### v0.4 (Q2 2025)
- ⚠️ Vercel Analytics
- ⚠️ Sentry error tracking
- ⚠️ Real-time Supabase subscriptions

### v1.0 (Q4 2025)
- ⚠️ Additional DEXs (SushiSwap, Curve)
- ⚠️ ENS integration
- ⚠️ Notification services (Telegram, Discord)

---

## Resources

### Documentation
- [The Graph Docs](https://thegraph.com/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [wagmi Docs](https://wagmi.sh/)
- [Vercel Docs](https://vercel.com/docs)
- [Uniswap V3 Docs](https://docs.uniswap.org/contracts/v3/overview)

### Contract Addresses
- [Uniswap Deployments](https://docs.uniswap.org/contracts/v3/reference/deployments)

### Subgraph Explorer
- [Uniswap V3 Subgraph](https://thegraph.com/explorer/subgraphs/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV)
