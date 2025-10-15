# PoolParty

DeFi pool analytics + wallet actions (Uniswap v3) built on Next.js 14, Supabase, wagmi/viem, and recharts.

## Quickstart

1. Install deps
   ```bash
   npm ci
   ```
2. Run dev
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

## Environment

Copy `.env.local.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional for read)
- `SUPABASE_SERVICE_ROLE` (required for ingest writes)
- `INGEST_SECRET` (optional; protects ingest endpoint if set)
- RPC defaults use publicnode; override with `NEXT_PUBLIC_RPC_MAINNET`, `NEXT_PUBLIC_RPC_SEPOLIA` as needed.

### Feature Flags

Set these in `.env.local` to toggle features at build/runtime:

- `NEXT_PUBLIC_FEATURE_STATUS` (default: true) — show `/status` link and page
- `NEXT_PUBLIC_FEATURE_CHARTS` (default: true) — show volume/fees charts on pool page
- `NEXT_PUBLIC_FEATURE_MINT` (default: false) — show Mint Position skeleton on pool page

## Supabase Schema

Use `supabase/0001_init.sql` or the automation prompt in `docs/schema_tool_prompt.md`. With MCP access, execute the prompt against your project.

## Ingestion

- Populate data via API:
  - `GET /api/ingest/uniswap?limit=50` (returns `dryRun: true` if no Supabase env)
  - When `INGEST_SECRET` is set, pass `Authorization: Bearer <secret>` or `?token=<secret>`
- Vercel cron (hourly) triggers `/api/ingest/uniswap` (see `vercel.json`).

## Tests

- Unit: `npm run test`
- E2E: `npm run playwright:install` then `npm run test:e2e` (with app running)

## CI / QA

GitHub Actions workflow: `.github/workflows/predeploy.yml` runs lint, tests, build, E2E smoke, RPC/subgraph checks, Lighthouse (optional).

## Notes

- Wallet actions require Ethereum Mainnet in your wallet and positions with fees/liquidity.
- APR calculator is an approximation; not financial advice.
