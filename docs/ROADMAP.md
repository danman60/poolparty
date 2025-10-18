# PoolParty Roadmap

## Current Version: v0.2 (Transaction Support)

**Status**: Full LP Management + Beautiful UI ✨

---

## v0.2 - Transaction Support ✅ COMPLETE
**Completed**: October 2025
**Status**: 100% Complete

### Features ✅
- ✅ Token approvals (ApproveButton component)
- ✅ Mint LP positions (MintPosition component with full UI - ENABLED)
- ✅ Collect fees (Large button with emoji, real-time status)
- ✅ Decrease liquidity (Slider UI, percentage control)
- ✅ Redesigned UI (Card-based positions, gradient backgrounds)
- ✅ Proper decimal formatting (wei → human-readable with 5 decimal precision)
- ⚠️ Increase liquidity (TODO: needs IncreaseLiquidityButton component)
- ⚠️ Burn position NFTs (TODO: needs BurnPositionButton component)

### Technical Improvements ✅
- ✅ Transaction state management (wagmi hooks)
- ✅ GraphQL schema fixes (correct Uniswap V3 subgraph queries)
- ✅ BigInt decimal conversion (safe handling of fee values)
- ✅ Error handling refinement (toast notifications + user-friendly messages)
- ✅ Production verification tests (Playwright E2E)
- ❌ Batch operations support (not yet implemented)
- ❌ Gas estimation UI (basic, could be improved)

---

## v0.3 - Multi-Chain Support
**Target**: Q2 2025

### Features
- Arbitrum integration
- Polygon support
- Base support
- Chain switching UI
- Cross-chain position view

### Technical Improvements
- Abstract chain logic
- Multi-RPC management
- Per-chain configuration
- Chain-specific ABIs

---

## v0.4 - Advanced Analytics
**Target**: Q2 2025

### Features
- Impermanent loss calculator
- Historical backtesting
- Range efficiency scoring
- Volume heatmaps
- Custom date ranges
- Export to CSV

### Technical Improvements
- Materialized views for analytics
- Advanced SQL aggregations
- Chart performance optimization

---

## v0.5 - Automation & Alerts
**Target**: Q3 2025

### Features
- Out-of-range position alerts
- APR spike notifications
- Auto-collect fees (optional)
- Range adjustment suggestions
- Telegram/Discord integration
- Email notifications

### Technical Improvements
- Alert rules engine
- Notification queue
- Webhook integrations
- n8n workflow support

---

## v1.0 - Portfolio Management
**Target**: Q4 2025

### Features
- Multi-position dashboard
- Portfolio health score
- Aggregated PnL tracking
- Tax reporting (CSV export)
- Position comparison
- Strategy templates

### Technical Improvements
- User accounts (optional)
- Position history storage
- Performance benchmarking
- Advanced data retention

---

## Future Considerations

### Multi-DEX Support
- SushiSwap V3
- Pancake

Swap V3
- Curve V2
- Balancer V2

### Social Features
- Public profiles
- Copy trading
- Strategy sharing
- Leaderboards

### Mobile App
- React Native app
- Push notifications
- Simplified UI
- Quick actions

### Advanced Tools
- Limit orders
- Stop-loss automation
- Rebalancing strategies
- MEV protection

---

## Recent Updates (October 17, 2025)

### ✅ Major UI Overhaul & Transaction Support
- **💧 Join Pool UI**: Prominent "Join This Pool" section with blue borders on all pool detail pages
- **🎨 Wallet Redesign**: Beautiful card-based layout with gradient backgrounds for each position
- **🔘 Big Action Buttons**: Large, emoji-enhanced buttons for Collect Fees (💰) and Withdraw Liquidity (💸)
- **📊 Decimal Formatting**: Proper wei→decimal conversion with 5-digit precision (no more scientific notation!)
- **🔧 GraphQL Fixes**: Corrected Uniswap V3 subgraph schema queries for positions
- **🧮 BigInt Safety**: Safe decimal-to-BigInt conversion for fee calculations
- **✅ Production Testing**: Comprehensive Playwright E2E tests for production verification
- **🎯 Feature Flag**: NEXT_PUBLIC_FEATURE_MINT enabled for testing liquidity provision

### Earlier October Updates
- **Generated Pool Names**: Deterministic, memorable names for each pool (e.g., "SoakingHog", "PartyFox")
- **Token Symbol Display**: Show token pairs with symbols instead of addresses (e.g., "USDC / WETH")
- **Gradient Backgrounds**: Subtle page-wide gradients for both light and dark modes
- **Enhanced Health Indicators**: Color-coded gradient banners for system status
- **Cache Invalidation**: Refresh Data button now properly updates all indicators
- **Next.js 15 Compatibility**: Fixed async params for pool detail pages

---

## Community Requests

Track and prioritize feature requests:
1. Historical APR charts (high priority)
2. Position simulator (high priority)
3. Gas optimization tools (medium)
4. ~~Dark/light theme toggle~~ ✅ DONE (gradient backgrounds)
5. Multiple wallet support (medium)

### Recent Updates (2025-10-17 22:45)
- Phase 2 in progress: AdvisorBadge + V:TVL badge integrated on Pools view
- Wallet positions API now includes poolId for per-position IL/V:TVL plumbing
- Pre-push build hook added to block failing pushes

