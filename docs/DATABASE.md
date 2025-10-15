# PoolParty Database Schema

## Overview

PoolParty uses Supabase (PostgreSQL) to store pool analytics data ingested from Uniswap V3 subgraphs.

## Entity Relationship Diagram

```
┌─────────────────┐
│     tokens      │
│─────────────────│
│ id (PK)         │──┐
│ chain           │  │
│ address         │  │
│ symbol          │  │
│ name            │  │
│ decimals        │  │
└─────────────────┘  │
                     │
          ┌──────────┴────────────┐
          │                       │
    ┌─────▼──────────┐     ┌──────▼─────────┐
    │     pools      │     │     pools      │
    │────────────────│     │────────────────│
    │ id (PK)        │◄────│ id (PK)        │
    │ chain          │     │ token0_id (FK) │
    │ token0_id (FK) │     │ token1_id (FK) │
    │ token1_id (FK) │     └────────────────┘
    │ fee_tier       │
    │ tvl_usd        │
    │ volume_usd_24h │
    │ updated_at     │
    └────────┬───────┘
             │
             │
    ┌────────▼────────────┐
    │  pool_snapshots     │
    │─────────────────────│
    │ pool_id (PK, FK)    │
    │ ts (PK)             │
    │ tvl_usd             │
    │ volume_usd_24h      │
    │ fee_apr_annual      │
    └─────────────────────┘
```

## Tables

### `tokens`

Stores ERC-20 token metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Token contract address (checksummed) |
| `chain` | text | NOT NULL | Chain identifier (`ethereum`, `arbitrum`) |
| `address` | text | NOT NULL | Same as id, for clarity |
| `symbol` | text | NOT NULL | Token symbol (e.g., `USDC`) |
| `name` | text | NOT NULL | Token name (e.g., `USD Coin`) |
| `decimals` | int | NOT NULL | Token decimals (e.g., `6`) |

**Indexes:**
```sql
CREATE INDEX idx_tokens_chain ON tokens(chain);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);
```

**Example Row:**
```sql
INSERT INTO tokens VALUES (
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  'ethereum',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  'USDC',
  'USD Coin',
  6
);
```

---

### `pools`

Stores Uniswap V3 pool current state.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | text | PRIMARY KEY | Pool contract address |
| `chain` | text | NOT NULL | Chain identifier |
| `token0_id` | text | FOREIGN KEY → tokens(id) | First token address |
| `token1_id` | text | FOREIGN KEY → tokens(id) | Second token address |
| `fee_tier` | numeric | NOT NULL | Fee tier (e.g., `0.0005` for 0.05%) |
| `tvl_usd` | numeric | | Total value locked in USD |
| `volume_usd_24h` | numeric | | 24h trading volume in USD |
| `updated_at` | timestamptz | DEFAULT now() | Last update timestamp |

**Indexes:**
```sql
CREATE INDEX idx_pools_chain ON pools(chain);
CREATE INDEX idx_pools_tvl ON pools(tvl_usd DESC);
CREATE INDEX idx_pools_volume ON pools(volume_usd_24h DESC);
CREATE INDEX idx_pools_token0 ON pools(token0_id);
CREATE INDEX idx_pools_token1 ON pools(token1_id);
```

**Example Row:**
```sql
INSERT INTO pools VALUES (
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
  'ethereum',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  0.0005,
  125000000.50,
  45000000.75,
  '2025-01-15 10:30:00+00'
);
```

---

### `pool_snapshots`

Stores historical pool metrics for time-series analysis.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `pool_id` | text | PRIMARY KEY, FOREIGN KEY → pools(id) | Pool address |
| `ts` | timestamptz | PRIMARY KEY | Snapshot timestamp |
| `tvl_usd` | numeric | | TVL at this timestamp |
| `volume_usd_24h` | numeric | | 24h volume at this timestamp |
| `fee_apr_annual` | numeric | | Annualized fee APR (decimal) |

**Composite Primary Key:** `(pool_id, ts)`

**Indexes:**
```sql
CREATE INDEX idx_snapshots_pool_ts ON pool_snapshots(pool_id, ts DESC);
CREATE INDEX idx_snapshots_ts ON pool_snapshots(ts DESC);
```

**Example Row:**
```sql
INSERT INTO pool_snapshots VALUES (
  '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
  '2025-01-15 10:00:00+00',
  125000000.50,
  45000000.75,
  0.0265
);
```

---

## Schema DDL

Full schema available in `supabase/0001_init.sql`:

```sql
create table if not exists tokens (
  id text primary key,
  chain text,
  address text,
  symbol text,
  name text,
  decimals int
);

create table if not exists pools (
  id text primary key,
  chain text,
  token0_id text references tokens(id),
  token1_id text references tokens(id),
  fee_tier numeric,
  tvl_usd numeric,
  volume_usd_24h numeric,
  updated_at timestamptz default now()
);

create table if not exists pool_snapshots (
  pool_id text references pools(id),
  ts timestamptz,
  tvl_usd numeric,
  volume_usd_24h numeric,
  fee_apr_annual numeric,
  primary key (pool_id, ts)
);
```

---

## Query Patterns

### Top Pools by TVL
```sql
SELECT p.*, t0.symbol as token0_symbol, t1.symbol as token1_symbol
FROM pools p
JOIN tokens t0 ON p.token0_id = t0.id
JOIN tokens t1 ON p.token1_id = t1.id
WHERE p.chain = 'ethereum'
ORDER BY p.tvl_usd DESC
LIMIT 50;
```

### Pool Metrics (7 days)
```sql
SELECT ts, tvl_usd, volume_usd_24h, fee_apr_annual
FROM pool_snapshots
WHERE pool_id = $1
  AND ts >= NOW() - INTERVAL '7 days'
ORDER BY ts ASC;
```

### Latest Snapshot per Pool
```sql
SELECT DISTINCT ON (pool_id) *
FROM pool_snapshots
ORDER BY pool_id, ts DESC;
```

---

## Data Retention

- **pools**: Keep indefinitely (current state)
- **tokens**: Keep indefinitely (metadata)
- **pool_snapshots**: Keep 90 days (configurable)

**Cleanup Query:**
```sql
DELETE FROM pool_snapshots
WHERE ts < NOW() - INTERVAL '90 days';
```

---

## Migrations

1. **0001_init.sql**: Initial schema (tokens, pools, pool_snapshots)
2. Future migrations: Use Supabase migrations or numbered SQL files

---

## Row Level Security (RLS)

Currently disabled. Future enhancement for user-specific data:

```sql
ALTER TABLE pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON pools
  FOR SELECT USING (true);
```

---

## Performance Considerations

1. **Indexes**: Added on frequently queried columns
2. **Partitioning**: Consider partitioning `pool_snapshots` by timestamp
3. **Materialized Views**: For complex aggregations
4. **Connection Pooling**: Use Supabase Pooler in production

---

## Backup Strategy

- **Supabase Auto-Backups**: Daily backups retained for 7 days (free tier)
- **Manual Exports**: Use `pg_dump` for critical data
- **Point-in-Time Recovery**: Available on Pro tier

---

## Future Schema Enhancements

1. **user_positions**: Track user LP positions
2. **alerts**: Store user alert rules
3. **transactions**: Log wallet transactions
4. **portfolio_snapshots**: Historical portfolio values
