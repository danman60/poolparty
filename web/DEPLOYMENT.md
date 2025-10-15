# PoolParty Deployment (Vercel + Supabase)

This guide deploys the app to Vercel and connects it to Supabase and public RPC endpoints.

## Prerequisites

- Vercel account and GitHub repo (or Vercel CLI installed)
- Supabase project (SQL editor access)
- Optional: custom RPC endpoints (Alchemy/Infura). Defaults use publicnode.

## 1) Apply Database Schema

Option A — Run SQL in Supabase SQL Editor:
- Open `PoolParty/web/supabase/0001_init.sql` and run it.

Option B — Use the automation prompt with MCP:
- See `PoolParty/web/docs/schema_tool_prompt.md` (idempotent DDL + indexes + verification queries).

## 2) Configure Environment Variables (Vercel)

Project → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
- `SUPABASE_SERVICE_ROLE` = service role key (server only; never exposed to client)
- `INGEST_SECRET` = a strong random string (protects ingestion route)
- Optional RPC overrides:
  - `NEXT_PUBLIC_RPC_MAINNET` = https://ethereum.publicnode.com
  - `NEXT_PUBLIC_RPC_SEPOLIA` = https://ethereum-sepolia.publicnode.com

Feature flags (optional):
- `NEXT_PUBLIC_FEATURE_STATUS` = true|false
- `NEXT_PUBLIC_FEATURE_CHARTS` = true|false
- `NEXT_PUBLIC_FEATURE_MINT` = true|false

## 3) Deploy to Vercel

Option A — Git push (recommended):
- Push to `main`. The GitHub Action (`.github/workflows/predeploy.yml`) runs lint, unit, build, start, E2E smoke, QA checks.
- After CI passes, Vercel deploys the production build.

Option B — Vercel CLI:
- `npm i -g vercel`
- `vercel` (link project), then `vercel --prod`

Option C — GitHub Action (Vercel CLI deploy)
- Workflow: `.github/workflows/vercel-deploy.yml`
- Required GitHub secrets (Settings → Secrets and variables → Actions):
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
- On push to `main` (or via “Run workflow”), it pulls env, builds, and deploys `PoolParty/web`.

## 4) Seed Data

- Trigger ingestion once (replace `<token>` with your `INGEST_SECRET`):
  - `GET https://<your-domain>/api/ingest/uniswap?limit=50&token=<token>`
- Verify dashboard and `/status` show data freshness and subgraph recency.

## 5) Cron (Hourly)

`vercel.json` configures a cron at `0 * * * *` to call `/api/ingest/uniswap`.
Ensure `INGEST_SECRET` is set; Vercel Cron will call without auth headers, so your ingestion route should allow dev dry-runs or add a URL param secret if needed.

## 6) Post‑Deploy QA (manual quick checks)

- `/` loads, table paginates and filters
- `/pool/<id>` shows analytics and APR calculator
- `/wallet` connects and shows positions (mainnet wallets)
- `/status` shows env, RPC latency, and subgraph recency

## Rollback

- Use Vercel deployments UI to promote a previous build.
