# PoolParty Component Library

## Overview

PoolParty uses Next.js 15 App Router with React 19. Components follow a functional design with hooks, server/client component separation, and TypeScript typing.

## Component Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Homepage (pools dashboard)
│   ├── error.tsx           # Error boundary
│   ├── pool/[id]/          # Dynamic pool detail pages
│   ├── wallet/             # Wallet positions page
│   └── status/             # System health page
└── components/             # Reusable components
    ├── ui/                 # Base UI components
    ├── PoolsTable.tsx      # Main pools listing
    ├── WalletButton.tsx    # Wallet connection
    ├── WalletPositions.tsx # LP position list
    ├── MintPosition.tsx    # Create new position
    └── ...                 # Feature components
```

---

## Core Layout Components

### RootLayout (`app/layout.tsx`)

Root layout wrapping all pages.

**Purpose**: Global providers, metadata, styling

**Structure:**
```tsx
<html lang="en">
  <body>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <header>
            <WalletButton />
          </header>
          {children}
        </ToastProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </body>
</html>
```

**Providers:**
- `WagmiProvider` - Ethereum wallet context
- `QueryClientProvider` - React Query for data fetching
- `ToastProvider` - Notification system

**Metadata:**
```typescript
export const metadata: Metadata = {
  title: "PoolParty - Uniswap V3 Analytics",
  description: "Analytics and management for Uniswap V3 liquidity positions"
}
```

---

## Page Components

### HomePage (`app/page.tsx`)

Main dashboard displaying top pools.

**Route:** `/`

**Features:**
- Pool list with TVL, Volume, APR
- Sorting and filtering
- Navigation to pool details
- Data freshness indicators

**Key Components Used:**
- `<PoolsTable />` - Main table
- `<FreshnessIndicator />` - Data age warning
- `<EnvBanner />` - Dev environment notice

**Data Fetching:**
```typescript
// Server-side data fetch
const pools = await fetch('/api/pools').then(r => r.json())
```

---

### PoolDetailPage (`app/pool/[id]/page.tsx`)

Detailed view of a single pool.

**Route:** `/pool/:id`

**URL Params:**
- `id` - Pool address (0x...)

**Features:**
- Pool metrics (TVL, Volume, Fees)
- Token pair information
- Historical charts
- APR calculator
- Mint position UI

**Key Components:**
- `<PoolMetricsCharts />` - Time series charts
- `<APRCalculator />` - APR projection tool
- `<MintPosition />` - Create LP position
- `<TickRangeControls />` - Range selector

**Data Fetching:**
```typescript
const pool = await fetch(`/api/pools/${id}`).then(r => r.json())
const snapshots = await fetch(`/api/pools/${id}/snapshots`).then(r => r.json())
```

---

### WalletPage (`app/wallet/page.tsx`)

User's LP positions dashboard.

**Route:** `/wallet`

**Auth:** Requires wallet connection

**Features:**
- List of user's positions
- Fees owed per position
- Liquidity management actions
- Position health indicators

**Key Components:**
- `<WalletPositions />` - Position list
- `<CollectFeesButton />` - Claim fees
- `<DecreaseLiquidityButton />` - Remove liquidity

**Data Source:**
```typescript
// On-chain reads via wagmi
const { data: positions } = usePositions(address)
```

---

### StatusPage (`app/status/page.tsx`)

System health monitoring.

**Route:** `/status`

**Features:**
- RPC connectivity check
- Subgraph sync status
- Database freshness
- Ingestion status
- Environment config

**API Calls:**
- `/api/health/env`
- `/api/health/data`
- `/api/health/rpc`
- `/api/health/subgraph`
- `/api/health/ingest`

---

## Feature Components

### PoolsTable

Main pools listing with sorting and pagination.

**File:** `src/components/PoolsTable.tsx`

**Props:** None (fetches data internally)

**Features:**
- Sort by TVL, Volume, APR, Fee Tier
- Click row to navigate to pool detail
- Token pair display with symbols
- Formatted numbers (K, M, B)
- Percentage displays

**State:**
```typescript
const [pools, setPools] = useState<Pool[]>([])
const [loading, setLoading] = useState(true)
const [sortBy, setSortBy] = useState<'tvl' | 'volume' | 'apr'>('tvl')
```

**Usage:**
```tsx
<PoolsTable />
```

---

### WalletButton

Wallet connection button with MetaMask integration.

**File:** `src/components/WalletButton.tsx`

**Props:** None

**Features:**
- Connect wallet popup
- Display connected address (truncated)
- Disconnect functionality
- Network display
- Connection persistence

**States:**
- Disconnected: "Connect Wallet" button
- Connected: "0x742d...35Cb9" with disconnect option

**Usage:**
```tsx
<WalletButton />
```

**Hooks Used:**
```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi'

const { address, isConnected } = useAccount()
const { connect } = useConnect()
const { disconnect } = useDisconnect()
```

---

### WalletPositions

List of user's Uniswap V3 LP positions.

**File:** `src/components/WalletPositions.tsx`

**Props:** None (reads from wallet context)

**Features:**
- Position NFT display
- Liquidity value in USD
- Fees owed per token
- In-range / out-of-range status
- Action buttons per position

**Data Structure:**
```typescript
interface Position {
  tokenId: string
  pool: string
  liquidity: bigint
  tickLower: number
  tickUpper: number
  feeGrowthInside0: bigint
  feeGrowthInside1: bigint
  tokensOwed0: bigint
  tokensOwed1: bigint
}
```

**Usage:**
```tsx
<WalletPositions />
```

---

### MintPosition

UI for creating new LP positions.

**File:** `src/components/MintPosition.tsx`

**Props:**
```typescript
{
  poolId: string         // Pool address
  feeTier?: number       // 500, 3000, 10000
  token0?: string        // Token0 address
  token1?: string        // Token1 address
}
```

**Features:**
- Amount inputs for both tokens
- Price range selector (ticks)
- Slippage tolerance
- Gas estimation
- Token approval flow
- Transaction submission

**User Flow:**
1. Enter token amounts
2. Select price range
3. Approve tokens
4. Submit mint transaction
5. Wait for confirmation

**Usage:**
```tsx
<MintPosition
  poolId="0x..."
  feeTier={3000}
  token0="0x..."
  token1="0x..."
/>
```

---

### APRCalculator

Interactive APR projection calculator.

**File:** `src/components/APRCalculator.tsx`

**Props:**
```typescript
{
  initialTVL: number      // Pool TVL in USD
  initialVolume24h: number // 24h volume
  feeBps: number          // Fee tier in basis points (5, 30, 100)
}
```

**Features:**
- 24h, 7d, 30d APR calculations
- Custom volume input
- Custom position size input
- Projected earnings display
- Range efficiency factor

**Formula:**
```
APR = (volume * feeTier / tvl) * 365
```

**Usage:**
```tsx
<APRCalculator
  initialTVL={100_000_000}
  initialVolume24h={50_000_000}
  feeBps={30}
/>
```

---

### PoolMetricsCharts

Time series charts for pool metrics.

**File:** `src/components/PoolMetricsCharts.tsx`

**Props:**
```typescript
{
  poolId: string  // Pool address
}
```

**Charts:**
- TVL over time (line chart)
- Volume over time (bar chart)
- Fees collected (area chart)

**Time Ranges:**
- 24 hours
- 7 days
- 30 days

**Library:** Recharts

**Usage:**
```tsx
<PoolMetricsCharts poolId="0x..." />
```

---

### CollectFeesButton

Button to claim fees from LP position.

**File:** `src/components/CollectFeesButton.tsx`

**Props:**
```typescript
{
  tokenId: string  // Position NFT ID
}
```

**Features:**
- Displays fees owed
- Gas estimation
- Transaction submission
- Success/error toast

**Contract Call:**
```typescript
positionManager.collect({
  tokenId,
  recipient: address,
  amount0Max: MaxUint128,
  amount1Max: MaxUint128
})
```

**Usage:**
```tsx
<CollectFeesButton tokenId="12345" />
```

---

### ApproveButton

Token approval button for ERC20s.

**File:** `src/components/ApproveButton.tsx`

**Props:**
```typescript
{
  token: `0x${string}`      // Token address
  spender: `0x${string}`    // Spender address (Position Manager)
  label?: string            // Button text
  onSuccess?: () => void    // Callback after approval
}
```

**Features:**
- Check current allowance
- Request approval if needed
- Shows approved state
- Loading states

**Usage:**
```tsx
<ApproveButton
  token="0x..."
  spender={POSITION_MANAGER}
  label="Approve USDC"
  onSuccess={() => toast.success('Approved')}
/>
```

---

### DecreaseLiquidityButton

Remove liquidity from position.

**File:** `src/components/DecreaseLiquidityButton.tsx`

**Props:**
```typescript
{
  tokenId: string     // Position NFT ID
  liquidity: string   // Amount to remove
}
```

**Features:**
- Percentage selector (25%, 50%, 75%, 100%)
- Shows token amounts to receive
- Slippage protection
- Transaction submission

**Contract Call:**
```typescript
positionManager.decreaseLiquidity({
  tokenId,
  liquidity: BigInt(liquidity),
  amount0Min: 0n,
  amount1Min: 0n,
  deadline: Math.floor(Date.now() / 1000) + 600
})
```

**Usage:**
```tsx
<DecreaseLiquidityButton
  tokenId="12345"
  liquidity="100000000000"
/>
```

---

### TickRangeControls

Input controls for price range selection.

**File:** `src/components/TickRangeControls.tsx`

**Props:**
```typescript
{
  tickSpacing: number       // Pool tick spacing (10, 60, 200)
  currentTick: number       // Current pool tick
  lower: number             // Lower tick
  upper: number             // Upper tick
  onLower: (tick: number) => void
  onUpper: (tick: number) => void
}
```

**Features:**
- Number inputs for ticks
- Validation for tick spacing
- Shows price equivalents
- Min/max constraints

**Usage:**
```tsx
<TickRangeControls
  tickSpacing={60}
  currentTick={-200000}
  lower={-201000}
  upper={-199000}
  onLower={setLowerTick}
  onUpper={setUpperTick}
/>
```

---

### TickRangeSlider

Visual slider for tick range selection.

**File:** `src/components/TickRangeSlider.tsx`

**Props:**
```typescript
{
  tickSpacing: number
  currentTick: number
  lower: number
  upper: number
  onLower: (tick: number) => void
  onUpper: (tick: number) => void
  span?: number  // Visible tick range (default 500)
}
```

**Features:**
- Dual-handle range slider
- Current price marker
- Visual representation of range
- Snaps to valid tick spacing

**Usage:**
```tsx
<TickRangeSlider
  tickSpacing={60}
  currentTick={-200000}
  lower={-201000}
  upper={-199000}
  onLower={setLowerTick}
  onUpper={setUpperTick}
  span={1000}
/>
```

---

### PoolSparkline

Mini line chart for pool trends.

**File:** `src/components/PoolSparkline.tsx`

**Props:**
```typescript
{
  data: Point[]  // { timestamp: number, value: number }[]
}
```

**Features:**
- Compact visualization
- No axes (sparkline style)
- Trend indication

**Usage:**
```tsx
<PoolSparkline data={volumeData} />
```

---

### FreshnessIndicator

Data age warning banner.

**File:** `src/components/FreshnessIndicator.tsx`

**Props:** None

**Features:**
- Queries `/api/health/data`
- Shows warning if data > 2 hours old
- Displays last update timestamp

**States:**
- Fresh (< 2h): No display
- Stale (> 2h): Yellow warning banner
- Very stale (> 12h): Red error banner

**Usage:**
```tsx
<FreshnessIndicator />
```

---

### IngestBadge

Data ingestion status indicator.

**File:** `src/components/IngestBadge.tsx`

**Props:** None

**Features:**
- Queries `/api/health/ingest`
- Shows last ingestion time
- Status badge (success/error)

**Usage:**
```tsx
<IngestBadge />
```

---

### EnvBanner

Development environment notice.

**File:** `src/components/EnvBanner.tsx`

**Props:** None

**Features:**
- Only shows in development
- Displays `NEXT_PUBLIC_ENV` value
- Warning styling

**Usage:**
```tsx
<EnvBanner />
```

---

### ToastProvider

Toast notification system.

**File:** `src/components/ToastProvider.tsx`

**Exports:**
- `<ToastProvider>` - Context provider
- `useToast()` - Hook for showing toasts

**Usage:**
```tsx
// In layout
<ToastProvider>{children}</ToastProvider>

// In components
const { showToast } = useToast()
showToast({ type: 'success', message: 'Transaction confirmed!' })
showToast({ type: 'error', message: 'Transaction failed' })
```

**Toast Types:**
- `success` - Green checkmark
- `error` - Red X
- `warning` - Yellow alert
- `info` - Blue info

---

## UI Components

### Button (`components/ui/button.tsx`)

Base button component with variants.

**Variants:**
- `primary` - Main actions
- `secondary` - Secondary actions
- `destructive` - Dangerous actions
- `ghost` - Minimal styling

**Sizes:**
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large

**Usage:**
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>
```

---

## Component Patterns

### Server vs Client Components

**Server Components** (default in App Router):
- `app/page.tsx`
- `app/pool/[id]/page.tsx`
- `app/layout.tsx`

**Client Components** (require 'use client'):
- All components using hooks
- All wallet interaction components
- All form components

**Example:**
```tsx
'use client'

import { useState } from 'react'

export default function ClientComponent() {
  const [state, setState] = useState(0)
  // ...
}
```

---

### Props Typing

All props use TypeScript interfaces:

```typescript
interface ComponentProps {
  required: string
  optional?: number
  callback?: (value: string) => void
  children?: React.ReactNode
}

export default function Component({ required, optional = 10, callback, children }: ComponentProps) {
  // ...
}
```

---

### State Management

**Local State:**
```typescript
const [value, setValue] = useState<string>('')
```

**Global State (wagmi):**
```typescript
const { address, isConnected } = useAccount()
const { data } = useBalance({ address })
```

**Server State (React Query):**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['pool', id],
  queryFn: () => fetch(`/api/pools/${id}`).then(r => r.json())
})
```

---

### Error Handling

**Try/Catch Pattern:**
```typescript
async function handleTransaction() {
  try {
    const tx = await contract.method()
    await tx.wait()
    showToast({ type: 'success', message: 'Success!' })
  } catch (error) {
    console.error(error)
    showToast({ type: 'error', message: error.message })
  }
}
```

**Error Boundary:**
```tsx
// app/error.tsx
'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

---

### Loading States

**Suspense (Server Components):**
```tsx
import { Suspense } from 'react'

<Suspense fallback={<LoadingSpinner />}>
  <PoolsTable />
</Suspense>
```

**Conditional Rendering (Client Components):**
```tsx
if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <DataDisplay data={data} />
```

---

## Styling System

### Tailwind CSS

All components use Tailwind utility classes.

**Example:**
```tsx
<div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
  <h2 className="text-2xl font-bold mb-4">Pool Details</h2>
  <p className="text-gray-300">TVL: $100M</p>
</div>
```

### Design Tokens

**Colors:**
- Background: `bg-gray-900`
- Cards: `bg-white/10 backdrop-blur-md`
- Borders: `border-white/20`
- Text: `text-white`, `text-gray-300`

**Spacing:**
- Padding: `p-4`, `p-6`, `p-8`
- Margins: `mt-4`, `mb-6`, `gap-4`

**Typography:**
- Headers: `text-2xl font-bold`
- Body: `text-base`
- Small: `text-sm text-gray-400`

---

## Component Testing

### Unit Tests

**Pattern:**
```typescript
import { render, screen } from '@testing-library/react'
import PoolsTable from './PoolsTable'

describe('PoolsTable', () => {
  it('renders pool data', () => {
    render(<PoolsTable />)
    expect(screen.getByText('USDC/WETH')).toBeInTheDocument()
  })
})
```

**Tested Components:**
- ✅ PoolsTable (`PoolsTable.test.tsx`)
- ⚠️ Others (partial coverage)

---

## Component Checklist

### Before Creating a Component

- [ ] Is it reusable or page-specific?
- [ ] Does it need client-side state?
- [ ] What props does it accept?
- [ ] What data does it need?
- [ ] Does it make API calls?
- [ ] Does it interact with wallet?
- [ ] What error states exist?
- [ ] What loading states exist?

### Component Template

```tsx
'use client'  // If uses hooks

import { useState } from 'react'
import { useToast } from './ToastProvider'

interface ComponentNameProps {
  required: string
  optional?: number
}

export default function ComponentName({ required, optional = 10 }: ComponentNameProps) {
  const [state, setState] = useState<string>('')
  const { showToast } = useToast()

  const handleAction = async () => {
    try {
      // Logic here
      showToast({ type: 'success', message: 'Success!' })
    } catch (error) {
      console.error(error)
      showToast({ type: 'error', message: error.message })
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">{required}</h2>
      <button onClick={handleAction}>Action</button>
    </div>
  )
}
```

---

## Future Component Needs

### v0.2 - Transaction Support
- `IncreaseLiquidityForm` - Add liquidity to position
- `BurnPositionButton` - Close position
- `BatchCollectButton` - Collect from multiple positions

### v0.3 - Multi-Chain
- `ChainSwitcher` - Network selector
- `CrossChainPositionList` - Aggregate positions

### v0.4 - Advanced Analytics
- `ILCalculator` - Impermanent loss calculator
- `RangeEfficiencyScore` - Visual efficiency indicator
- `VolumeHeatmap` - Trading volume visualization

### v0.5 - Automation
- `AlertsPanel` - Notification management
- `AutoCollectToggle` - Enable/disable auto-collect
- `RangeAdjustmentSuggestion` - AI-powered suggestions

---

## Performance Optimization

### Code Splitting

**Dynamic Imports:**
```tsx
import dynamic from 'next/dynamic'

const MintPosition = dynamic(() => import('./MintPosition'), {
  loading: () => <LoadingSpinner />
})
```

### Memoization

**React.memo:**
```tsx
import { memo } from 'react'

const ExpensiveComponent = memo(function ExpensiveComponent({ data }: Props) {
  // Complex rendering logic
  return <div>{/* ... */}</div>
})
```

**useMemo:**
```tsx
const sortedPools = useMemo(() => {
  return pools.sort((a, b) => b.tvlUSD - a.tvlUSD)
}, [pools])
```

---

## Accessibility

### ARIA Labels

```tsx
<button aria-label="Connect wallet" onClick={connect}>
  <WalletIcon />
</button>
```

### Keyboard Navigation

All interactive elements support keyboard:
- Tab to focus
- Enter/Space to activate
- Escape to close modals

### Focus Management

```tsx
const buttonRef = useRef<HTMLButtonElement>(null)

useEffect(() => {
  if (isOpen) {
    buttonRef.current?.focus()
  }
}, [isOpen])
```

---

## Component Documentation Standards

When adding new components:

1. **File Header:**
```tsx
/**
 * ComponentName
 *
 * Description of what the component does.
 *
 * @example
 * <ComponentName prop="value" />
 */
```

2. **Props Interface:**
```typescript
/**
 * Props for ComponentName
 */
interface ComponentNameProps {
  /** Description of prop */
  required: string
  /** Optional description */
  optional?: number
}
```

3. **Update this doc** - Add section for new component
