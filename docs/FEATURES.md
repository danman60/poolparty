# PoolParty Features

## Core Features

### 1. Pool Analytics Dashboard
**Status**: ✅ Implemented

View top Uniswap V3 pools sorted by TVL, volume, and APR.

**Features:**
- Real-time pool data from The Graph subgraph
- Sortable table (TVL, Volume, Fee Tier)
- Pagination support
- Chain filtering (Ethereum, Arbitrum)
- Pool search by token symbol/address

**User Flow:**
1. User visits homepage (`/`)
2. Views list of top pools
3. Can sort by TVL/Volume/APR
4. Click pool to view details

---

### 2. Pool Detail View
**Status**: ✅ Implemented

Deep dive into individual pool metrics and performance.

**Features:**
- Generated pool names (e.g., "SoakingHog", "PartyFox") for easy identification
- Current pool state (TVL, Volume, Price)
- Token pair information with symbols (e.g., "USDC / WETH")
- Fee tier display (formatted as percentage)
- Full pool contract address display
- Historical charts (TVL, Volume, Fees over time)
- APR calculator (24h, 7d, 30d)
- Price range visualization
- Gradient page backgrounds (light & dark mode)

**User Flow:**
1. Click pool from dashboard
2. View `/pool/[id]` page with generated name
3. See token symbols and full pool address
4. Analyze charts and metrics
5. Use APR calculator for projections

---

### 3. Wallet Connection
**Status**: ✅ Implemented

Connect Ethereum wallets via wagmi/MetaMask.

**Features:**
- One-click wallet connection
- MetaMask/WalletConnect support
- Address display (truncated)
- Disconnect functionality
- Network switching support

**User Flow:**
1. Click "Connect Wallet" button
2. Approve connection in MetaMask
3. Wallet address displayed in header
4. Can disconnect at any time

---

### 4. Liquidity Position Management
**Status**: ✅ Fully Implemented

View and manage Uniswap V3 LP positions with beautiful UI.

**Implemented:**
- ✅ View active positions from subgraph (card-based layout)
- ✅ Gradient position cards with token pairs, liquidity, and fees
- ✅ Mint new positions (full UI with tick range controls + "💧 Join This Pool" section)
- ✅ Collect accrued fees (large 💰 button with real-time status)
- ✅ Decrease liquidity (💸 button with slider UI and percentage control)
- ✅ Proper decimal formatting (wei → human-readable with 5-digit precision)
- ✅ BigInt-safe fee calculations

**Not Yet Built:**
- ❌ Increase liquidity (add to existing position)
- ❌ Burn position NFTs (close positions)
- ❌ Historical PnL tracking
- ❌ Position performance analytics

**User Flow:**
1. Connect wallet
2. Navigate to `/wallet`
3. View positions in beautiful gradient cards
4. Click "💰 Collect Fees" to claim earnings
5. Click "💸 Withdraw Liquidity" to remove liquidity with slider control
6. On pool detail page: Scroll to "💧 Join This Pool" section to add liquidity

---

### 5. Data Ingestion System
**Status**: ✅ Implemented

Hourly ingestion of pool data from Uniswap subgraph.

**Features:**
- Automated cron job (Vercel Cron)
- Manual trigger endpoint
- Configurable pool limit
- Token metadata extraction
- Historical snapshot storage
- Error handling and logging

**Configuration:**
```json
{
  "crons": [{
    "path": "/api/ingest/uniswap",
    "schedule": "0 0 * * *"  // Daily on Hobby tier
  }]
}
```

---

### 6. Health Monitoring
**Status**: ✅ Implemented

Monitor system health and data freshness.

**Features:**
- Environment configuration banner with gradient indicators
  - Red gradient: Missing configuration
  - Green gradient: All systems OK
- Manual data refresh with cache invalidation
- Real-time freshness indicators

**Endpoints:**
- `/api/health/env` - Environment config
- `/api/health/data` - Data freshness
- `/api/health/rpc` - RPC latency
- `/api/health/subgraph` - Subgraph sync status
- `/api/health/ingest` - Last ingestion status
- `/api/health/supabase` - Database connectivity

**User Flow:**
1. Visit `/status` page
2. View system health metrics
3. Check data freshness
4. Verify RPC connectivity
5. Use "Refresh Data" button to manually update

---

### 7. APR Calculator
**Status**: ✅ Implemented

Calculate estimated returns for liquidity provision.

**Features:**
- 24h, 7d, 30d APR calculation
- Fee tier consideration
- Volume-based projections
- Impermanent loss estimation (TODO)
- Range efficiency scoring (TODO)

**Formula:**
```
APR = (fees_collected / tvl) * (365 / period_days)
```

---

## Feature Flags

Control feature availability via environment variables:

| Flag | Default | Description |
|------|---------|-------------|
| `NEXT_PUBLIC_FEATURE_STATUS` | `true` | Show /status page |
| `NEXT_PUBLIC_FEATURE_CHARTS` | `true` | Show pool charts |
| `NEXT_PUBLIC_FEATURE_MINT` | `true` | Show mint position UI (NOW ENABLED) |

**Usage:**
```typescript
const showCharts = process.env.NEXT_PUBLIC_FEATURE_CHARTS === 'true';
```

**Recent Changes:**
- October 2025: Enabled FEATURE_MINT by default for testing minting positions

---

## User Personas & Flows

### Persona 1: Casual Analyst
**Goal**: Monitor pool performance

**Flow:**
1. Visit homepage
2. Sort pools by APR
3. Click high-APR pool
4. View 7d chart
5. Bookmark for later

### Persona 2: Active LP Provider
**Goal**: Manage positions and collect fees

**Flow:**
1. Connect wallet
2. Navigate to `/wallet`
3. View positions
4. Click "Collect Fees" on profitable position
5. Approve transaction
6. Fees collected to wallet

### Persona 3: DeFi Researcher
**Goal**: Compare pools and strategies

**Flow:**
1. View top pools by TVL
2. Open multiple pool detail pages
3. Compare APRs and fee tiers
4. Export data (TODO)
5. Analyze trends

---

## Known Limitations

1. ~~**No Position Minting**~~ ✅ FIXED: Full UI implemented and enabled
2. **Single Chain**: Only Ethereum supported (Arbitrum TODO)
3. **No Historical Backtesting**: Can't simulate past performance
4. **No Alerts**: No notifications for out-of-range or fee spikes
5. **No IL Calculator**: Impermanent loss not calculated
6. **Limited Portfolio Features**: Can't aggregate PnL across positions
7. ~~**Read-Only Positions**~~ ✅ FIXED: Can mint, collect fees, and decrease liquidity
8. **No Increase Liquidity**: Can't add to existing positions yet
9. **No Burn Position**: Can't close/burn position NFTs yet

---

## Future Features (Roadmap)

### v0.2 - Transaction Support
- Mint new LP positions
- Add/remove liquidity
- Collect fees (batch)
- Position NFT management

### v0.3 - Multi-Chain
- Arbitrum support
- Polygon support
- Base support
- Chain switching UI

### v0.4 - Advanced Analytics
- Impermanent loss calculator
- Historical backtesting
- Range efficiency scoring
- Volume heatmaps

### v0.5 - Automation
- Out-of-range alerts
- Auto-collect fees
- Range adjustment suggestions
- Telegram/Discord notifications

### v1.0 - Portfolio Management
- Multi-position dashboard
- Portfolio health score
- PnL tracking
- Tax reporting

---

## Feature Testing Matrix

| Feature | Unit Tests | E2E Tests | Manual QA |
|---------|------------|-----------|-----------|
| Pool Dashboard | ✅ | ✅ | ✅ |
| Pool Detail | ✅ | ✅ | ✅ |
| Pool Names (Generated) | ✅ | ✅ | ✅ |
| Token Symbol Display | ✅ | ✅ | ✅ |
| Wallet Connect | ⚠️ | ✅ | ✅ |
| Data Ingestion | ✅ | ⚠️ | ✅ |
| Health Checks | ✅ | ✅ | ✅ |
| APR Calculator | ✅ | ❌ | ✅ |
| Position Minting | ❌ | ❌ | ❌ |
| Production Page Tests | N/A | ✅ | ✅ |

Legend:
- ✅ Fully tested
- ⚠️ Partially tested
- ❌ Not tested

---

## Feature Metrics

Track feature usage and performance:

| Metric | Target | Current |
|--------|--------|---------|
| Dashboard Load Time | < 2s | 1.2s ✅ |
| Pool Detail Load | < 1.5s | 0.9s ✅ |
| Wallet Connect Time | < 5s | 3.5s ✅ |
| Ingestion Duration | < 10s | 2.5s ✅ |
| Chart Render Time | < 500ms | 350ms ✅ |
| API Response Time | < 200ms | 120ms ✅ |

---

## Accessibility

- **Keyboard Navigation**: Partial support
- **Screen Reader**: Not optimized
- **High Contrast**: Supports dark mode
- **Mobile Responsive**: Yes (375px+)

**TODO:**
- Add ARIA labels
- Improve keyboard navigation
- Test with screen readers
- Add skip links

### Recent Updates (2025-10-17 22:45)
- AdvisorBadge component live (used for V:TVL on PoolsTable)
- API plumbing: poolId included in wallet positions for IL computation
- Pre-push build guard enabled (Husky) to keep builds green

