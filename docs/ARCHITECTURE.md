# PoolParty Architecture

## Overview

PoolParty is a Metrix-style DeFi analytics platform with integrated wallet functionality for Uniswap v3 liquidity provision. Built on Next.js 14 with Supabase backend and deployed on Vercel.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Dashboard   │  │  Pool Detail │  │  Wallet Interface  │   │
│  │     (/)      │  │ (/pool/[id]) │  │     (/wallet)      │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│         │                  │                    │                │
│         └──────────────────┴────────────────────┘                │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
       ┌────────▼────────┐      ┌────────▼─────────┐
       │   API Routes    │      │  Wallet Provider  │
       │   (/api/*)      │      │   (wagmi/viem)    │
       └────────┬────────┘      └────────┬──────────┘
                │                        │
       ┌────────▼────────┐      ┌────────▼──────────┐
       │   Supabase DB   │      │  Blockchain RPC   │
       │  (PostgreSQL)   │      │ (Ethereum/Arb)    │
       └────────┬────────┘      └────────┬──────────┘
                │                        │
       ┌────────▼────────┐      ┌────────▼──────────┐
       │  Cron Ingest    │      │  Uniswap V3       │
       │   (Hourly)      │◄─────┤  Subgraph         │
       └─────────────────┘      └───────────────────┘
```

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components (glassmorphic design)
- **Charts**: Recharts v3
- **Animation**: Framer Motion (optional)
- **Icons**: lucide-react

### Blockchain Integration
- **Wallet Connection**: wagmi v2.18.1, viem v2.38.2
- **Web3 Library**: ethers (for contract interactions)
- **Uniswap SDK**: @uniswap/v3-sdk, @uniswap/sdk-core
- **Contract ABIs**: @uniswap/v3-core, @uniswap/v3-periphery

### Backend/Data
- **Database**: Supabase (PostgreSQL)
- **API**: Next.js API Routes (App Router)
- **Data Source**: Uniswap V3 Subgraph (The Graph)
- **RPC Provider**: Public Node (configurable to Alchemy/Infura)
- **Caching**: Next.js built-in caching (optional Upstash Redis)

### Deployment
- **Platform**: Vercel
- **CI/CD**: GitHub Actions (predeploy.yml)
- **Cron Jobs**: Vercel Cron (hourly ingestion)
- **Monitoring**: Optional Vercel Analytics, Sentry

## Data Flow

### Analytics Pipeline

```
Uniswap V3 Subgraph
        │
        │ (GraphQL Query)
        ▼
/api/ingest/uniswap
        │
        │ (Hourly Cron)
        ▼
    Supabase DB
  (tokens, pools,
  pool_snapshots)
        │
        │ (SQL Queries)
        ▼
   API Routes
 (/api/pools/*)
        │
        │ (JSON Response)
        ▼
  Frontend Pages
(Dashboard, Pool Detail)
```

### Wallet Transaction Flow

```
User Wallet (MetaMask)
        │
        │ (Connect via wagmi)
        ▼
  Frontend Components
    (WalletButton)
        │
        │ (Sign Transactions)
        ▼
Contract Interactions
 (Position Manager)
        │
        │ (On-chain Execution)
        ▼
Ethereum/Arbitrum Network
        │
        │ (Transaction Receipt)
        ▼
     Frontend
  (Confirmation UI)
```

## Key Design Decisions

### 1. App Router over Pages Router
**Rationale**: Next.js 14 App Router provides better performance, RSC support, and modern routing patterns.

### 2. Supabase over Self-Hosted PostgreSQL
**Rationale**: Managed service reduces operational overhead, provides built-in authentication, and scales automatically.

### 3. Subgraph over Direct RPC
**Rationale**: The Graph subgraphs provide indexed, queryable data that's faster and more cost-effective than direct RPC calls for analytics.

### 4. wagmi over web3.js
**Rationale**: wagmi provides React hooks, better TypeScript support, and modern wallet connection patterns.

### 5. Vercel Cron over External Scheduler
**Rationale**: Native Vercel Cron integration simplifies deployment and reduces external dependencies.

### 6. Client-Side Wallet over Server-Side
**Rationale**: Never store private keys server-side. All wallet operations happen client-side with user signatures.

## Component Architecture

### Frontend Layers

```
┌─────────────────────────────────────┐
│         Pages (Route Handlers)       │
│    page.tsx, layout.tsx, error.tsx  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Feature Components              │
│  PoolsTable, PoolChart, WalletCard  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Base Components                │
│   Buttons, Cards, Badges, Modals    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Utilities                   │
│  Hooks, Helpers, Constants, Types   │
└─────────────────────────────────────┘
```

### State Management

- **Global State**: React Context (wagmi provides wallet state)
- **Server State**: TanStack Query (@tanstack/react-query) for API data
- **Form State**: React Hook Form (if needed)
- **URL State**: Next.js routing (search params, path params)

## API Architecture

### Route Structure

```
/api
├── health/                 # Health checks
│   ├── data/route.ts      # Data freshness
│   ├── env/route.ts       # Environment config
│   ├── ingest/route.ts    # Ingestion status
│   ├── rpc/route.ts       # RPC latency
│   ├── subgraph/route.ts  # Subgraph recency
│   └── supabase/route.ts  # Database connectivity
├── ingest/
│   └── uniswap/route.ts   # Hourly data ingestion
└── pools/
    ├── route.ts           # List pools
    ├── [id]/route.ts      # Pool details
    └── [id]/metrics/route.ts  # Pool metrics
```

### Data Fetching Strategy

- **Static Generation**: None (data too dynamic)
- **Server-Side Rendering**: Pool detail pages
- **Client-Side Fetching**: Dashboard table (real-time updates)
- **Revalidation**: On-demand with Next.js revalidation

## Security Architecture

### Principles

1. **Never Store Private Keys**: All wallet operations client-side
2. **Service Role Protection**: Supabase service key only in API routes
3. **Ingestion Auth**: INGEST_SECRET protects cron endpoint
4. **RLS Policies**: Supabase Row Level Security (if needed)
5. **Input Validation**: Sanitize all user inputs
6. **HTTPS Only**: Enforce secure connections

### Environment Variable Hierarchy

```
Public (NEXT_PUBLIC_*)    → Exposed to client
├─ NEXT_PUBLIC_SUPABASE_URL
├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
├─ NEXT_PUBLIC_RPC_MAINNET
└─ NEXT_PUBLIC_RPC_SEPOLIA

Server-Only               → API routes only
├─ SUPABASE_SERVICE_ROLE
└─ INGEST_SECRET
```

## Performance Optimizations

### 1. Caching Strategy
- **API Routes**: Cache-Control headers (stale-while-revalidate)
- **Static Assets**: Vercel CDN with aggressive caching
- **Database Queries**: Indexed columns on pool_id, ts

### 2. Bundle Optimization
- **Code Splitting**: Automatic with Next.js
- **Tree Shaking**: Remove unused code
- **Image Optimization**: Next.js Image component
- **Font Loading**: Next/font for optimal loading

### 3. Database Optimization
- **Indexes**: On frequently queried columns
- **Materialized Views**: For complex aggregations
- **Connection Pooling**: Supabase Pooler

## Scalability Considerations

### Current Limitations (Hobby Tier)
- **Cron Frequency**: Daily only (not hourly) on Hobby tier
- **Concurrent Builds**: Limited on free Vercel
- **Database Connections**: Supabase free tier limits

### Scaling Path
1. **Upgrade to Vercel Pro**: Hourly crons, more bandwidth
2. **Redis Caching**: Add Upstash for query caching
3. **Read Replicas**: Supabase read replicas for analytics
4. **CDN**: Cloudflare for additional caching layer
5. **Multi-Region**: Deploy to multiple Vercel regions

## Development Workflow

```
Local Development
     │
     │ (Feature Branch)
     ▼
GitHub Repository
     │
     │ (Push to main)
     ▼
GitHub Actions CI
 (Lint, Test, Build)
     │
     │ (Tests Pass)
     ▼
  Vercel Deploy
   (Automatic)
     │
     │ (Success)
     ▼
Production Live
```

## File Structure

```
D:\OpenAICodex\PoolParty\
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── pool/[id]/         # Pool detail pages
│   │   ├── wallet/            # Wallet page
│   │   ├── status/            # Status page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   └── lib/                   # Utilities
│       ├── supabase/          # Supabase clients
│       ├── ingest/            # Data ingestion
│       ├── abis/              # Contract ABIs
│       └── utils.ts           # Helper functions
├── supabase/
│   └── 0001_init.sql          # Database schema
├── tests/                     # Playwright tests
├── scripts/                   # QA scripts
├── docs/                      # Documentation
├── public/                    # Static assets
├── vercel.json                # Vercel config
├── next.config.ts             # Next.js config
└── package.json               # Dependencies
```

## Critical Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.5.5 | Framework |
| react | 19.1.0 | UI library |
| @supabase/supabase-js | ^2.75.0 | Database client |
| wagmi | ^2.18.1 | Wallet connection |
| viem | ^2.38.2 | Ethereum utilities |
| recharts | ^3.2.1 | Data visualization |
| @tanstack/react-query | ^5.90.3 | Data fetching |

## Contract Addresses (Ethereum Mainnet)

```typescript
Position Manager: 0xC36442b4a4522E871399CD717aBDD847Ab11FE88
Swap Router:      0xE592427A0AEce92De3Edee1F18E0157C05861564
Factory:          0x1F98431c8aD98523631AE4a59f267346ea31F984
```

## Configuration Files

- **next.config.ts**: Next.js configuration
- **vercel.json**: Deployment and cron configuration
- **tailwind.config.ts**: Tailwind CSS customization
- **tsconfig.json**: TypeScript compiler options
- **package.json**: Dependencies and scripts

## Future Architecture Enhancements

1. **GraphQL API**: Replace REST with GraphQL for flexible queries
2. **WebSocket**: Real-time pool updates
3. **Service Workers**: Offline support
4. **Edge Functions**: Move compute closer to users
5. **Multi-Chain**: Abstract chain logic for easy expansion
