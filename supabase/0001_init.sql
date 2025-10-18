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

-- Wallet activity (optional)
create table if not exists position_actions (
  id bigserial primary key,
  wallet text,
  token_id text,
  action text,
  tx_hash text,
  chain int,
  created_at timestamptz default now()
);
