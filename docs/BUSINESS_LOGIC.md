# PoolParty Business Logic

## Problem Statement

DeFi liquidity providers face several challenges:
1. **Fragmented Data**: Pool analytics spread across multiple platforms
2. **Complex Calculations**: APR and IL calculations require technical knowledge
3. **Manual Management**: Collecting fees and adjusting ranges is tedious
4. **Poor Visibility**: Hard to track performance across multiple positions
5. **No Automation**: No alerts for out-of-range or fee collection opportunities

## Solution

PoolParty provides a unified platform for:
- **Analytics**: Metrix-style dashboard for pool performance
- **Wallet Integration**: Direct transaction support (mint, collect, adjust)
- **Automation**: Alerts and optional auto-compound (future)
- **Portfolio Management**: Aggregate view of all positions (future)

---

## Target Users

### 1. Casual LPs (Primary)
**Profile**: Small to medium positions ($1K-$50K), 1-5 pools
**Goals**: Maximize APR, minimize gas, simple UX
**Pain Points**: Complex interfaces, high gas costs, missed fee collections

**PoolParty Value**:
- Easy-to-understand APR display
- One-click fee collection
- Gas estimation before transactions

### 2. Active Traders (Secondary)
**Profile**: Large positions ($50K+), 10+ pools, frequent adjustments
**Goals**: Optimize ranges, track IL, automate operations
**Pain Points**: Manual range adjustments, no portfolio view, time-consuming

**PoolParty Value**:
- Batch operations
- Out-of-range alerts
- Portfolio health scoring

### 3. DeFi Researchers (Tertiary)
**Profile**: Analyzing strategies, comparing pools
**Goals**: Historical data, backtesting, export capabilities
**Pain Points**: Limited historical data, no comparison tools

**PoolParty Value**:
- Historical charts
- Pool comparison
- CSV export (future)

---

## Key Metrics

### APR Calculation

**Formula:**
```
APR = (fee_revenue / tvl) * (365 / period_days)

Where:
- fee_revenue = volume * fee_tier
- period_days = 1, 7, or 30
```

**Example:**
```
Pool: USDC/WETH 0.05%
TVL: $100M
24h Volume: $50M
Fee Revenue: $50M * 0.0005 = $25K

APR_24h = ($25K / $100M) * 365 = 9.125%
```

**Important Notes:**
- APR is **estimated** based on recent volume
- Actual returns depend on:
  - Position in/out of range
  - Volume fluctuations
  - TVL changes
  - Impermanent loss

### Fee Tier Significance

| Fee Tier | Use Case | Volatility |
|----------|----------|------------|
| 0.01% | Stablecoin pairs | Very low |
| 0.05% | Correlated pairs (ETH/WBTC) | Low |
| 0.30% | Most pairs | Medium |
| 1.00% | Exotic/volatile pairs | High |

**Logic**: Higher fee tiers compensate for higher IL risk

---

## Range Strategy

### Wide Range (Conservative)
- **Ticks**: ±50% from current price
- **Pros**: Less IL, stays in range longer
- **Cons**: Lower fees per unit liquidity
- **Best For**: Volatile pairs, passive LPs

### Medium Range (Balanced)
- **Ticks**: ±20% from current price
- **Pros**: Good balance of fees and range
- **Cons**: Requires occasional adjustments
- **Best For**: Most pairs, active LPs

### Tight Range (Aggressive)
- **Ticks**: ±5% from current price
- **Pros**: Maximum fees per unit liquidity
- **Cons**: High IL, frequent out-of-range
- **Best For**: Stablecoins, very active LPs

### Correlated Pairs (Specialized)
- **Ticks**: ±10% from current price
- **Pros**: Low IL, moderate fees
- **Cons**: Requires pair correlation knowledge
- **Best For**: ETH/stETH, WBTC/tBTC, etc.

---

## Impermanent Loss (IL)

**Definition**: Loss compared to holding tokens vs providing liquidity

**Formula** (simplified for 50/50 pools):
```
IL = 2 * sqrt(price_ratio) / (1 + price_ratio) - 1

Where price_ratio = current_price / initial_price
```

**Example:**
```
Initial: 1 ETH = $2000
Current: 1 ETH = $3000
Price Ratio: 1.5

IL = 2 * sqrt(1.5) / (1 + 1.5) - 1
IL = 2 * 1.225 / 2.5 - 1
IL ≈ -2% (loss)
```

**Mitigation Strategies:**
1. Choose correlated pairs (ETH/WBTC)
2. Use tighter ranges (reduces exposure)
3. Provide to stablecoin pairs
4. Collect fees frequently (offsets IL)

---

## Fee Collection Strategy

### When to Collect

**Gas Break-Even Analysis:**
```
Collect when: fees_owed_usd > gas_cost_usd * safety_factor

Where safety_factor = 2-3x (to account for price volatility)
```

**Example:**
```
Gas Cost: 0.0015 ETH * $2000/ETH = $3
Safety Factor: 3x
Minimum Fees: $3 * 3 = $9

→ Collect when fees > $9
```

**Automated Thresholds:**
- **Conservative**: fees > $50 or 5% of position value
- **Balanced**: fees > $25 or 2% of position value
- **Aggressive**: fees > $10 or 1% of position value

---

## Volume Patterns

### Daily Cycle
- **Peak**: 12:00-20:00 UTC (US/EU trading hours)
- **Low**: 02:00-10:00 UTC (Asia overnight)

**Strategy**: Mint positions during low-volume periods for better execution

### Weekly Cycle
- **Peak**: Tuesday-Thursday
- **Low**: Weekend (Saturday-Sunday)

**Strategy**: Adjust ranges mid-week, collect fees on weekends (lower gas)

---

## Risk Levels

### Low Risk
- **Pairs**: Stablecoin/Stablecoin (USDC/DAI)
- **Fee Tier**: 0.01%
- **Range**: Wide (±10%)
- **Expected APR**: 2-5%
- **IL Risk**: Minimal

### Medium Risk
- **Pairs**: ETH/Stablecoin
- **Fee Tier**: 0.05% or 0.30%
- **Range**: Medium (±20%)
- **Expected APR**: 10-30%
- **IL Risk**: Moderate

### High Risk
- **Pairs**: Altcoin/ETH, Exotic pairs
- **Fee Tier**: 0.30% or 1.00%
- **Range**: Tight (±10% or less)
- **Expected APR**: 30-100%+
- **IL Risk**: High

---

## Competitive Landscape

### Direct Competitors
1. **Revert Finance**: Advanced analytics, $5-10/mo subscription
2. **Uniswap.info**: Official, free, basic analytics
3. **DexGuru**: Multi-DEX, complex UI
4. **DeBank**: Portfolio tracker, no direct LP management

### PoolParty Differentiators
1. **Free**: No subscription (ad-supported or freemium future)
2. **Simple**: Focused on Uniswap V3, clean UI
3. **Integrated**: Analytics + transactions in one place
4. **Automation**: Alerts and auto-collect (future)

---

## Monetization (Future)

### Freemium Model
- **Free Tier**: Basic analytics, manual operations
- **Pro Tier** ($9.99/mo): Advanced features
  - Automation (auto-collect, rebalance)
  - Alerts (Telegram, Discord)
  - Historical backtesting
  - Priority support

### Affiliate Revenue
- Referral fees from:
  - Alchemy/Infura (RPC providers)
  - Hardware wallet manufacturers
  - DeFi protocols

### Premium Features
- Custom alerts
- API access
- White-label solutions
- Strategy marketplace

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Monthly Active Users | 1,000 | TBD |
| Total Value Managed | $1M | TBD |
| Transactions/Day | 100 | TBD |
| User Retention (30d) | 40% | TBD |
| Average Position Size | $5,000 | TBD |

---

## Regulatory Considerations

- **Non-Custodial**: PoolParty never holds user funds
- **No Trading Advice**: APR is "estimated", not guaranteed
- **Terms of Service**: Required for production
- **Privacy Policy**: Required (GDPR compliance)
- **Disclaimers**: IL risk, smart contract risk, gas costs

---

## Future Business Model

1. **Phase 1**: Build user base (free product)
2. **Phase 2**: Introduce premium features
3. **Phase 3**: API access for institutions
4. **Phase 4**: Strategy marketplace (revenue share)
