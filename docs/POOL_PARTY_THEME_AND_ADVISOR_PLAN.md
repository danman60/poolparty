# ðŸŠ PoolParty Theme & Advisor Feature - Master Plan

**Version:** 1.1
**Date:** October 17, 2025
**Status:** In Progress
**Last Updated:** October 17, 2025 23:59 UTC

---

## ðŸ“Š PROGRESS TRACKER

### âœ… Phase 1: Theme Foundation (Week 1-2) - **COMPLETE**

**Status:** In Progress
**Completed:** October 17, 2025

#### Files Created:
1. **`src/lib/lifeguard/healthScore.ts`** (232 lines) - âœ… COMPLETE
   - Comprehensive 4-factor health scoring algorithm
   - Weights: Profitability (40%), Fee Performance (30%), Liquidity Utilization (20%), Risk Metrics (10%)
   - 5-tier status system (Excellent, Good, Fair, Risky, Critical)
   - Health breakdown export function

2. **`src/components/PositionCard.tsx`** (232 lines) - âœ… COMPLETE
   - Mobile-first collapsible card component
   - Tap-to-expand interaction pattern
   - Real-time Lifeguard health score integration
   - Detailed health breakdown grid (4 factors with weights)
   - Profitability display with color-coded indicators
   - Touch-optimized buttons (44px minimum)
   - Ripple and splash animations

#### Files Modified:
1. **`src/app/globals.css`** (388 lines) - âœ… COMPLETE
   - Pool Party color palette (aqua blues, lifeguard status colors)
   - 60+ CSS custom properties
   - 6 keyframe animations (wave, ripple, splash, float, shimmer, none for reduced motion)
   - Mobile-specific utilities (touch targets, safe areas, bottom nav)
   - Dark mode support
   - Accessibility features (prefers-reduced-motion, focus-visible)

2. **`src/components/WalletPositions.tsx`** - âœ… COMPLETE
   - Replaced old card layout with new PositionCard component
   - Added "ðŸŠ Your Pools" header with Pool Party branding
   - Skeleton loading states with shimmer animation
   - Styled error states with Lifeguard alert styling
   - Empty state with pool emoji
   - Lifeguard tip box at bottom

#### Achievements:
- âœ… Pool Party theme system with aqua blue color palette
- âœ… Lifeguard status colors (5-tier system)
- âœ… Mobile-first responsive design (Chrome Android optimized)
- âœ… CSS animations (wave, ripple, splash, float, shimmer)
- âœ… Touch-friendly interactions (44px minimum targets)
- âœ… Real health scoring algorithm (no mocks)
- âœ… Collapsible position cards with detailed health breakdown
- âœ… Dark mode support
- âœ… Accessibility features

#### Dev Server Status:
- âœ… Running successfully at http://localhost:3004
- âœ… No TypeScript errors
- âœ… No build errors
- âœ… Hot reload working

---

### â³ Phase 2: Advisor Metrics Engine (Week 3-4) - **NEXT**

**Status:** In Progress
**Target Start:** October 18, 2025

#### Planned Files to Create:
1. **`src/lib/advisor/impermanentLoss.ts`** - ✅ COMPLETE
   - IL calculation formulas
   - Volume-to-offset-IL calculator
   - IL risk assessment (low/medium/high/extreme)
   - Break-even volume analysis

2. **`src/lib/advisor/volumeAnalysis.ts`** - â³ PENDING
   - Volume-to-TVL ratio scoring (0-10 scale)
   - Daily/weekly/monthly volume trends
   - Activity classification

3. **`src/lib/advisor/rangeOptimization.ts`** - â³ PENDING
   - Optimal range calculation for blue-chip pairs (Â±8%)
   - Stablecoin range calculator (Â±0.2%)
   - Long-tail range calculator (Â±80%)
   - Range efficiency evaluation

4. **`src/lib/advisor/exitTriggers.ts`** - â³ PENDING
   - Stablecoin depeg detection (>0.5%, >1%, >2%)
   - Volatility spike detection
   - Out of range duration evaluation
   - PnL vs HODL stop-loss
   - Pool health degradation monitoring

5. **`src/lib/advisor/poolScreening.ts`** - â³ PENDING
   - Pool safety scoring (0-100)
   - Entry criteria validation
   - Position sizing calculator
   - Fee tier recommendation matrix

6. **`src/components/advisor/PoolRating.tsx`** - â³ PENDING
   - Pool health badge component
   - Star rating display (1-5 stars)

7. **`src/components/advisor/MetricTooltip.tsx`** - â³ PENDING
   - Interactive tooltip component
   - Educational explanations
   - Contextual examples

8. **`src/components/advisor/AdvisorBadge.tsx`** - ✅ COMPLETE
   - Status badge component
   - Color-coded indicators

#### Key Metrics to Implement:
- [x] Volume-to-TVL ratio scoring
- [x] IL risk assessment
- [ ] Fee tier analysis
- [ ] Range efficiency calculation
- [ ] Pool age & stability scoring
- [ ] Concentration risk detection
- [ ] Out of range detection

---

### ðŸ“… Phase 3: Conditional Formatting (Week 5) - **PLANNED**

**Status:** In Progress

#### Tasks:
- [ ] Color-coded pool cards based on health scores
- [ ] Pulsing animations for warnings
- [ ] Visual status indicators
- [ ] Health bar visualizations
- [ ] Dashboard filtering by health score

---

### ðŸ“… Phase 4: Notification System (Week 6) - **PLANNED**

**Status:** In Progress

#### Planned Files:
- [ ] `src/lib/notifications/monitor.ts`
- [ ] `src/lib/notifications/templates.ts`
- [ ] `src/components/NotificationCenter.tsx`
- [ ] `src/components/NotificationToast.tsx`

---

### ðŸ“… Phase 5: Polish & Testing (Week 7-8) - **PLANNED**

**Status:** In Progress

#### Tasks:
- [ ] User testing & feedback
- [ ] Animation refinement
- [ ] Mobile Chrome Android device testing
- [ ] Performance optimization
- [ ] E2E tests for advisor features

---

## ðŸŽ¯ DELEGATION HANDOFF NOTES

### For Next Developer/Tool:

**Current State:**
- Phase 1 is fully complete and working
- Dev server running on port 3004
- All basic UI/UX foundation in place
- Real health scoring implemented (not mocked)

**Next Immediate Tasks (Phase 2):**
1. Start with `src/lib/advisor/impermanentLoss.ts`
2. Implement IL formulas from lines 1593-1661 of this document
3. Create unit tests for IL calculations
4. Integrate IL calculations into health scoring

**Key Technical Context:**
- TypeScript strict mode enabled
- Using Next.js 15.5.5 with Turbopack
- Tailwind CSS v4 with @theme inline syntax
- Mobile-first design (Chrome Android primary target)
- All calculations based on research from ADVISOR_RESEARCH_SOURCE.md

**Important Files to Reference:**
- `src/lib/lifeguard/healthScore.ts` - Current health scoring implementation
- Lines 1453-2335 of this document - Complete Phase 2-5 specifications
- Lines 1590-2193 - Research-based formulas and thresholds

**Testing Strategy:**
- Manual testing on Chrome Android
- Unit tests for all advisor calculations
- Integration tests for health scoring
- E2E tests deferred to Phase 5

---

## ðŸŽ¯ Vision

Transform PoolParty into a **fun, beautiful, and intuitive** DeFi app with:
1. **Pool Party Theme**: Festive summer outdoor vibe where each liquidity pool is a visual swimming pool
2. **The Lifeguard System**: Intelligent risk management and optimization engine (formerly "Advisor")
3. **Educational Scaffolding**: Learn-as-you-earn with contextual guidance

**Core Philosophy**: *"Jump in the pool. We'll keep you safe."*

Users control capital deployment; The Lifeguard optimizes everything else.

---

## ðŸŠâ€â™‚ï¸ The Lifeguard System

The Lifeguard is PoolParty's intelligent protection system that actively monitors positions, suggests optimal settings, and protects users from common LP mistakes.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           THE LIFEGUARD SYSTEM                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”       â”‚
â”‚  â”‚ Risk Monitor â”‚      â”‚  Optimizer   â”‚       â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜       â”‚
â”‚         â”‚                     â”‚                â”‚
â”‚         â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤                â”‚
â”‚         â”‚         â”‚           â”‚                â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â” â”Œâ–¼â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚  Alerts    â”‚ â”‚Educator â”‚ â”‚ Auto-Adjust â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Protection Layers

**Layer 1: Pre-Entry Validation**
- Protocol audit verification
- TVL/Volume sanity checks
- Rug pull risk assessment
- Smart contract risk scoring (0-100)

**Layer 2: Position Monitoring**
- Real-time price tracking
- IL calculation updates (every block)
- Range efficiency monitoring
- Gas cost tracking

**Layer 3: Market Condition Analysis**
- Volatility regime detection
- Liquidity depth monitoring
- Correlation analysis
- Oracle price verification

**Layer 4: Automated Response**
- Alert generation (critical, warning, info)
- Optimization suggestions
- Emergency actions (if enabled)
- Performance reporting

---

## ðŸŽ¨ Part 1: Pool Party Theme UI/UX Overhaul

### Core Visual Identity

#### Color Palette
- **Primary**: Bright aqua blues (#00D4FF, #0099CC, #006B8C)
- **Accent**: Sunny yellow (#FFD700), coral pink (#FF6B9D)
- **Water effects**: Gradient blues with shimmer/wave animations
- **Success**: Lime green (#32CD32) for good metrics
- **Warning**: Sunset orange (#FF8C42) for caution
- **Danger**: Hot pink (#FF1493) for red flags

#### Typography
- **Headings**: Playful rounded sans-serif (e.g., "Quicksand", "Fredoka")
- **Body**: Clean readable font (Inter, but rounded variant)
- **Pool Names**: Keep fun names like "SoakingHog" in bold display font

---

### ðŸŠ Pool Visual Representations

#### Individual Pool Cards (Dashboard & Detail Pages)

**Visual Elements:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚   ðŸŒŠ SoakingHog Pool ðŸŒŠ         â”‚  â† Pool name with wave emoji
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚
â”‚   â”‚   ~ ~ ~ ~ ~ ~ ~ ~     â”‚     â”‚  â† Animated water surface
â”‚   â”‚  ðŸ’§ ðŸ’§ ðŸ’§ ðŸ’§ ðŸ’§ ðŸ’§    â”‚     â”‚  â† Droplet/swimmer icons
â”‚   â”‚   USDC / WETH         â”‚     â”‚  â† Token pair floating
â”‚   â”‚   ~ ~ ~ ~ ~ ~ ~ ~     â”‚     â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚
â”‚                                  â”‚
â”‚   Depth: $1.2M TVL   Temp: 68Â°F â”‚  â† Pool "depth" = TVL, "temp" = APR
â”‚   Swimmers: 234      Fees: 0.3% â”‚  â† # positions, fee tier
â”‚                                  â”‚
â”‚   [ðŸŠ Dive In] [ðŸ“Š Pool Report] â”‚  â† Action buttons
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Depth Visualization:**
- TVL shown as pool depth with layered blue gradients
- Higher TVL = deeper looking pool
- Small pools: shallow wading pool look
- Large pools: olympic pool depth

**Water Animation:**
- Subtle CSS wave animation on pool surface
- Ripple effect on hover
- "Splash" animation when joining/leaving

**Activity Indicators:**
- Floating icons (ðŸŠâ€â™‚ï¸ ðŸ„â€â™€ï¸ ðŸ¤¿) representing number of LPs
- More icons = more popular pool
- Animated movement across the pool surface

---

### ðŸŽª User Position Cards (Wallet Page)

**Each Position Looks Like a Pool Membership Card:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ–ï¸ Your USDC/WETH Pool Pass ðŸ–ï¸   â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Pool #812345  â­â­â­â­â­      â”‚   â”‚  â† Rating from advisor
â”‚  â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚   â”‚
â”‚  â”‚ â”‚  ~ ACTIVE SWIMMER ~   â”‚   â”‚   â”‚  â† Status (in range)
â”‚  â”‚ â”‚   ðŸ’§ Your Spot ðŸ’§     â”‚   â”‚   â”‚
â”‚  â”‚ â”‚  Current Depth: 75%   â”‚   â”‚   â”‚  â† Range position
â”‚  â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚   â”‚
â”‚  â”‚                             â”‚   â”‚
â”‚  â”‚ Your Share: 0.5%            â”‚   â”‚
â”‚  â”‚ Collected: $12.34 ðŸŽ‰        â”‚   â”‚
â”‚  â”‚ Uncollected: $5.67          â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                     â”‚
â”‚  [ðŸ’° Collect Splashes] [ðŸšª Exit]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Status Indicators:**
- **In Range**: Green "ACTIVE SWIMMER" badge with wave animation
- **Out of Range**: Red "ON THE DECK" badge (you're out of the water)
- **Partially Out**: Yellow "SHALLOW END" warning

---

### ðŸŽ¯ Pool Detail Page Redesign

**Hero Section:**
```
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
       ðŸŠ Welcome to SoakingHog Pool! ðŸŠ
     "The Premier USDC/WETH Swimming Hole"
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
      â”‚    ~ ~ ~ ~ POOL VIEW ~ ~ ~ ~    â”‚
      â”‚   ðŸŠâ€â™‚ï¸        ðŸ’§        ðŸŠâ€â™€ï¸       â”‚
      â”‚  Depth: 8.5ft    Temp: Warm ðŸŒ¡ï¸  â”‚
      â”‚   ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~   â”‚
      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

   TVL: $1.2M    Volume 24h: $450K    APR: 12.5%
```

**"Join the Party" Section:**
- Giant inflatable pool toy graphics (ðŸ¦„ unicorn, ðŸ• pizza floaty)
- Big colorful "DIVE IN!" button
- Splash animation on click
- "Party Size" slider (amount to deposit)

---

### ðŸŒŠ Micro-Animations

1. **Splash Effect**: When depositing/withdrawing
2. **Ripples**: On pool card hover (tap on mobile)
3. **Waves**: Constant subtle movement on pool surfaces
4. **Bubbles**: Rising bubbles for loading states
5. **Sun Rays**: Shimmer effect on successful transactions
6. **Floaties**: Drift across screen on page load

**Mobile Performance:**
- Reduce animation complexity on mobile (detect via `prefers-reduced-motion`)
- Use CSS transforms instead of position changes
- Limit simultaneous animations to 2-3 on mobile

---

### ðŸŽµ Sound Design (Optional)

- Splash sound on join/exit (can be toggled off)
- Gentle water ambiance (very subtle, toggle)
- "Cha-ching" on fee collection

**Note**: Sounds disabled by default on mobile

---

## ðŸ“± Mobile-First Design Strategy

### Core Principles

**Mobile is the primary monitoring interface, desktop is for management:**

1. **Mobile Priorities**:
   - Quick glances at portfolio health
   - Critical alerts (prominent)
   - Simple actions (collect fees, view details)
   - Swipeable position cards
   - Bottom navigation for quick access

2. **Desktop Priorities**:
   - Multi-position comparison
   - Advanced analytics
   - Complex transactions (minting, rebalancing)
   - Deep configuration

### Mobile Screen Hierarchy

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸŠ Pool Party           â”‚ â† Sticky header (minimal)
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Portfolio: $12,450  â†—ï¸  â”‚ â† Total value (large, prominent)
â”‚ +$45 (+0.36%) 24h       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ”´ 2 alerts             â”‚ â† Critical alerts (expandable)
â”‚ ðŸŸ¡ 1 suggestion         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ ETH/USDC 0.3%     â”‚   â”‚ â† Swipeable cards
â”‚ â”‚ ðŸŸ¢ 78  $5,200     â”‚   â”‚   (swipe left = actions)
â”‚ â”‚ +$23 fees         â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                         â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚ â”‚ USDC/DAI 0.01%    â”‚   â”‚
â”‚ â”‚ ðŸŸ¢ 85  $7,250     â”‚   â”‚
â”‚ â”‚ +$14 fees         â”‚   â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                         â”‚
â”‚        [...]            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [ðŸ ] [ðŸ’°] [ðŸ””] [âš™ï¸]    â”‚ â† Bottom nav (fixed)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Mobile Interactions

**Swipe Gestures:**
```typescript
// Position cards
SwipeLeft:  Show quick actions (Collect, Adjust, Details)
SwipeRight: Dismiss quick actions
PullDown:   Refresh data
Tap:        Expand position details
LongPress:  Show advanced menu
```

**Bottom Navigation:**
```
ðŸ  Home     - Dashboard with all positions
ðŸ’° Pools    - Browse and join pools
ðŸ”” Alerts   - All notifications and suggestions
âš™ï¸ Settings - Preferences and automation
```

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- Spacing: 8px minimum between targets
- Large primary buttons: 56px height
- Swipeable cards: Full width with padding

### Mobile-Specific Components

#### 1. Collapsible Position Cards
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETH/USDC 0.3%      [Ë…]  â”‚ â† Collapsed (default)
â”‚ ðŸŸ¢ 78  $5,200           â”‚
â”‚ +$23 today              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

    â†“ Tap to expand â†“

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETH/USDC 0.3%      [Ë„]  â”‚ â† Expanded
â”‚ Lifeguard: ðŸŸ¢ 78/100    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Value: $5,200           â”‚
â”‚ Range: ðŸŸ¢ In range      â”‚
â”‚ â”œâ”€â”€â—â”€â”€â”€â”¤ $3.2K - $3.8K  â”‚
â”‚                         â”‚
â”‚ Fees (7d): +$23         â”‚
â”‚ IL: -$5                 â”‚
â”‚ Net P&L: +$18 âœ…        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [ðŸ’° Collect] [ðŸ”§ Adjust]â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 2. Slide-Up Modals (Not Full Page)
```
Action sheets for transactions:
- Slide up from bottom (80% screen height)
- Pull down to dismiss
- Large "Continue" button at bottom
- Easy to reach with thumb
```

#### 3. Simplified Metrics
```
Desktop: All 7 advisor metrics visible
Mobile:  Top 3 metrics + "See more" button

Prioritize on mobile:
1. Health Score (aggregate)
2. Profit Status (fees vs IL)
3. Range Status (in/out/approaching)
```

### Mobile-Specific Alerts

**Push Notifications:**
```
ðŸš¨ Pool Party Alert
ETH/USDC out of range
Tap to rebalance

[Tap] â†’ Opens app to position detail
[Swipe] â†’ Mark as read
[Long press] â†’ Snooze 1hr/3hr/6hr
```

**In-App Alert Cards:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ”´ Out of Range         â”‚ â† Color-coded border
â”‚ ETH/USDC â€¢ Just now     â”‚
â”‚                         â”‚
â”‚ Not earning fees        â”‚
â”‚ Lifeguard suggests:     â”‚
â”‚ Rebalance to $3.1K-$3.7Kâ”‚
â”‚                         â”‚
â”‚ [Rebalance] [Dismiss]   â”‚ â† Full-width buttons
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Responsive Breakpoints

```typescript
// Tailwind-style breakpoints
const breakpoints = {
  mobile: '0px',      // Mobile first
  mobileLg: '480px',  // Large phones
  tablet: '768px',    // Tablets
  desktop: '1024px',  // Desktop
  wide: '1280px'      // Wide desktop
};

// Component visibility
<LifeguardHealthDetail>
  className="hidden md:block" // Desktop only
</LifeguardHealthDetail>

<LifeguardHealthSummary>
  className="md:hidden" // Mobile only
</LifeguardHealthSummary>
```

### Mobile Performance Optimizations

**1. Lazy Loading:**
```typescript
// Load position details only when expanded
const PositionCard = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      <CardHeader onClick={() => setExpanded(!expanded)} />
      {expanded && (
        <Suspense fallback={<Skeleton />}>
          <PositionDetails /> {/* Lazy loaded */}
        </Suspense>
      )}
    </Card>
  );
};
```

**2. Virtual Scrolling:**
```typescript
// For users with 100+ positions
import { useVirtualizer } from '@tanstack/react-virtual';

// Only render visible cards + buffer
```

**3. Image Optimization:**
```typescript
// Token logos
<Image
  src={tokenLogo}
  width={32}
  height={32}
  loading="lazy"
  placeholder="blur"
/>
```

### Mobile-Specific Features

**1. Quick Actions Widget (iOS/Android)**
```
Home Screen Widget:
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Pool Party      â”‚
â”‚ $12,450  +0.3% â”‚
â”‚                 â”‚
â”‚ ðŸ”´ 2 alerts    â”‚
â”‚ [Open App]      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**2. Face ID / Touch ID**
```typescript
// For transaction approvals on mobile
if (isMobile && hasSecureAuth) {
  await authenticateWithBiometrics();
} else {
  await confirmInWallet();
}
```

**3. Haptic Feedback**
```typescript
// Subtle haptics for actions
const haptic = {
  success: 'notificationSuccess',    // Fee collected
  warning: 'notificationWarning',    // Approaching range edge
  error: 'notificationError',        // Out of range
  selection: 'selectionChanged',     // Card tap
  impact: 'impactLight'              // Button press
};
```

### Mobile Testing Checklist

**Browsers:**
- [ ] Safari iOS (14+)
- [ ] Chrome Android
- [ ] Chrome iOS
- [ ] Samsung Internet

**Devices:**
- [ ] iPhone SE (375px - smallest)
- [ ] iPhone 14 Pro (393px)
- [ ] Pixel 7 (412px)
- [ ] Samsung S23 (360px)
- [ ] iPad Mini (768px)

**Features:**
- [ ] Wallet connection (MetaMask mobile, WalletConnect)
- [ ] Transaction signing
- [ ] Push notifications
- [ ] Offline mode (view cached data)
- [ ] Dark mode
- [ ] Landscape orientation
- [ ] One-handed use (reachability)

---

## ðŸ§  Part 2: The Lifeguard Features (Intelligent Advisor)

### Overview

The **Lifeguard** is Pool Party's intelligent protection and optimization system that combines risk management, education, and automation to help users succeed.

---

### Pool Safety Scoring (Pre-Entry Validation)

Before allowing deposits, The Lifeguard evaluates pools using a comprehensive safety framework:

#### Safety Score Algorithm (0-100)

```typescript
function calculatePoolSafetyScore(pool: Pool): {
  score: number;
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  flags: string[];
  recommendation: string;
} {
  let score = 100;
  const flags: string[] = [];

  // Protocol maturity (-20 if new, +5 if mature)
  if (pool.protocolAge < 180) { // 6 months
    score -= 20;
    flags.push("New protocol - higher risk");
  } else if (pool.protocolAge > 730) { // 2 years
    score += 5;
  }

  // Audit status (critical)
  if (!pool.hasAudit) {
    score -= 30;
    flags.push("â›” No security audit");
  } else if (pool.auditAge > 365) {
    score -= 10;
    flags.push("âš ï¸ Audit outdated");
  }

  // Liquidity checks
  if (pool.tvl < 1_000_000) {
    score -= 15;
    flags.push("Low liquidity - high slippage risk");
  }

  // Volume/TVL ratio
  const vToTvl = pool.volume24h / pool.tvl;
  if (vToTvl < 0.1) {
    score -= 10;
    flags.push("Low utilization - fees may be insufficient");
  }

  // Smart contract risks
  if (pool.hasAdminKeys) {
    score -= 15;
    flags.push("Admin keys present - rug pull risk");
  }

  if (pool.isUpgradeable) {
    score -= 10;
    flags.push("Upgradeable contract - governance risk");
  }

  // Historical issues
  if (pool.pastExploits > 0) {
    score -= 25;
    flags.push("â›” Protocol has been exploited before");
  }

  // Oracle dependencies
  if (pool.usesExternalOracle && !pool.oracleValidated) {
    score -= 10;
    flags.push("Oracle manipulation risk");
  }

  score = Math.max(0, score);

  return {
    score,
    rating: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
    flags,
    recommendation:
      score >= 70 ? "âœ… Lifeguard approved for all users" :
      score >= 50 ? "âš ï¸ Acceptable for experienced users" :
      score >= 30 ? "âš ï¸ Only for risk-tolerant, experienced users" :
      "â›” Not recommended - significant risks"
  };
}
```

**UI Display:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ›¡ï¸ Lifeguard Safety Analysis       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                     â”‚
â”‚ Overall Score: 78/100 ðŸŸ¢            â”‚
â”‚ Rating: B - Generally Safe          â”‚
â”‚                                     â”‚
â”‚ âœ“ Audited by Trail of Bits (2024)  â”‚
â”‚ âœ“ 2+ years operational history      â”‚
â”‚ âœ“ $125M TVL (high liquidity)       â”‚
â”‚ âš ï¸ Admin keys present               â”‚
â”‚ âš ï¸ Upgradeable contract             â”‚
â”‚                                     â”‚
â”‚ Lifeguard Verdict:                  â”‚
â”‚ Safe for most users. Admin keys are â”‚
â”‚ controlled by 6-of-9 multisig with  â”‚
â”‚ 48hr timelock.                      â”‚
â”‚                                     â”‚
â”‚ [See full report] [Proceed anyway]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Position Health Monitoring (Real-Time)

The Lifeguard continuously monitors each position across multiple health factors:

#### Multi-Factor Health Score

```typescript
interface PositionHealthFactors {
  // Factor 1: Profitability (40% weight)
  profitHealth: {
    formula: 'feesEarned / (impermanentLoss + gasCosts)',
    thresholds: {
      critical: number < 0.5,   // Losing money
      warning: 0.5 - 1.2,       // Break-even zone
      good: 1.2 - 2.0,          // Profitable
      excellent: number > 2.0   // Very profitable
    }
  };

  // Factor 2: Range Efficiency (30% weight)
  rangeHealth: {
    formula: 'timeInRange / totalTime',
    thresholds: {
      critical: number < 50%,   // Mostly out of range
      warning: 50% - 70%,       // Suboptimal
      good: 70% - 90%,          // Well positioned
      excellent: number > 90%   // Optimal
    }
  };

  // Factor 3: Capital Efficiency (20% weight)
  efficiencyHealth: {
    formula: 'effectiveLiquidity / providedLiquidity',
    thresholds: {
      critical: number < 1.5,   // Not using CL well
      warning: 1.5 - 3.0,       // Suboptimal range
      good: 3.0 - 10.0,         // Good concentration
      excellent: number > 10    // Excellent concentration
    }
  };

  // Factor 4: Protocol Health (10% weight)
  protocolHealth: {
    checks: [
      'tvlNotDroppingRapidly',
      'noNewVulnerabilities',
      'oracleFunctioning',
      'governanceActive'
    ]
    // Any failure = critical
  };
}

function calculatePositionHealth(position: Position): {
  score: number;           // 0-100 weighted aggregate
  factors: HealthFactors;
  primaryConcern: string;
  recommendations: string[];
} {
  const weights = {
    profitHealth: 0.4,
    rangeHealth: 0.3,
    efficiencyHealth: 0.2,
    protocolHealth: 0.1
  };

  // Calculate individual factor scores
  const profitScore = scoreProfit Health(position);
  const rangeScore = scoreRangeHealth(position);
  const efficiencyScore = scoreEfficiencyHealth(position);
  const protocolScore = scoreProtocolHealth(position);

  // Weighted aggregate
  const weightedScore =
    profitScore * weights.profitHealth +
    rangeScore * weights.rangeHealth +
    efficiencyScore * weights.efficiencyHealth +
    protocolScore * weights.protocolHealth;

  // Identify weakest factor
  const factors = [
    { name: 'Profitability', score: profitScore },
    { name: 'Range Efficiency', score: rangeScore },
    { name: 'Capital Efficiency', score: efficiencyScore },
    { name: 'Protocol Health', score: protocolScore }
  ];
  const primaryConcern = factors.sort((a, b) => a.score - b.score)[0];

  return {
    score: weightedScore,
    factors: {
      profitHealth: profitScore,
      rangeHealth: rangeScore,
      efficiencyHealth: efficiencyScore,
      protocolHealth: protocolScore
    },
    primaryConcern: primaryConcern.name,
    recommendations: generateRecommendations(factors)
  };
}
```

**Position Card with Health Score:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ETH/USDC 0.3%  â›“ Ethereum ðŸ¦„ V3   â”‚
â”‚ Lifeguard Health: ðŸŸ¢ 78/100        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Value: $12,450                     â”‚
â”‚                                    â”‚
â”‚ Health Breakdown:                  â”‚
â”‚ â”œâ”€ Profit: ðŸŸ¢ 85 (Excellent)       â”‚
â”‚ â”œâ”€ Range: ðŸŸ¡ 72 (Good)             â”‚
â”‚ â”œâ”€ Efficiency: ðŸŸ¢ 81 (Good)        â”‚
â”‚ â””â”€ Protocol: ðŸŸ¢ 95 (Excellent)     â”‚
â”‚                                    â”‚
â”‚ ðŸ’¡ Lifeguard suggests:             â”‚
â”‚ Widen range by 2% to improve       â”‚
â”‚ in-range time from 72% to 85%      â”‚
â”‚                                    â”‚
â”‚ [Apply Suggestion] [Dismiss]       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Pool Health Score (Aggregate)

#### Calculation (Multi-Factor)

```typescript
Pool Health =
  (30 Ã— Volume/TVL ratio score) +
  (25 Ã— Safety score) +
  (20 Ã— Range efficiency potential) +
  (15 Ã— Fee tier appropriateness) +
  (10 Ã— Age/maturity score)
```

**Visual Representation:**
- 90-100: â­â­â­â­â­ "ðŸ’Ž Premium Pool - Dive In!" (Blue glow)
- 75-89: â­â­â­â­ "ðŸŸ¢ Great Pool - Safe Waters" (Green glow)
- 60-74: â­â­â­ "ðŸŸ¡ Good Pool - Watch Depth" (Yellow border)
- 40-59: â­â­ "ðŸŸ  Risky Pool - Caution Advised" (Orange border)
- 0-39: â­ "ðŸ”´ Dangerous Pool - Avoid!" (Red warning)

---

### Advisor Metrics & Tooltips

#### 1. **Volume-to-TVL Ratio**

**Formula:** `Daily Volume / TVL`

**Scoring:**
- **Excellent (10/10)**: Ratio > 0.5 (high trading activity)
- **Good (7/10)**: Ratio 0.2 - 0.5
- **Fair (5/10)**: Ratio 0.1 - 0.2
- **Poor (3/10)**: Ratio < 0.1 (stagnant pool)

**Tooltip:**
> ðŸŠ **Pool Activity Check**
>
> This pool has HIGH trading volume relative to its size.
> - More trades = More fees for you!
> - Current: $450K volume / $1.2M TVL = 37.5%
> - Status: âœ… Excellent fee generation

**Warning (if poor):**
> âš ï¸ **Shallow Pool Warning**
>
> Low trading activity detected. You may earn minimal fees.
> Consider pools with higher volume-to-TVL ratios.

---

#### 2. **Impermanent Loss Risk**

**Formula:** Based on token correlation and historical volatility

**Risk Levels:**
- **Low**: Stablecoin pairs (USDC/USDT, DAI/USDC)
- **Medium**: Correlated pairs (WETH/stETH, WBTC/renBTC)
- **High**: Uncorrelated pairs (USDC/WETH, WETH/LINK)
- **Extreme**: Volatile altcoins

**Tooltip:**
> ðŸ’§ **Impermanent Loss Forecast**
>
> Risk Level: MEDIUM ðŸŸ¡
> - USDC and WETH prices may diverge
> - Estimated IL at +20% WETH price: -2.5%
> - Your fees need to outpace IL
>
> ðŸ“Š Current APR (12.5%) > IL Risk âœ…

**Warning (if extreme):**
> ðŸš¨ **Dangerous Waters!**
>
> HIGH impermanent loss risk detected!
> - Volatile token pair
> - Losses could exceed fee earnings
> - Only join if you believe prices will stay stable

---

#### 3. **Range Efficiency**

**For User Positions:**

**Calculation:**
```typescript
Range Width = (tickUpper - tickLower) / tickSpacing
Optimal Width = Based on volatility (7-30 days)

Efficiency = 100 - (abs(Range Width - Optimal Width) / Optimal Width Ã— 100)
```

**Scoring:**
- **Perfect (90-100)**: Within 10% of optimal
- **Good (75-89)**: Within 25% of optimal
- **Needs Adjustment (50-74)**: 25-50% off optimal
- **Poor (<50)**: Very wide or very narrow

**Tooltip (Good Range):**
> ðŸŽ¯ **Perfect Position!**
>
> Your range is optimally sized for this pool.
> - Current Price: In your range âœ…
> - Range Width: Just right for volatility
> - Fee Capture: Maximized!

**Warning (Too Wide):**
> ðŸ“ **Range Too Wide**
>
> Your range is very wide - you're diluting your fees!
> - Current: Â±50% price range
> - Optimal: Â±15% for this pair
> - Fix: Narrow your range to earn 3x more fees

**Warning (Too Narrow):**
> âš ï¸ **Range Too Tight!**
>
> Risk: Price may exit your range soon
> - Current: Â±2% range
> - Volatility: 8% daily
> - Likely to go out of range: 85%

---

#### 4. **Fee Tier Analysis**

**For Each Pool:**

**Logic:**
```typescript
Optimal Fee Tier:
  - Stablecoin pairs: 0.01% or 0.05%
  - Blue chip pairs: 0.05% or 0.3%
  - Volatile pairs: 0.3% or 1%
  - Exotic pairs: 1%
```

**Tooltip (Correct Tier):**
> ðŸ’Ž **Perfect Fee Tier**
>
> 0.3% fee is ideal for USDC/WETH
> - Balances volume and fee income
> - Competitive with other pools âœ…

**Warning (Wrong Tier):**
> ðŸ¤” **Fee Tier Mismatch**
>
> This pool has a 1% fee tier, but:
> - USDC/WETH is a blue chip pair
> - Most volume is in 0.3% pools
> - Consider the 0.3% pool instead for more fees

---

#### 5. **Out of Range Detection**

**Real-time Monitoring:**

**Status:**
- **In Range**: Price is within your ticks
- **Approaching Edge**: Price within 5% of tick boundary
- **Out of Range**: Price has exited your range

**Tooltip (Approaching):**
> ðŸŠ **Getting Shallow!**
>
> Price is nearing your range edge:
> - Current: $1,850 USDC/WETH
> - Your Upper Tick: $1,900
> - Distance: 2.7%
>
> âš ï¸ Consider adjusting your range or monitoring closely

**Warning (Out of Range):**
> ðŸš¨ **You're On The Deck!**
>
> Your position is OUT OF RANGE
> - Earning 0 fees âŒ
> - Price: $2,100
> - Your Range: $1,500 - $1,900
>
> Actions:
> 1. Exit and re-enter with new range
> 2. Wait for price to return
> 3. Collect fees and reassess

---

#### 6. **Pool Age & Stability**

**Metrics:**
- Pool age (days since creation)
- TVL consistency (standard deviation)
- Volume consistency

**Scoring:**
- **Mature (100)**: >90 days, stable TVL, consistent volume
- **Established (75)**: 30-90 days, mostly stable
- **New (50)**: 7-30 days, some volatility
- **Experimental (25)**: <7 days, unstable

**Tooltip (Mature):**
> ðŸ›ï¸ **Established Pool**
>
> This pool has a proven track record:
> - Age: 156 days
> - TVL Stability: Very stable
> - Volume: Consistent
> - Status: âœ… Safe to join

**Warning (New):**
> ðŸ†• **New Pool Alert**
>
> This pool is very new:
> - Age: 3 days
> - TVL: $50K (may be volatile)
> - Volume: Unproven
>
> âš ï¸ Higher risk - wait for stability or start small

---

#### 7. **Concentration Risk**

**For Pools:**

**Formula:** `Top 10 LPs TVL / Total TVL`

**Scoring:**
- **Healthy (<50%)**: Decentralized
- **Moderate (50-75%)**: Some concentration
- **Risky (75-90%)**: Highly concentrated
- **Dangerous (>90%)**: Whale-dominated

**Tooltip (Healthy):**
> ðŸ‘¥ **Well Distributed**
>
> This pool has healthy LP distribution:
> - Top 10 LPs: 35% of TVL
> - Your impact: Minimal
> - Whale risk: Low âœ…

**Warning (Concentrated):**
> ðŸ‹ **Whale Alert!**
>
> This pool is dominated by large LPs:
> - Top 10 LPs: 88% of TVL
> - Risk: Large withdrawals could drain pool
> - Caution advised âš ï¸

---

### Conditional Formatting

#### Visual Indicators

**Pool Cards (Dashboard):**

```typescript
if (poolHealthScore >= 75) {
  border = "3px solid #32CD32" // Green glow
  badge = "â­ HOT POOL"
}

if (volumeToTVL < 0.1) {
  overlay = "ðŸ¥¶ COLD POOL" // Blue tint
  warning = "Low activity"
}

if (poolAge < 7) {
  badge = "ðŸ†• NEW"
  border = "2px dashed #FFD700"
}
```

**Position Cards (Wallet):**

```typescript
if (outOfRange) {
  background = "linear-gradient(135deg, #FF6B9D, #FF1493)" // Hot pink
  status = "ðŸš¨ OUT OF RANGE"
  pulseAnimation = true
}

if (approachingEdge) {
  background = "linear-gradient(135deg, #FFD700, #FF8C42)" // Orange
  status = "âš ï¸ NEAR EDGE"
  badge = "Monitor Closely"
}

if (inRange && rangeEfficiency > 80) {
  background = "linear-gradient(135deg, #00D4FF, #32CD32)" // Aqua to green
  status = "âœ… OPTIMAL"
  badge = "ðŸŽ¯ Perfect!"
}
```

---

### Notification System

#### Smart Alerts (Lifeguard Categories)

**ðŸ”´ Critical Alerts** (Immediate Action Required):
1. **Position Out of Range**
   ```
   ðŸš¨ Lifeguard Alert: Position Not Earning!
   Your USDC/WETH position is out of range
   Pool: SoakingHog | Fee Tier: 0.3%
   Current Price: $2,100 (above your $1,900 limit)
   Earning: $0/day âŒ
   [Rebalance Now] [View Position]
   ```

2. **Depeg Detected**
   ```
   ðŸ”´ CRITICAL: Stablecoin Depeg Detected!
   USDC trading at $0.985 (-1.5% from peg)
   Duration: 8 minutes
   Lifeguard recommends: EXIT IMMEDIATELY
   [Emergency Exit] [Monitor]
   ```

3. **Smart Contract Risk**
   ```
   â›” Security Alert
   New vulnerability discovered in pool protocol
   Severity: High
   Recommended action: Withdraw liquidity
   [View Details] [Withdraw Now]
   ```

**ðŸŸ¡ Warning Alerts** (Review Soon):
4. **Approaching Range Edge**
   ```
   âš ï¸ Lifeguard Notice: Getting Shallow!
   Price nearing your range edge (18% away)
   Current: $1,850 | Your Upper Limit: $1,900
   Expected to exit range in: 2-4 hours
   [Adjust Range] [Monitor] [Dismiss]
   ```

5. **Profitability Warning**
   ```
   âš ï¸ Underwater Position
   Fees < IL break-even for 8 days
   Net P&L: -$23 (-0.5%)
   Lifeguard suggests: Consider exiting or widening range
   [View Analysis] [Adjust Strategy]
   ```

6. **Gas Optimization**
   ```
   â° Optimal Rebalancing Window
   Gas prices: 15 gwei (Low)
   Estimated savings: $12 vs normal
   Lifeguard suggests: Rebalance now
   [Rebalance] [Schedule Later]
   ```

**ðŸ”µ Info Alerts** (FYI):
7. **Fee Collection Reminder**
   ```
   ðŸ’° Fees Ready to Collect!
   You have $45.67 in uncollected fees across 3 pools
   Collecting now costs: $8 gas
   Net benefit: $37.67
   [Collect All] [View Breakdown] [Wait]
   ```

8. **Opportunity Detected**
   ```
   ðŸŒŸ Lifeguard Found Better Pool!
   USDC/WETH 0.05% - Rating: â­â­â­â­â­
   APR: +3.2% vs your current position
   Migration cost: $18 | Break-even: 28 days
   [Compare Pools] [Migrate] [Dismiss]
   ```

9. **Weekly Performance Summary**
   ```
   ðŸ“Š Your Pool Party Week in Review
   â€¢ Total fees earned: $127 (+23% vs last week)
   â€¢ All positions healthy (avg: 78/100)
   â€¢ Lifeguard prevented 1 out-of-range event
   â€¢ 2 optimization suggestions available
   [View Full Report]
   ```

**Smart Batching Logic:**
```typescript
const notificationRules = {
  batchWindow: 15 minutes,
  maxPerHour: 5,
  quietHours: user.preferences.quietHours,

  // Critical alerts bypass all limits
  critical: {
    immediate: true,
    ignoreQuietHours: true,
    delivery: ["in_app", "push", "email"],
    retryUntilAcknowledged: true
  },

  // Group similar alerts
  groupSimilar: true,  // "3 positions approaching range edge"
  prioritySort: true   // Show highest value positions first
};
```

**Notification Preferences:**
- In-app: Always (Lifeguard core feature)
- Push notifications: Configurable (critical only, all, or none)
- Email: Digest options (immediate, daily, weekly)
- SMS: Critical only (premium feature)
- Webhook: For power users / bot integration

---

### Educational Scaffolding

The Lifeguard educates users through contextual learning, not overwhelming documentation.

#### Contextual Tooltips

**Every DeFi term has an interactive tooltip:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Impermanent Loss (IL)     [?]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ“š Simple Explanation:          â”‚
â”‚ IL happens when token prices    â”‚
â”‚ change while you're providing   â”‚
â”‚ liquidity. Think of it like     â”‚
â”‚ automatically selling winners   â”‚
â”‚ and buying losers.              â”‚
â”‚                                 â”‚
â”‚ ðŸŠ Pool Party Analogy:          â”‚
â”‚ If you dive into a pool with    â”‚
â”‚ equal amounts of two tokens,    â”‚
â”‚ but one "floats up" (price â†‘),  â”‚
â”‚ you'll have less of it when you â”‚
â”‚ get out.                        â”‚
â”‚                                 â”‚
â”‚ ðŸ’¡ Lifeguard Protection:        â”‚
â”‚ We help you pick pools where    â”‚
â”‚ fees typically beat IL, and     â”‚
â”‚ alert you if IL gets too high.  â”‚
â”‚                                 â”‚
â”‚ Current Position IL: -$12       â”‚
â”‚ Fees Earned: +$47               â”‚
â”‚ Net: +$35 âœ…                    â”‚
â”‚                                 â”‚
â”‚ [See Example] [Learn More]      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### Onboarding Wizard

**Step 1: Experience Level**
```
Welcome to Pool Party! ðŸŠâ€â™‚ï¸

The Lifeguard wants to customize your experience.
What's your DeFi experience level?

â—‹ New to DeFi
  â””â”€ We'll recommend safe options and explain everything

â—‹ Some experience
  â””â”€ You choose pools, Lifeguard guides and protects

â—‹ Experienced
  â””â”€ Full control with advanced features unlocked

[Continue]
```

**Step 2: Risk Tolerance**
```
How much risk are you comfortable with?

â—‹ Conservative (Recommended for beginners)
  â””â”€ Stablecoins only
  â””â”€ Expected APR: 5-8%
  â””â”€ IL Risk: Very Low

â—‹ Balanced
  â””â”€ Mix of stable and volatile pairs
  â””â”€ Expected APR: 10-15%
  â””â”€ IL Risk: Medium

â—‹ Aggressive
  â””â”€ Volatile pairs for higher rewards
  â””â”€ Expected APR: 15-30%+
  â””â”€ IL Risk: High

ðŸ’¡ You can change this later
[Continue]
```

**Step 3: Time Commitment**
```
How much time can you dedicate to managing positions?

â—‹ Set and forget (Recommended)
  â””â”€ Lifeguard automation: ON
  â””â”€ Auto-rebalancing with approval
  â””â”€ Weekly check-ins suggested

â—‹ Weekly monitoring
  â””â”€ Manual rebalancing
  â””â”€ Lifeguard suggestions

â—‹ Active daily management
  â””â”€ Full manual control
  â””â”€ Advanced metrics

[Continue]
```

**Step 4: Recommended Pool + Education**
```
Based on your answers, Lifeguard recommends:

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸŠ Your First Pool: USDC/DAI       â”‚
â”‚                                     â”‚
â”‚ Why this pool?                      â”‚
â”‚ âœ“ Both tokens are stablecoins      â”‚
â”‚   (prices stay near $1.00)          â”‚
â”‚ âœ“ Very low impermanent loss risk   â”‚
â”‚   (<0.1% historically)              â”‚
â”‚ âœ“ Steady 5-8% APY                  â”‚
â”‚ âœ“ Battle-tested (3+ years)         â”‚
â”‚ âœ“ Lifeguard Safety Score: 85/100   â”‚
â”‚                                     â”‚
â”‚ Expected outcomes (for $1,000):     â”‚
â”‚ â€¢ Monthly fees: ~$5-7               â”‚
â”‚ â€¢ IL risk: Very low                 â”‚
â”‚ â€¢ Time needed: 5 min/month          â”‚
â”‚                                     â”‚
â”‚ Risks to know:                      â”‚
â”‚ âš ï¸ Stablecoin depeg (rare)          â”‚
â”‚ âš ï¸ Smart contract risk (mitigated)  â”‚
â”‚                                     â”‚
â”‚ ðŸ›¡ï¸ Lifeguard will:                  â”‚
â”‚ âœ“ Monitor for depeg 24/7            â”‚
â”‚ âœ“ Alert if anything changes         â”‚
â”‚ âœ“ Suggest optimal range             â”‚
â”‚ âœ“ Track all fees and IL             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

[Proceed with this pool] [See other options]
```

#### Real-Time Learning Moments

**When IL Occurs:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“š Lifeguard Learning Moment    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Your ETH/USDC position just     â”‚
â”‚ experienced impermanent loss.   â”‚
â”‚                                 â”‚
â”‚ What happened:                  â”‚
â”‚ ETH moved from $3,400 to $3,600 â”‚
â”‚ (+5.9%). Your LP automatically  â”‚
â”‚ rebalanced, selling some ETH    â”‚
â”‚ at lower prices.                â”‚
â”‚                                 â”‚
â”‚ The good news:                  â”‚
â”‚ You earned $23 in fees during   â”‚
â”‚ this move, covering 82% of IL.  â”‚
â”‚ This is normal and expected!    â”‚
â”‚                                 â”‚
â”‚ ðŸ’¡ Pro Tip:                     â”‚
â”‚ If ETH returns to $3,400, the   â”‚
â”‚ IL disappears completely. This  â”‚
â”‚ is why it's called "impermanent"â”‚
â”‚                                 â”‚
â”‚ Your Position Status:           â”‚
â”‚ IL: -$28                        â”‚
â”‚ Fees: +$23                      â”‚
â”‚ Net: -$5 (temporary)            â”‚
â”‚                                 â”‚
â”‚ [Got it] [Learn more] [Don't show again]â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Transaction Safety System

Before every transaction, The Lifeguard performs comprehensive safety checks:

#### Pre-Transaction Validation

```typescript
function validateTransactionSafety(tx: Transaction): {
  safe: boolean;
  checks: SafetyCheck[];
  simulation: SimulationResult;
  recommendation: string;
} {
  const checks: SafetyCheck[] = [];

  // 1. Simulate transaction
  const simulation = simulateTransaction(tx);
  if (simulation.willFail) {
    return {
      safe: false,
      reason: `Transaction will fail: ${simulation.error}`,
      recommendation: 'â›” DO NOT PROCEED'
    };
  }

  // 2. Check slippage
  if (simulation.outputTokens < tx.minExpected * 0.95) {
    checks.push({
      severity: 'high',
      issue: 'Slippage higher than expected',
      details: `Expected ${tx.minExpected}, will receive ${simulation.outputTokens}`,
      recommendation: 'Increase slippage tolerance or try later'
    });
  }

  // 3. Check gas cost
  if (simulation.gasCost > tx.gasLimit) {
    checks.push({
      severity: 'medium',
      issue: 'High gas cost',
      details: `$${simulation.gasCost.toFixed(2)} - peak hours`,
      recommendation: 'Waiting 2-4 hours could save $3-5'
    });
  }

  // 4. Malicious contract check
  if (MALICIOUS_CONTRACTS.has(tx.targetAddress)) {
    return {
      safe: false,
      reason: 'Target contract flagged as malicious',
      recommendation: 'â›” DO NOT PROCEED - SCAM DETECTED'
    };
  }

  // 5. Unlimited approval warning
  if (tx.approvalAmount === UNLIMITED) {
    checks.push({
      severity: 'medium',
      issue: 'Unlimited token approval',
      details: 'Contract can spend any amount',
      recommendation: 'Consider approving only required amount'
    });
  }

  // 6. Oracle price verification
  const oraclePrice = getOraclePrice(tx.pair);
  if (Math.abs(simulation.effectivePrice - oraclePrice) > 0.02) {
    checks.push({
      severity: 'high',
      issue: 'Price discrepancy detected',
      details: 'On-chain price differs from oracle by >2%',
      recommendation: 'Possible manipulation - review carefully'
    });
  }

  const safe = checks.every(c => c.severity !== 'critical');

  return {
    safe,
    checks,
    simulation,
    recommendation: generateSafetyRecommendation(checks)
  };
}
```

**Transaction Review Screen:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ›¡ï¸ Lifeguard Transaction Safety Review     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                             â”‚
â”‚ Action: Add liquidity to USDC/DAI          â”‚
â”‚ Amount: 1,000 USDC + 1,000 DAI             â”‚
â”‚                                             â”‚
â”‚ Lifeguard Safety Checks:                   â”‚
â”‚ âœ… Simulation successful                    â”‚
â”‚ âœ… Gas cost reasonable ($8.42)              â”‚
â”‚ âœ… Smart contract verified (Uniswap V3)     â”‚
â”‚ âœ… Price within expected range              â”‚
â”‚ âœ… No security flags                        â”‚
â”‚ âš ï¸  High gas period (peak hours)            â”‚
â”‚    â””â”€ Could save $3 by waiting 2-4 hours   â”‚
â”‚                                             â”‚
â”‚ You will receive:                           â”‚
â”‚ â€¢ LP NFT #482,391                           â”‚
â”‚ â€¢ Initial position value: $2,000            â”‚
â”‚ â€¢ Estimated APY: 6.2% (30d average)         â”‚
â”‚ â€¢ Range: 0.998 - 1.002 USDC per DAI         â”‚
â”‚                                             â”‚
â”‚ This transaction will:                      â”‚
â”‚ 1. Approve USDC spending (if needed)        â”‚
â”‚ 2. Approve DAI spending (if needed)          â”‚
â”‚ 3. Deposit both tokens to pool             â”‚
â”‚ 4. Mint LP NFT to your wallet              â”‚
â”‚                                             â”‚
â”‚ Total cost: ~$8.42 gas                      â”‚
â”‚                                             â”‚
â”‚ ðŸ›¡ï¸ Lifeguard Verdict: SAFE TO PROCEED      â”‚
â”‚                                             â”‚
â”‚ [Cancel] [â° Schedule for off-peak] [Proceed]â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ—ï¸ Implementation Plan

### Phase 1: Theme Foundation (Week 1-2) - âœ… **COMPLETE**

**Status:** In Progress

See [Progress Tracker](#ðŸ“Š-progress-tracker) above for detailed completion status.

**Tasks Completed:**
1. âœ… Created Pool Party color palette and design tokens
2. âœ… Implemented PositionCard component with collapsible UI
3. âœ… Implemented wave/ripple/splash animations (CSS only)
4. âœ… Added Pool Party branding (ðŸŠ emoji, themed text)
5. âœ… Redesigned wallet page with membership-style cards

**Files Created:**
- âœ… `src/lib/lifeguard/healthScore.ts` (full implementation)
- âœ… `src/components/PositionCard.tsx` (mobile-first)

**Files Modified:**
- âœ… `src/app/globals.css` (complete Pool Party theme)
- âœ… `src/components/WalletPositions.tsx` (card redesign)

**Not Implemented (Deferred):**
- â¸ï¸ `PoolCard.tsx` for dashboard (pool browsing) - Defer to Phase 3
- â¸ï¸ `PoolHeroSection.tsx` - Defer to Phase 3
- â¸ï¸ `WaterAnimation.tsx` - Using CSS animations instead
- â¸ï¸ `src/app/page.tsx` dashboard redesign - Defer to Phase 3
- â¸ï¸ `src/app/pool/[id]/page.tsx` - Defer to Phase 3
- â¸ï¸ `tailwind.config.js` - Using CSS custom properties instead

---

### Phase 2: Advisor Metrics Engine (Week 3-4) - â³ **IN PROGRESS**

**Tasks:**
1. Create advisor scoring algorithms
2. Build metric calculation functions
3. Implement pool health scoring
4. Add tooltips to all metrics
5. Create advisor badge components

**New Files:**
- `src/lib/advisor/poolHealth.ts` (scoring logic)
- `src/lib/advisor/metrics.ts` (all calculations)
- `src/lib/advisor/thresholds.ts` (configuration)
- `src/components/advisor/PoolRating.tsx`
- `src/components/advisor/MetricTooltip.tsx`
- `src/components/advisor/AdvisorBadge.tsx`

**Metrics to Implement:**
```typescript
// src/lib/advisor/metrics.ts
export function calculateVolumeToTVLRatio(pool)
export function assessILRisk(token0, token1)
export function evaluateFee Tier(pool, tokenPair)
export function calculateRangeEfficiency(position)
export function assessPoolStability(historicalData)
export function detectConcentrationRisk(pool)
export function isOutOfRange(position, currentTick)
```

---

### Phase 3: Conditional Formatting (Week 5)

**Tasks:**
1. Implement color-coded pool cards
2. Add visual status indicators
3. Create pulsing/animated warnings
4. Build notification badge system
5. Add "health bar" visualizations

**Component Enhancements:**
- Pool cards show health score badge
- Position cards pulse when out of range
- Dashboard filters by health score
- Warnings overlay on risky pools

---

### Phase 4: Notification System (Week 6)

**Tasks:**
1. Build notification infrastructure
2. Implement real-time monitoring
3. Create notification UI/UX
4. Add user preferences
5. Implement digest emails

**New Files:**
- `src/lib/notifications/monitor.ts`
- `src/lib/notifications/templates.ts`
- `src/components/NotificationCenter.tsx`
- `src/components/NotificationToast.tsx`

---

### Phase 5: Polish & Testing (Week 7-8)

**Tasks:**
1. User testing & feedback
2. Animation refinement
3. Mobile responsiveness
4. Performance optimization
5. E2E tests for advisor features

---

## ðŸ“Š Data Requirements

### Additional Database Fields

**pools table:**
```sql
ALTER TABLE pools ADD COLUMN health_score INTEGER;
ALTER TABLE pools ADD COLUMN concentration_risk DECIMAL;
ALTER TABLE pools ADD COLUMN stability_score INTEGER;
```

**New table: pool_advisor_metrics**
```sql
CREATE TABLE pool_advisor_metrics (
  pool_id TEXT PRIMARY KEY,
  volume_to_tvl_ratio DECIMAL,
  il_risk_level TEXT, -- 'low', 'medium', 'high', 'extreme'
  optimal_fee_tier INTEGER,
  pool_age_days INTEGER,
  top_10_lp_concentration DECIMAL,
  last_updated TIMESTAMP,
  FOREIGN KEY (pool_id) REFERENCES pools(id)
);
```

---

## ðŸŽ“ Best Practices Reference (Research-Based)

### Comprehensive Advisor Metrics & Formulas

This section integrates detailed DeFi LP research into actionable metrics and thresholds.

---

#### ðŸ“ Impermanent Loss (IL) Calculations

**Core IL Formula:**
```typescript
// For a 2-asset 50/50 pool when one asset's price changes by factor r
function calculateIL(priceChangeRatio: number): number {
  const r = priceChangeRatio;
  return (2 * Math.sqrt(r)) / (1 + r) - 1;
}

// Example: If ETH doubles (r = 2), IL = -5.72%
// Example: If ETH goes up 20% (r = 1.2), IL = -0.41%
// Example: If ETH goes up 50% (r = 1.5), IL = -2.02%
```

**Expected IL Over Time:**
```typescript
// For small price changes over time with volatility Ïƒ
function expectedIL(volatility: number, timeDays: number): number {
  const t = timeDays / 365; // Convert to years
  return 0.5 * Math.pow(volatility, 2) * t;
}

// Example: 80% annual volatility for 30 days
// E[IL] = 0.5 * (0.8^2) * (30/365) = 2.6%
```

**IL Break-even Volume Requirements:**

| Price Change | IL % | Volume Needed (0.05% fee) | Volume Needed (0.3% fee) | Volume Needed (1% fee) |
|--------------|------|---------------------------|--------------------------|------------------------|
| Â±10% (r=1.1) | 0.41% | 2.2x TVL | 1.37x TVL | 0.41x TVL |
| Â±20% (r=1.2) | 0.41% | 8.2x TVL | 1.37x TVL | 0.41x TVL |
| Â±50% (r=1.5) | 2.02% | 40x TVL | 6.73x TVL | 2.02x TVL |
| Â±100% (r=2.0) | 5.72% | 114x TVL | 19.1x TVL | 5.72x TVL |

**Implementation:**
```typescript
// src/lib/advisor/impermanentLoss.ts
export function volumeToOffsetIL(
  priceChangeRatio: number,
  feeTier: number // e.g., 0.003 for 0.3%
): number {
  const il = Math.abs(calculateIL(priceChangeRatio));
  return il / feeTier; // Returns multiple of TVL needed
}

// Alert user if expected price move requires unrealistic volume
export function assessILRisk(
  pool: Pool,
  historicalVolatility: number
): {
  level: 'low' | 'medium' | 'high' | 'extreme';
  expectedMove30d: number;
  volumeNeeded: number;
  isViable: boolean;
} {
  // Expected 30-day price move based on volatility
  const expectedMove = 1 + (historicalVolatility * Math.sqrt(30 / 365));
  const il = calculateIL(expectedMove);
  const volumeNeeded = volumeToOffsetIL(expectedMove, pool.feeTier / 1_000_000);
  const currentVolumeRatio = pool.volume24h / pool.tvl;
  const viableVolume = volumeNeeded / 30; // Daily volume needed

  return {
    level: il < 0.01 ? 'low' : il < 0.03 ? 'medium' : il < 0.06 ? 'high' : 'extreme',
    expectedMove30d: (expectedMove - 1) * 100,
    volumeNeeded: volumeNeeded,
    isViable: currentVolumeRatio > viableVolume
  };
}
```

---

#### ðŸ“Š Volume-to-TVL Ratio Analysis

**Scoring Thresholds (Daily Ratio):**
```typescript
export function scoreVolumeToTVL(dailyVolume: number, tvl: number): {
  score: number; // 0-10
  rating: string;
  description: string;
} {
  const ratio = dailyVolume / tvl;

  if (ratio > 1.0) return {
    score: 10,
    rating: 'Excellent',
    description: 'Exceptional trading activity - premium fee generation'
  };

  if (ratio > 0.5) return {
    score: 9,
    rating: 'Excellent',
    description: 'Very high volume - great for earning fees'
  };

  if (ratio > 0.3) return {
    score: 7,
    rating: 'Good',
    description: 'Healthy trading activity'
  };

  if (ratio > 0.15) return {
    score: 5,
    rating: 'Fair',
    description: 'Moderate activity - fees may not offset IL'
  };

  if (ratio > 0.05) return {
    score: 3,
    rating: 'Poor',
    description: 'Low trading volume - poor fee generation'
  };

  return {
    score: 1,
    rating: 'Very Poor',
    description: 'Stagnant pool - avoid'
  };
}
```

**Research Insight:**
- Pools with >1.0 daily V:TVL ratio are exceptional (entire pool liquidity trades daily)
- Pools with <0.1 ratio struggle to generate enough fees to offset IL
- Target: >0.15 minimum for volatile pairs, >0.05 for stablecoins

---

#### ðŸŽ¯ Range Width Optimization

**Blueprint A: Blue-Chip Volatile Pairs (ETH/USDC, WBTC/USDC)**

```typescript
export function calculateOptimalRange(
  currentPrice: number,
  dailyVolatility: number, // e.g., 0.04 for 4%
  strategyType: 'conservative' | 'moderate' | 'aggressive'
): { lowerTick: number; upperTick: number; width: number } {

  // Use Â±2 standard deviations for ~95% coverage
  const stdDevMultiplier = strategyType === 'conservative' ? 3 :
                            strategyType === 'moderate' ? 2 : 1.5;

  const rangeWidth = dailyVolatility * stdDevMultiplier * 2; // Both directions

  const lowerPrice = currentPrice * (1 - rangeWidth / 2);
  const upperPrice = currentPrice * (1 + rangeWidth / 2);

  return {
    lowerTick: priceToTick(lowerPrice),
    upperTick: priceToTick(upperPrice),
    width: rangeWidth * 100 // As percentage
  };
}

// Example: ETH at $1600, daily vol = 4%
// Moderate strategy: Â±(4% Ã— 2) = Â±8% range
// Range: $1,472 to $1,728
```

**Blueprint B: Stablecoin Pairs (USDC/DAI, USDC/USDT)**

```typescript
export function calculateStablecoinRange(): {
  lowerPrice: number;
  upperPrice: number;
  depegThreshold: number;
} {
  return {
    lowerPrice: 0.998,  // Â±0.2% range
    upperPrice: 1.002,
    depegThreshold: 0.995 // Exit if <$0.995
  };
}
```

**Blueprint C: Long-Tail Tokens**

```typescript
export function calculateLongTailRange(currentPrice: number): {
  lowerPrice: number;
  upperPrice: number;
} {
  // Very wide range: Â±80% to capture extreme volatility
  return {
    lowerPrice: currentPrice * 0.2,  // -80%
    upperPrice: currentPrice * 3.0   // +200%
  };
}
```

**Range Efficiency Scoring:**

```typescript
export function evaluateRangeEfficiency(
  position: Position,
  optimalWidth: number
): { score: number; recommendation: string } {
  const actualWidth = (position.tickUpper - position.tickLower) / tickSpacing;
  const deviation = Math.abs(actualWidth - optimalWidth) / optimalWidth;

  if (deviation < 0.1) return {
    score: 95,
    recommendation: 'Perfect - range is optimally sized'
  };

  if (deviation < 0.25) return {
    score: 80,
    recommendation: 'Good - minor adjustment could improve'
  };

  if (deviation < 0.5) return {
    score: 60,
    recommendation: actualWidth > optimalWidth ?
      'Too wide - narrowing could 3x fees' :
      'Too narrow - risk of going out of range'
  };

  return {
    score: 30,
    recommendation: 'Poor range sizing - immediate adjustment needed'
  };
}
```

---

#### ðŸš¨ Exit Triggers & Warning Thresholds

**1. Stablecoin Depeg Detection**
```typescript
export const DEPEG_THRESHOLDS = {
  WARNING: 0.005,    // 0.5% deviation - prepare to exit
  CRITICAL: 0.01,    // 1% deviation - exit immediately
  EMERGENCY: 0.02    // 2% deviation - emergency exit (likely too late)
};

export function checkDepegRisk(stablecoinPrice: number): {
  alert: 'none' | 'warning' | 'critical' | 'emergency';
  action: string;
} {
  const deviation = Math.abs(1 - stablecoinPrice);

  if (deviation > DEPEG_THRESHOLDS.EMERGENCY) return {
    alert: 'emergency',
    action: 'EXIT NOW - Severe depeg detected'
  };

  if (deviation > DEPEG_THRESHOLDS.CRITICAL) return {
    alert: 'critical',
    action: 'EXIT IMMEDIATELY - Withdraw all liquidity'
  };

  if (deviation > DEPEG_THRESHOLDS.WARNING) return {
    alert: 'warning',
    action: 'PREPARE TO EXIT - Monitor closely'
  };

  return { alert: 'none', action: 'Continue monitoring' };
}
```

**2. Volatility Spike Detection**
```typescript
export function checkVolatilitySpike(
  hourlyPriceChange: number,
  annualizedVol: number
): { shouldExit: boolean; reason: string } {
  // Exit if hourly move >6-8%
  if (Math.abs(hourlyPriceChange) > 0.07) return {
    shouldExit: true,
    reason: 'Extreme hourly volatility - IL risk too high'
  };

  // Exit if annualized vol >100%
  if (annualizedVol > 1.0) return {
    shouldExit: true,
    reason: 'Volatility spike detected - pull liquidity until stabilizes'
  };

  return { shouldExit: false, reason: 'Volatility within acceptable range' };
}
```

**3. Out of Range Duration**
```typescript
export function evaluateOutOfRangePosition(
  position: Position,
  hoursOutOfRange: number
): { action: 'wait' | 'monitor' | 'adjust' | 'exit'; urgency: string } {

  if (hoursOutOfRange < 6) return {
    action: 'wait',
    urgency: 'low'
  };

  if (hoursOutOfRange < 24) return {
    action: 'monitor',
    urgency: 'medium'
  };

  if (hoursOutOfRange < 168) return { // 7 days
    action: 'adjust',
    urgency: 'high'
  };

  return {
    action: 'exit',
    urgency: 'critical - earning zero fees for too long'
  };
}
```

**4. Position Value vs HODL Stop-Loss**
```typescript
export function calculatePnLvsHODL(
  position: Position,
  currentPrice: number,
  feesEarned: number
): { pnlVsHodl: number; shouldExit: boolean } {

  const currentValue = calculatePositionValue(position, currentPrice) + feesEarned;
  const hodlValue = position.initialToken0 * currentPrice + position.initialToken1;

  const pnlVsHodl = ((currentValue - hodlValue) / hodlValue) * 100;

  // Exit if 5% or more below HODL
  return {
    pnlVsHodl,
    shouldExit: pnlVsHodl < -5
  };
}
```

**5. Pool Health Degradation**
```typescript
export const HEALTH_THRESHOLDS = {
  EXIT: 40,          // Exit immediately
  WARNING: 60,       // Monitor daily
  GOOD: 75,          // Normal monitoring
  EXCELLENT: 90      // Premium pool
};
```

---

#### ðŸŽ² Rebalancing Decision Logic

**Trigger Conditions:**
```typescript
export function shouldRebalance(
  position: Position,
  currentTick: number,
  feesAccumulated: number,
  positionValue: number
): {
  shouldRebalance: boolean;
  reason: string;
  priority: 'low' | 'medium' | 'high';
} {

  // 1. Out of range - highest priority
  if (currentTick < position.tickLower || currentTick > position.tickUpper) {
    return {
      shouldRebalance: true,
      reason: 'Position is out of range - earning zero fees',
      priority: 'high'
    };
  }

  // 2. Price near edge (within 5%)
  const rangeWidth = position.tickUpper - position.tickLower;
  const distanceToLower = currentTick - position.tickLower;
  const distanceToUpper = position.tickUpper - currentTick;

  if (distanceToLower < rangeWidth * 0.05 || distanceToUpper < rangeWidth * 0.05) {
    return {
      shouldRebalance: true,
      reason: 'Price approaching range edge',
      priority: 'medium'
    };
  }

  // 3. Price drifted >50% of range width from center
  const center = (position.tickLower + position.tickUpper) / 2;
  const drift = Math.abs(currentTick - center) / rangeWidth;

  if (drift > 0.25) {
    return {
      shouldRebalance: true,
      reason: 'Price has drifted significantly - recentering optimal',
      priority: 'medium'
    };
  }

  // 4. Fees accumulated to meaningful threshold (0.5-2% of position)
  const feeRatio = feesAccumulated / positionValue;
  if (feeRatio > 0.02) { // 2% threshold for mainnet
    return {
      shouldRebalance: true,
      reason: 'Significant fees accumulated - compound and recenter',
      priority: 'low'
    };
  }

  return {
    shouldRebalance: false,
    reason: 'Position is performing well',
    priority: 'low'
  };
}
```

---

#### ðŸŠ Pool Selection Framework

**Entry Criteria Checklist:**

```typescript
export interface PoolScreeningCriteria {
  // Security
  contractAudited: boolean;          // REQUIRED
  knownExploits: boolean;            // Must be false
  adminCanDrain: boolean;            // Must be false

  // Fundamentals
  poolAgeDays: number;               // >30 days (or >7 for blue-chip)
  volumeToTVL24h: number;            // >0.15 (>0.05 for stables)
  healthScore: number;               // >60

  // Risk
  top10LPConcentration: number;      // <75%
  hasUpcomingUnlocks: boolean;       // Prefer false
  bridgedAssetRisk: boolean;         // Note if true

  // IL Protection
  expectedILMonthly: number;         // <fees expected
  feeTierAppropriate: boolean;       // Validated
}

export function shouldEnterPool(pool: Pool, criteria: PoolScreeningCriteria): {
  decision: 'enter' | 'watch' | 'avoid';
  reasoning: string[];
  maxAllocation: number; // % of portfolio
} {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Security fails = avoid
  if (!criteria.contractAudited) issues.push('No audit - contract risk');
  if (criteria.knownExploits) issues.push('Known exploits exist');
  if (criteria.adminCanDrain) issues.push('Admin can drain funds');

  if (issues.length > 0) return {
    decision: 'avoid',
    reasoning: issues,
    maxAllocation: 0
  };

  // Red flags = watch
  if (criteria.healthScore < 60) warnings.push('Low health score');
  if (criteria.volumeToTVL24h < 0.15) warnings.push('Low volume ratio');
  if (criteria.top10LPConcentration > 0.75) warnings.push('Whale dominated');
  if (criteria.poolAgeDays < 30 && !pool.isBlueChip) warnings.push('Pool too new');

  if (warnings.length >= 2) return {
    decision: 'watch',
    reasoning: warnings,
    maxAllocation: 5 // Small allocation only
  };

  // Calculate safe allocation based on score
  const baseAllocation = criteria.healthScore >= 90 ? 20 :
                          criteria.healthScore >= 75 ? 15 :
                          criteria.healthScore >= 60 ? 10 : 5;

  return {
    decision: 'enter',
    reasoning: ['Pool meets entry criteria'],
    maxAllocation: warnings.length > 0 ? baseAllocation / 2 : baseAllocation
  };
}
```

---

#### ðŸ’Ž Fee Tier Selection Matrix

```typescript
export function selectOptimalFeeTier(
  token0: Token,
  token1: Token,
  volatility30d: number
): {
  recommended: number; // e.g., 3000 for 0.3%
  reasoning: string;
  alternatives: number[];
} {

  const isStablePair = token0.isStable && token1.isStable;
  const isCorrelated = calculateCorrelation(token0, token1) > 0.8;
  const isBlueChip = token0.isBlueChip && token1.isBlueChip;

  // Stablecoin pairs
  if (isStablePair) {
    return {
      recommended: 100, // 0.01%
      reasoning: 'Stablecoin pair - minimal volatility, use tightest tier',
      alternatives: [500] // 0.05% if 0.01% has low liquidity
    };
  }

  // Highly correlated (e.g., WETH/stETH)
  if (isCorrelated) {
    return {
      recommended: 500, // 0.05%
      reasoning: 'Correlated assets - low IL risk, lower fee acceptable',
      alternatives: [3000]
    };
  }

  // Blue-chip uncorrelated (e.g., WETH/USDC)
  if (isBlueChip) {
    if (volatility30d < 0.5) { // <50% annualized
      return {
        recommended: 500,
        reasoning: 'Blue-chip pair, moderate volatility - 0.05% or 0.3%',
        alternatives: [3000]
      };
    } else {
      return {
        recommended: 3000,
        reasoning: 'Blue-chip but volatile - 0.3% to offset IL',
        alternatives: [500]
      };
    }
  }

  // Long-tail / Exotic
  return {
    recommended: 10000, // 1%
    reasoning: 'High volatility/exotic pair - need high fees for IL protection',
    alternatives: [3000]
  };
}
```

---

### Key Risk Thresholds Summary

| Metric | Warning | Critical | Emergency Action |
|--------|---------|----------|------------------|
| **Stablecoin Depeg** | >0.5% off peg | >1% off peg | >2% off peg â†’ EXIT NOW |
| **Volatility (Hourly)** | >4% move | >6% move | >8% â†’ Pull liquidity |
| **Volatility (Annual)** | >80% | >100% | >150% â†’ Exit position |
| **Out of Range** | >6 hours | >24 hours | >7 days â†’ Close position |
| **PnL vs HODL** | -3% | -5% | -7% â†’ Cut losses |
| **Pool Health Score** | <60 | <50 | <40 â†’ Exit immediately |
| **Volume Drop** | -30% | -50% | -70% â†’ Consider exit |
| **TVL Drop** | -20% in week | -40% in week | -60% in day â†’ Vampire attack |
| **Whale Concentration** | >50% | >75% | >90% â†’ High withdrawal risk |
| **Pool Age (new)** | <7 days | <3 days | <1 day â†’ Extreme risk |

---

### Position Sizing Framework

```typescript
export function calculateSafePositionSize(
  totalPortfolio: number,
  pool: Pool,
  healthScore: number,
  ilRiskLevel: 'low' | 'medium' | 'high' | 'extreme'
): {
  recommendedSize: number;
  maxSize: number;
  reasoning: string;
} {

  // Base allocation by health score
  let basePercent = healthScore >= 90 ? 20 :
                     healthScore >= 75 ? 15 :
                     healthScore >= 60 ? 10 : 5;

  // Adjust for IL risk
  const ilMultiplier = ilRiskLevel === 'low' ? 1.0 :
                        ilRiskLevel === 'medium' ? 0.7 :
                        ilRiskLevel === 'high' ? 0.5 : 0.3;

  const recommended = (totalPortfolio * basePercent / 100) * ilMultiplier;
  const max = recommended * 1.5; // Max is 50% higher than recommended

  return {
    recommendedSize: recommended,
    maxSize: Math.min(max, totalPortfolio * 0.20), // Never >20% in single pool
    reasoning: `Based on health (${healthScore}) and IL risk (${ilRiskLevel})`
  };
}

---

## ðŸŽ¯ Success Metrics

**User Engagement:**
- Time spent on platform (target: +40%)
- Pools joined per user (target: 2.5 average)
- Return visits (target: 3x per week)

**Advisor Effectiveness:**
- IL events avoided (compare to non-advised users)
- Fee collection frequency
- Out-of-range duration minimized
- User satisfaction surveys

**Visual Appeal:**
- User delight feedback
- Screenshot sharing on social media
- Mobile vs desktop usage

---

## ðŸš€ Launch Strategy

### Beta Testing (2 weeks)
- 50 power users
- Gather feedback on theme
- Validate advisor recommendations
- Iterate on UX

### Public Launch
- Blog post: "PoolParty 2.0: The Fun Way to DeFi"
- Video walkthrough of new features
- Twitter thread with screenshots
- Partnership announcements

---

## ðŸ“ Open Questions

1. Should we add sound effects? (Toggle option)
2. Dark mode adaptations for water theme?
3. Seasonal themes (winter = ice skating rink)?
4. Gamification: Badges for good LP strategies?
5. Social features: Share your pool party stats?

---

## ðŸ”— References & Research Foundation

### Primary Research Document
ðŸ“„ **[ADVISOR_RESEARCH_SOURCE.md](./ADVISOR_RESEARCH_SOURCE.md)** - Comprehensive 57,000+ word DeFi LP strategy research covering:
- Executive summary of LP strategies across 5 chains
- Pool screener framework with 20-pool shortlist
- 8 sources of LP edge (concentrated range precision, active rebalancing, liquidity mining, stablecoin mean-reversion, etc.)
- Detailed IL/LVR mathematics with break-even analysis
- Position construction blueprints for 4 different pool types
- Risk management frameworks and failure mode analysis
- MEV protection strategies
- Due diligence checklists
- Tooling and automation recommendations

### Integration Status
âœ… **Phase 1 Complete** (October 17, 2025): All key metrics, formulas, and thresholds from research integrated into this planning document:
- Exact IL formulas and break-even tables
- Volume-to-TVL scoring thresholds (>1.0 = excellent, <0.1 = poor)
- Range width calculations for blue-chip (Â±8%), stable (Â±0.2%), and long-tail (Â±80%) pairs
- Exit triggers: Depeg >0.5%, volatility >100%, out of range >7 days, PnL vs HODL <-5%
- Rebalancing logic: Out of range, approaching edge (5%), drift (25% of range), or fees >2%
- Position sizing: Max 20% in single pool, scaled by health score and IL risk
- Fee tier matrix: Stable (0.01%), correlated (0.05%), blue-chip (0.3%), exotic (1%)

### External References
- [Uniswap V3 Whitepaper](https://uniswap.org/whitepaper-v3.pdf) - Concentrated liquidity mechanics
- [Trail of Bits Audit](https://github.com/Uniswap/v3-core/blob/main/audits/tob/audit.pdf) - Uniswap V3 security
- [DeFi Scientist - Rebalancing Strategies](https://medium.com/@DeFiScientist/rebalancing-vs-passive-strategies-for-uniswap-v3-liquidity-pools-754f033bdabc) - Active vs passive LP analysis
- [Emergent Mind - CLMM Research](https://www.emergentmind.com/topics/concentrated-liquidity-market-makers-clmms) - Concentrated liquidity academic papers
- [Uniswap Blog - JIT Liquidity](https://blog.uniswap.org/jit-liquidity) - MEV and just-in-time liquidity
- [Coinbase Learn - IL Guide](https://www.coinbase.com/learn/crypto-glossary/what-is-impermanent-loss) - Educational IL resources

### Implementation Priorities

**Critical Path (Weeks 1-4):**
1. Implement IL calculation engine with exact research formulas
2. Build Volume-to-TVL scoring (>1.0 = 10/10, >0.5 = 9/10, etc.)
3. Create range optimization algorithms (Â±2Ïƒ for volatile, Â±0.2% for stable)
4. Deploy exit trigger monitoring (depeg, volatility, out-of-range, PnL)

**High Value (Weeks 5-6):**
5. Rebalancing decision engine with multi-factor triggers
6. Pool screening framework with entry/exit criteria
7. Fee tier recommendation matrix
8. Position sizing calculator (health score Ã— IL risk multiplier)

**Polish (Weeks 7-8):**
9. Integrate all metrics into pool party theme UI
10. Create interactive tooltips with specific thresholds
11. Build notification system with research-based alerts
12. Add advisor confidence scores and explanations

---

## ðŸ“‹ Implementation Checklist

**Phase 1: Theme Foundation & Basic Health Scoring** âœ… **COMPLETE**
- [x] Extract IL formulas and break-even tables
- [x] Define Volume-to-TVL thresholds
- [x] Specify range width calculations
- [x] Document exit triggers
- [x] Create risk threshold matrix
- [x] Implement Pool Party color palette and design tokens
- [x] Create CSS animations (wave, ripple, splash, float, shimmer)
- [x] Build mobile-first PositionCard component
- [x] Implement basic 4-factor health scoring algorithm
- [x] Create collapsible UI with health breakdown
- [x] Redesign WalletPositions page with Pool Party theme

**Phase 2: Advanced Advisor Metrics** â³ **NEXT**
- [ ] Create `src/lib/advisor/impermanentLoss.ts` - IL calculations and risk assessment
- [ ] Create `src/lib/advisor/volumeAnalysis.ts` - Volume-to-TVL scoring
- [ ] Create `src/lib/advisor/rangeOptimization.ts` - Optimal range calculations
- [ ] Create `src/lib/advisor/exitTriggers.ts` - Exit trigger detection
- [ ] Create `src/lib/advisor/poolScreening.ts` - Pool safety scoring
- [ ] Create `src/components/advisor/PoolRating.tsx` - Pool health badges
- [ ] Create `src/components/advisor/MetricTooltip.tsx` - Educational tooltips
- [ ] Create `src/components/advisor/AdvisorBadge.tsx` - Status badges

**Phase 3: UI Integration & Conditional Formatting** ðŸ“… **PLANNED**
- [ ] Add health score badges to pool cards (dashboard)
- [ ] Implement warning overlays for risky pools
- [ ] Create exit trigger notifications
- [ ] Build range efficiency visualizations
- [ ] Add IL forecast tooltips
- [ ] Color-coded pool cards based on health
- [ ] Pulsing animations for critical warnings
- [ ] Dashboard filtering by health score

**Phase 4: Notification System** ðŸ“… **PLANNED**
- [ ] Build real-time position monitoring
- [ ] Create notification infrastructure
- [ ] Implement critical alert system (out of range, depeg, etc.)
- [ ] Add warning alerts (approaching edge, profitability, gas optimization)
- [ ] Create info alerts (fee collection, opportunities, weekly summaries)
- [ ] Build notification preferences UI

**Phase 5: Testing & Validation** ðŸ“… **PLANNED**
- [ ] Backtest IL calculations against historical data
- [ ] Validate exit triggers with past depeg events
- [ ] Test range recommendations on live pools
- [ ] User acceptance testing with power users
- [ ] Performance optimization for real-time monitoring
- [ ] Mobile Chrome Android device testing
- [ ] E2E tests for advisor features

---

## ðŸ“ Quick Reference: What's Done vs What's Next

**âœ… DONE (Phase 1):**
- Pool Party theme (aqua blues, lifeguard colors)
- Mobile-first UI (Chrome Android optimized)
- Collapsible position cards
- Real health scoring (4 factors)
- CSS animations (water effects)
- Dark mode support

**â³ NEXT (Phase 2 - Start Here):**
1. Create `src/lib/advisor/impermanentLoss.ts`
   - Implement formulas from lines 1787-1853 of this document
   - Add IL risk assessment function
   - Add volume-to-offset-IL calculator

2. Create `src/lib/advisor/volumeAnalysis.ts`
   - Implement scoring from lines 1857-1903
   - Add Volume-to-TVL ratio classification

3. Create `src/lib/advisor/rangeOptimization.ts`
   - Implement range calculators from lines 1907-1999
   - Add range efficiency evaluation

**ðŸ“‹ Development Workflow:**
1. Read the function specifications in this document
2. Implement in TypeScript with proper types
3. Write unit tests
4. Integrate with existing health scoring
5. Test in dev environment (http://localhost:3004)

**ðŸ”— Key Document Sections:**
- Lines 1787-1853: IL Calculations
- Lines 1857-1903: Volume-to-TVL Ratio Analysis
- Lines 1907-1999: Range Width Optimization
- Lines 2003-2086: Exit Triggers & Warning Thresholds
- Lines 2090-2156: Rebalancing Decision Logic
- Lines 2160-2227: Pool Selection Framework
- Lines 2231-2284: Fee Tier Selection Matrix
- Lines 2288-2305: Risk Thresholds Summary

---



### Session Log (latest)
- Added poolId to wallet positions API for IL/V:TVL plumbing
- V:TVL AdvisorBadge live on PoolsTable
- Pre-push build checker in place

