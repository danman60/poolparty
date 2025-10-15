# PoolParty API Documentation

## Overview

PoolParty exposes a REST API for pool analytics, health checks, and data ingestion. All routes are implemented as Next.js API Route Handlers in the App Router.

## Base URL

- **Local**: `http://localhost:3000`
- **Production**: `https://poolparty.vercel.app` (or custom domain)

## Authentication

- **Public Routes**: No auth required for read operations
- **Ingestion Routes**: Require `INGEST_SECRET` via header or query param

## API Routes

---

### Pools

#### `GET /api/pools`

List all pools with pagination and filtering.

**Query Parameters:**
- `limit` (number, optional): Max results (default: 50, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)
- `chain` (string, optional): Filter by chain (`ethereum`, `arbitrum`)
- `min_tvl` (number, optional): Minimum TVL in USD

**Response:**
```json
{
  "pools": [
    {
      "id": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      "chain": "ethereum",
      "token0": {
        "id": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        "symbol": "USDC",
        "name": "USD Coin",
        "decimals": 6,
        "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
      },
      "token1": {
        "id": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        "symbol": "WETH",
        "name": "Wrapped Ether",
        "decimals": 18,
        "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      },
      "fee_tier": 0.0005,
      "tvl_usd": 125000000.50,
      "volume_usd_24h": 45000000.75,
      "updated_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Example:**
```bash
curl https://poolparty.vercel.app/api/pools?limit=10&min_tvl=1000000
```

---

#### `GET /api/pools/[id]`

Get detailed information about a specific pool.

**Path Parameters:**
- `id` (string, required): Pool address

**Response:**
```json
{
  "pool": {
    "id": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
    "chain": "ethereum",
    "token0": { /* token details */ },
    "token1": { /* token details */ },
    "fee_tier": 0.0005,
    "tvl_usd": 125000000.50,
    "volume_usd_24h": 45000000.75,
    "fee_apr_24h": 0.0285,
    "fee_apr_7d": 0.0265,
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

**Error Responses:**
- `404`: Pool not found
- `500`: Server error

**Example:**
```bash
curl https://poolparty.vercel.app/api/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640
```

---

#### `GET /api/pools/[id]/metrics`

Get historical metrics for a pool.

**Path Parameters:**
- `id` (string, required): Pool address

**Query Parameters:**
- `period` (string, optional): Time period (`24h`, `7d`, `30d`, default: `7d`)
- `interval` (string, optional): Data interval (`1h`, `1d`, default: `1h`)

**Response:**
```json
{
  "pool_id": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
  "period": "7d",
  "interval": "1h",
  "metrics": [
    {
      "ts": "2025-01-15T10:00:00Z",
      "tvl_usd": 125000000.50,
      "volume_usd_24h": 45000000.75,
      "fee_apr_annual": 0.0265
    },
    {
      "ts": "2025-01-15T11:00:00Z",
      "tvl_usd": 125500000.25,
      "volume_usd_24h": 46000000.50,
      "fee_apr_annual": 0.0268
    }
  ]
}
```

**Example:**
```bash
curl https://poolparty.vercel.app/api/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640/metrics?period=24h
```

---

### Ingestion

#### `GET /api/ingest/uniswap`

Trigger manual ingestion of Uniswap V3 pool data from The Graph subgraph.

**Authentication:**
- Header: `Authorization: Bearer <INGEST_SECRET>`
- OR Query param: `?token=<INGEST_SECRET>`

**Query Parameters:**
- `limit` (number, optional): Max pools to ingest (default: 50, max: 100)
- `chain` (string, optional): Chain to ingest (`ethereum`, `arbitrum`, default: `ethereum`)

**Response:**
```json
{
  "success": true,
  "pools_ingested": 50,
  "tokens_upserted": 100,
  "snapshots_created": 50,
  "duration_ms": 2500,
  "timestamp": "2025-01-15T10:30:00Z",
  "dryRun": false
}
```

**Dry Run Response (no Supabase env):**
```json
{
  "dryRun": true,
  "pools_fetched": 50,
  "message": "Supabase not configured. Dry run mode."
}
```

**Error Responses:**
- `401`: Invalid or missing INGEST_SECRET
- `500`: Ingestion failed

**Example:**
```bash
curl -H "Authorization: Bearer your-secret" \
  https://poolparty.vercel.app/api/ingest/uniswap?limit=100
```

**Cron Configuration:**
Automatically triggered by Vercel Cron (see `vercel.json`):
```json
{
  "crons": [{
    "path": "/api/ingest/uniswap",
    "schedule": "0 0 * * *"
  }]
}
```

---

### Health Checks

#### `GET /api/health/env`

Check environment variable configuration.

**Response:**
```json
{
  "status": "ok",
  "env": {
    "supabase": {
      "url": "configured",
      "anon_key": "configured",
      "service_role": "configured"
    },
    "rpc": {
      "mainnet": "https://ethereum.publicnode.com",
      "sepolia": "https://ethereum-sepolia.publicnode.com"
    },
    "features": {
      "status": true,
      "charts": true,
      "mint": false
    },
    "commit_sha": "62de858",
    "build_time": "2025-01-15T10:00:00Z"
  }
}
```

---

#### `GET /api/health/data`

Check data freshness in Supabase.

**Response:**
```json
{
  "status": "ok",
  "pools_count": 150,
  "tokens_count": 300,
  "latest_snapshot": "2025-01-15T10:00:00Z",
  "freshness_minutes": 15,
  "warning": null
}
```

**Warning States:**
- `freshness_minutes > 120`: Data may be stale
- `pools_count === 0`: No data ingested

---

#### `GET /api/health/rpc`

Check RPC endpoint latency.

**Response:**
```json
{
  "status": "ok",
  "mainnet": {
    "endpoint": "https://ethereum.publicnode.com",
    "latency_ms": 450,
    "block_number": 18500000
  },
  "sepolia": {
    "endpoint": "https://ethereum-sepolia.publicnode.com",
    "latency_ms": 320,
    "block_number": 4500000
  }
}
```

---

#### `GET /api/health/subgraph`

Check Uniswap subgraph recency.

**Response:**
```json
{
  "status": "ok",
  "endpoint": "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  "latest_block": 18500000,
  "block_timestamp": "2025-01-15T10:25:00Z",
  "delay_minutes": 5,
  "synced": true
}
```

---

#### `GET /api/health/ingest`

Check last ingestion status.

**Response:**
```json
{
  "status": "ok",
  "last_run": "2025-01-15T09:00:00Z",
  "next_run": "2025-01-15T10:00:00Z",
  "duration_ms": 2500,
  "pools_ingested": 50,
  "success": true
}
```

---

#### `GET /api/health/supabase`

Check Supabase database connectivity.

**Response:**
```json
{
  "status": "ok",
  "connected": true,
  "query_time_ms": 25,
  "tables": ["tokens", "pools", "pool_snapshots"]
}
```

---

## Error Response Format

All API routes follow a consistent error format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    /* Additional error context */
  }
}
```

**Common Error Codes:**
- `INVALID_PARAMS`: Invalid query/path parameters
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Missing or invalid authentication
- `RATE_LIMIT`: Too many requests
- `SERVER_ERROR`: Internal server error

**HTTP Status Codes:**
- `200`: Success
- `400`: Bad request
- `401`: Unauthorized
- `404`: Not found
- `429`: Rate limited
- `500`: Server error

---

## Rate Limiting

- **Public Routes**: No explicit rate limiting (Vercel default limits apply)
- **Ingestion Routes**: Manual trigger only (cron bypasses limits)

**Vercel Limits (Hobby Tier):**
- 100 GB bandwidth/month
- 100 serverless function executions/hour

---

## CORS Configuration

- **Allowed Origins**: All origins (`*`)
- **Allowed Methods**: `GET`, `POST`, `OPTIONS`
- **Allowed Headers**: `Content-Type`, `Authorization`

---

## Caching Strategy

### Response Headers

```http
Cache-Control: public, s-maxage=60, stale-while-revalidate=300
```

**Breakdown:**
- `s-maxage=60`: CDN cache for 60 seconds
- `stale-while-revalidate=300`: Serve stale for 5 minutes while revalidating

**Per-Route Caching:**
- `/api/pools`: 60s cache, 5m stale
- `/api/pools/[id]`: 60s cache, 5m stale
- `/api/pools/[id]/metrics`: 300s cache, 10m stale
- `/api/health/*`: No cache (always fresh)
- `/api/ingest/*`: No cache

---

## Data Models

### Pool Object

```typescript
interface Pool {
  id: string;              // Pool contract address
  chain: string;           // ethereum | arbitrum
  token0: Token;
  token1: Token;
  fee_tier: number;        // e.g., 0.0005 for 0.05%
  tvl_usd: number;
  volume_usd_24h: number;
  updated_at: string;      // ISO 8601 timestamp
}
```

### Token Object

```typescript
interface Token {
  id: string;              // Token contract address
  chain: string;
  address: string;         // Same as id
  symbol: string;          // e.g., "USDC"
  name: string;            // e.g., "USD Coin"
  decimals: number;        // e.g., 6
}
```

### Snapshot Object

```typescript
interface PoolSnapshot {
  pool_id: string;
  ts: string;              // ISO 8601 timestamp
  tvl_usd: number;
  volume_usd_24h: number;
  fee_apr_annual: number;  // Annualized fee APR (decimal)
}
```

---

## Client Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch all pools
const response = await fetch('https://poolparty.vercel.app/api/pools');
const data = await response.json();

// Fetch pool details
const poolId = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';
const pool = await fetch(`https://poolparty.vercel.app/api/pools/${poolId}`);

// Fetch metrics
const metrics = await fetch(
  `https://poolparty.vercel.app/api/pools/${poolId}/metrics?period=7d`
);
```

### cURL

```bash
# List pools
curl https://poolparty.vercel.app/api/pools

# Get pool
curl https://poolparty.vercel.app/api/pools/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640

# Trigger ingestion (requires auth)
curl -H "Authorization: Bearer your-secret" \
  https://poolparty.vercel.app/api/ingest/uniswap
```

---

## API Versioning

Currently no explicit versioning. Breaking changes will be communicated via:
1. GitHub releases
2. Migration guides
3. Deprecation warnings in responses

Future: `/api/v2/` namespace for major version changes

---

## Future API Enhancements

1. **GraphQL Endpoint**: `/api/graphql` for flexible queries
2. **WebSocket**: Real-time pool updates
3. **Batch Operations**: `/api/pools/batch` for multiple IDs
4. **Historical Analysis**: `/api/pools/[id]/backtest`
5. **User Positions**: `/api/positions?wallet=0x...`
6. **Portfolio API**: `/api/portfolio/summary?wallet=0x...`
7. **Alerts API**: `/api/alerts` for out-of-range notifications
