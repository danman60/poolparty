Title: Create and Verify PoolParty Supabase Schema

You are a database automation tool. Your task is to create the Supabase schema for PoolParty, verify it, and report results. Follow these steps exactly.

Objectives
- Create three tables: `tokens`, `pools`, `pool_snapshots` (idempotent).
- Add basic indexes for common queries.
- Output a short verification report with row counts and table definitions.

Target: Supabase Postgres (SQL-compatible). If running locally, use the Supabase SQL editor or `supabase db execute`.

DDL (run idempotently)
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

Indexes (safe to create if not exists)
```sql
create index if not exists idx_pools_tvl on pools (tvl_usd desc);
create index if not exists idx_pools_updated on pools (updated_at desc);
create index if not exists idx_snapshots_pool_ts on pool_snapshots (pool_id, ts desc);
```

Verification Queries
```sql
-- 1) Confirm tables exist
select table_name from information_schema.tables where table_schema = 'public' and table_name in ('tokens','pools','pool_snapshots') order by table_name;

-- 2) Show columns for each table (name, type, nullable)
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name in ('tokens','pools','pool_snapshots')
order by table_name, ordinal_position;

-- 3) Row counts
select 'tokens' as tbl, count(*) from tokens
union all
select 'pools', count(*) from pools
union all
select 'pool_snapshots', count(*) from pool_snapshots;

-- 4) Index existence
select indexname, indexdef from pg_indexes where schemaname = 'public' and tablename in ('pools','pool_snapshots') order by tablename, indexname;
```

Report Format (print at end)
- Tables created: [list]
- Indexes created: [list]
- Row counts: tokens=X, pools=Y, pool_snapshots=Z
- Status: SUCCESS if all DDL applied without error; otherwise FAIL with the first error message.

Notes
- Do not drop or alter existing columns.
- If tables already exist, ensure DDL is idempotent and returns SUCCESS.
- No RLS configuration required for this run.

