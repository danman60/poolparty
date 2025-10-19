# PoolParty - Implementation Quickstart

## Project Context

**Location:** `D:\OpenAICodex\PoolParty`
**Goal:** Complete Phases 3-5 of Pool Party Theme & Advisor Feature Plan
**Plan Document:** `docs\POOL_PARTY_THEME_AND_ADVISOR_PLAN.md`

---

## Current Status (As of Oct 18, 2025)

### ✅ COMPLETED:

**Phase 1 - Theme Foundation (100%)**
- Pool Party aqua blue theme (`src/app/globals.css` - 388 lines)
- CSS animations (wave, ripple, splash, float, shimmer)
- Mobile-first responsive design
- Health scoring system (`src/lib/lifeguard/healthScore.ts`)
- Position cards with collapsible UI (`src/components/PositionCard.tsx`)

**Phase 2 - Advisor Metrics Engine (100%)**
- ✅ `src/lib/advisor/impermanentLoss.ts` + tests (6 passing)
- ✅ `src/lib/advisor/volumeAnalysis.ts` + tests (2 passing)
- ✅ `src/lib/advisor/volumeToTvl.ts`
- ✅ `src/lib/advisor/rangeOptimization.ts` + tests (3 passing)
- ✅ `src/lib/advisor/exitTriggers.ts` + tests (4 passing)
- ✅ `src/lib/advisor/poolScreening.ts` + tests (2 passing)
- ✅ `src/lib/advisor/feeTier.ts` + tests (4 passing)
- ✅ All UI components: AdvisorBadge, PoolRating, MetricTooltip, HealthBar, etc.
- ✅ Test coverage: 30/30 tests passing

**Phase 3 - Conditional Formatting (~70%)**
- ✅ Rating column on dashboard
- ✅ Min rating filter (Good+, Excellent)
- ✅ Sortable columns
- ✅ Health breakdown display
- ✅ Advisor tips (WalletAdvisor, PositionAdvisor)

**Phase 5 - Testing (~30%)**
- ✅ Unit tests for all advisor modules
- ✅ E2E tests for dashboard features
- ✅ Build validation (pre-push hook)

### ⏳ TODO (THIS SESSION):

**Phase 3 - Remaining (30%)**
- [ ] Pulsing animations for critical warnings
- [ ] Health bars on dashboard table rows
- [ ] Risk overlay badges (depeg, out-of-range, stop-loss)

**Phase 4 - Notification System (100%)**
- [ ] `src/lib/notifications/monitor.ts`
- [ ] `src/lib/notifications/templates.ts`
- [ ] `src/components/NotificationCenter.tsx`
- [ ] `src/components/NotificationToast.tsx`
- [ ] Alert trigger integration

**Phase 5 - Polish (70%)**
- [ ] Performance optimizations
- [ ] Animation refinement
- [ ] Final testing & validation

---

## Build Status

```bash
✅ Build: Passing
✅ Tests: 30/30 passing (12 test files)
✅ TypeScript: No errors
✅ Linting: Clean
```

---

## Task Sequence (Start Here)

### 1. Add Pulsing CSS Animations
**File:** `src/app/globals.css`

Add keyframe animation for warnings:
```css
@keyframes pulse-warning {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}

.badge-danger.pulse, .badge-critical.pulse {
  animation: pulse-warning 2s ease-in-out infinite;
}
```

### 2. Add HealthBar to Dashboard Table
**File:** `src/components/PoolsTable.tsx`

- Import HealthBar component
- Add mini HealthBar after rating badge in each row
- Show only when rating data available

### 3. Create RiskBadge Component
**File:** `src/components/advisor/RiskBadge.tsx` (NEW)

Component for:
- Depeg warnings (uses `exitTriggers.detectStablecoinDepeg`)
- Out-of-range indicators (uses `exitTriggers.outOfRangeDuration`)
- Stop-loss alerts (uses `exitTriggers.pnlVsHodlStopLoss`)

### 4. Notification System
**Files to create:**
- `src/lib/notifications/monitor.ts` - Position monitoring logic
- `src/lib/notifications/templates.ts` - Alert message templates
- `src/components/NotificationCenter.tsx` - Alert inbox UI
- `src/components/NotificationToast.tsx` - Toast component

**Integration points:**
- Use `exitTriggers` for alert conditions
- Use `ToastProvider` from `src/components/ToastProvider.tsx`
- Store notifications in localStorage or React state

### 5. Polish & Validate
- Run `npm run build` after each phase
- Run `npm test` to ensure tests pass
- Test in browser at `http://localhost:3000`

---

## Key Technical Constraints

### Code Style:
- **NO EMOJIS in code** (UTF-8 issues resolved, use ASCII only)
- Use existing Pool Party CSS variables (see `globals.css`)
- Mobile-first design (44px touch targets)
- TypeScript strict mode
- Follow existing component patterns

### CSS Variables Available:
```css
--pool-aqua: #00D4FF
--pool-aqua-light: #33E0FF
--pool-lime: #32CD32
--lifeguard-excellent: #10b981
--lifeguard-good: #3b82f6
--lifeguard-warning: #f59e0b
--lifeguard-danger: #ef4444
--lifeguard-critical: #dc2626
```

### Testing:
- Add unit tests for new modules (vitest)
- Use existing test patterns in `src/lib/advisor/*.test.ts`
- E2E tests optional but recommended

### Build Validation:
```bash
npm run build   # Must pass
npm test        # Must pass (30/30)
npm run dev     # Test locally
```

---

## Important File Locations

**Advisor Modules:**
- `src/lib/advisor/*.ts` - All 7 modules complete with tests

**Health Scoring:**
- `src/lib/lifeguard/healthScore.ts` - 4-factor algorithm

**UI Components:**
- `src/components/advisor/*.tsx` - 15+ components
- `src/components/PositionCard.tsx` - Position UI
- `src/components/WalletPositions.tsx` - Wallet page
- `src/components/PoolsTable.tsx` - Dashboard table

**Theme:**
- `src/app/globals.css` - All CSS variables and animations

**Plan:**
- `docs/POOL_PARTY_THEME_AND_ADVISOR_PLAN.md` - Full specification

---

## Reference: Plan Document Key Sections

- **Lines 1787-1853:** IL Calculations (IMPLEMENTED)
- **Lines 1857-1903:** Volume-to-TVL Ratio (IMPLEMENTED)
- **Lines 1907-1999:** Range Width Optimization (IMPLEMENTED)
- **Lines 2003-2086:** Exit Triggers (IMPLEMENTED)
- **Lines 2090-2156:** Rebalancing Logic (PARTIALLY USED)
- **Lines 1191-1233:** Conditional Formatting Spec
- **Lines 1236-1347:** Notification System Spec

---

## Quick Commands

```bash
# Navigate to project
cd D:\OpenAICodex\PoolParty

# Install (if needed)
npm ci

# Run dev server
npm run dev

# Run tests
npm test

# Build
npm run build

# Run E2E tests
npm run test:e2e
```

---

## Expected Outcomes

By end of session:
- Phase 3: 100% ✅
- Phase 4: 100% ✅
- Phase 5: ~50% (code complete)
- Overall: ~85-90% project completion
- All tests passing
- Build green
- Production-ready notification system

---

## First Action

**START HERE:**

1. Open `src/app/globals.css`
2. Add pulse animation keyframes (see Task Sequence #1 above)
3. Test animation by temporarily adding `.pulse` class to a badge
4. Proceed to Task #2 (HealthBar in table)

---

## Notes

- Build is currently green, don't break it
- UTF-8/emoji issues have been resolved, keep it ASCII
- Pre-push hook validates build automatically
- All Phase 2 modules have excellent test coverage - maintain this standard
- Mobile-first: test on small screens
- Use existing ToastProvider, don't create new toast system

---

**Good luck! The foundation is solid, just need the final features.** 🚀
