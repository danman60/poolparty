PoolParty Resume Notes

This file summarizes local, client-side trackers and how to resume the current advisor-centric session.

Saved trackers (localStorage)
- pp_watchlist: Array of { id, name } for starred pools
- pp_wallet_prefs: Wallet view prefs { onlyFees, showStats, showTrends, sortKey, advisorFilter, watchOnly }
- pp_health_spark: Array<number> recent avg health values for sparkline
- pp_activity: Array of recent tx activity items { ts, type, tokenId, hash, chain }
- pp_il_default: Global IL preset (5/10/20/50) used by PoolAdvisor when per-pool and URL are absent
- pp_il_<poolId>: Per-pool IL preset; overrides global default

Shareable URL params
- Pools: rating=all|good|excellent, watch=1, q=search, sort, order
- Wallet: onlyFees=1, stats=1, trends=1, sort=default|health|fees, filter=all|risky|good|excellent, watch=1
- Pool detail: il=5..80 (IL percent preset)

Quick resume steps
1) npm run dev
2) Open / (Pools) to see Advisor table. Use the chips, Watchlist only, and Search. Copy View Link for exact state.
3) Open /wallet after connecting your wallet. Wallet respects persisted prefs and URL params.
4) On a specific pool page (/pool/<id>), IL slider/presets reflect ?il or stored defaults.

Handy controls
- Pools
  - Watchlist only: focus on starred pools
  - Add/Remove visible: bulk manage watchlist from the current filtered/sorted set
  - Copy Advisor Summary: top-5 snapshot by preview rating
  - Export CSVs: current table or watchlist
- Wallet
  - Yield/Risk presets: instant filters/sorts
  - Copy Advisor Summary: counts + visible fees USD
  - Activity tray: recent tx links (Hide/Clear)

Next ideas
- Add momentum filters (rising-only) and persist them to URL
- Show true advisor score in WatchlistBar chips via minimal fetch
- Batch operations tray on Pools (optional)

