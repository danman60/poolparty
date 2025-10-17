# PoolParty Roadmap

## Current Version: v0.1 (MVP)

**Status**: Analytics + Wallet Connect + Read-Only Positions

---

## v0.2 - Transaction Support (Next)
**Target**: Q1 2025

### Features
- ✅ Token approvals
- ✅ Mint LP positions
- ✅ Collect fees
- ✅ Increase liquidity
- ✅ Decrease liquidity
- ✅ Burn position NFTs

### Technical Improvements
- Transaction state management
- Gas estimation UI
- Error handling refinement
- Batch operations support

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

## Recent Updates (October 2025)

### ✅ Completed Features
- **Generated Pool Names**: Deterministic, memorable names for each pool (e.g., "SoakingHog", "PartyFox")
- **Token Symbol Display**: Show token pairs with symbols instead of addresses (e.g., "USDC / WETH")
- **Gradient Backgrounds**: Subtle page-wide gradients for both light and dark modes
- **Enhanced Health Indicators**: Color-coded gradient banners for system status
- **Cache Invalidation**: Refresh Data button now properly updates all indicators
- **Next.js 15 Compatibility**: Fixed async params for pool detail pages
- **E2E Production Tests**: Automated accessibility testing for production deployment

---

## Community Requests

Track and prioritize feature requests:
1. Historical APR charts (high priority)
2. Position simulator (high priority)
3. Gas optimization tools (medium)
4. ~~Dark/light theme toggle~~ ✅ DONE (gradient backgrounds)
5. Multiple wallet support (medium)
